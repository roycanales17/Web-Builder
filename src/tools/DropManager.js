import { sanitize } from './Serializer.js';

/** dataTransfer type used for blocks / templates dragged from the side panels. */
export const BLOCK_MIME = 'application/x-wb-block';

/** Pixels near the top/bottom edge of a container that target its parent instead. */
const EDGE_BAND = 8;

/** Elements that can never hold text editing (void elements / form widgets). */
const NON_TEXT_TAGS = new Set(['INPUT', 'IMG', 'HR', 'BR', 'VIDEO', 'AUDIO', 'IFRAME', 'SELECT', 'TEXTAREA', 'svg']);

/** Classes that describe transient editor state and must not be recorded in history. */
const TRANSIENT_CLASSES = ['drop-target-highlight', 'wb-selected'];

class DropManager {
	constructor(rootId) {
		this.parentRoot = document.getElementById(rootId);
		if (!this.parentRoot) throw new Error(`Missing parent root: ${rootId}`);

		this.iframe = document.getElementById(`${rootId}-iframe`);
		if (!this.iframe) throw new Error(`Missing iframe: ${rootId}-iframe`);

		this.skeletonId = `${rootId}-skeleton`;

		this.doc = null;
		this.skeletonTemplate = null;
		this.dropLine = null;
		this.highlightedZone = null;
		this.draggedElement = null;
		this.selected = null;
		this.editingElement = null;
		this.structureIdCounter = 0;

		this.listeners = { structure: [], change: [], select: [], clone: [], create: [] };

		this.ready = new Promise(resolve => { this._resolveReady = resolve; });

		document.addEventListener('dragend', () => this._endDrag());

		// The iframe may still hold its initial about:blank document at this point,
		// so only initialise once the real canvas document has loaded.
		if (this._iframeLoaded()) {
			this._setupIframe();
		} else {
			this.iframe.addEventListener('load', () => this._setupIframe(), { once: true });
		}
	}

	_iframeLoaded() {
		const doc = this.iframe.contentDocument;
		return !!(doc && doc.body && doc.readyState === 'complete' && doc.URL !== 'about:blank');
	}

	_setupIframe() {
		this.doc = this.iframe.contentDocument;

		const skeleton = this.doc.getElementById(this.skeletonId);
		if (skeleton) this.skeletonTemplate = skeleton.cloneNode(true);

		this.dropLine = this.doc.createElement('div');
		this.dropLine.id = 'drop-line';
		this.dropLine.setAttribute('data-editor', '');
		this.doc.body.appendChild(this.dropLine);

		this.doc.body.classList.add('droppable');

		const on = (type, handler, options) => this.doc.addEventListener(type, handler.bind(this), options);
		on('dragstart', this._onDragStart);
		on('dragover', this._onDragOver);
		on('dragleave', this._onDragLeave);
		on('drop', this._onDrop);
		on('dragend', this._endDrag);
		on('click', this._onClick);
		on('dblclick', this._onDoubleClick);
		on('keydown', this._onKeyDown);
		on('focusout', this._onFocusOut);
		on('submit', e => e.preventDefault(), true);

		this._normalize();
		this.updateSkeleton();
		this._resolveReady(this);
	}

	// ------------------------------------------------------------------ events

	on(type, fn) {
		this.listeners[type].push(fn);
	}

	_emit(type, ...args) {
		this.listeners[type].forEach(fn => fn(...args));
	}

	onStructureChange(fn) {
		this.on('structure', fn);
		if (this.doc) fn(this.getStructure());
	}

	onSelect(fn) {
		this.on('select', fn);
	}

	/** Called after every user mutation; used for history + autosave. */
	onChange(fn) {
		this.on('change', fn);
	}

	/** Called with (element, spec) whenever a block is created from a panel spec. */
	onCreate(fn) {
		this.on('create', fn);
	}

	/** Called with (source, copy) pairs whenever elements are duplicated. */
	onClone(fn) {
		this.on('clone', fn);
	}

	/**
	 * Refresh everything that depends on the canvas content and (optionally)
	 * record the new state.
	 */
	commit({ record = true } = {}) {
		if (!this.doc) return;
		this.updateSkeleton();
		this._emit('structure', this.getStructure());
		if (record) this._emit('change');
	}

	// --------------------------------------------------------------- content

	updateSkeleton() {
		if (!this.doc) return;

		const hasContent = Array.from(this.doc.body.children).some(c => this._isContentNode(c));
		const live = this.doc.getElementById(this.skeletonId);

		if (hasContent && live) {
			live.remove();
		} else if (!hasContent && !live && this.skeletonTemplate) {
			this.doc.body.insertBefore(this.skeletonTemplate.cloneNode(true), this.doc.body.firstChild);
		}
	}

	/** Body children owned by the editor (drop line, generated styles…), never page content. */
	_editorNodes() {
		return Array.from(this.doc.body.children).filter(c => c.hasAttribute('data-editor'));
	}

	_isContentNode(el) {
		if (el.id === this.skeletonId || el.hasAttribute('data-editor')) return false;
		return !['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE'].includes(el.tagName);
	}

	/** Make sure editor markers exist on (re)loaded content and IDs are unique. */
	_normalize() {
		const body = this.doc.body;
		body.classList.add('droppable');
		body.querySelectorAll('[data-dropzone]').forEach(z => z.classList.add('droppable'));
		body.querySelectorAll('[data-buffer]').forEach(b => b.setAttribute('draggable', 'true'));

		const seen = new Set();
		body.querySelectorAll('[data-structure-id]').forEach(el => {
			const id = el.dataset.structureId;
			const match = /^node-(\d+)$/.exec(id);
			if (match) this.structureIdCounter = Math.max(this.structureIdCounter, Number(match[1]));
			if (seen.has(id)) delete el.dataset.structureId;
			seen.add(id);
		});
	}

	ensureId(el) {
		if (!el.dataset.structureId) {
			el.dataset.structureId = `node-${++this.structureIdCounter}`;
		}
		return el.dataset.structureId;
	}

	findById(id) {
		if (!this.doc || !id) return null;
		return this.doc.body.querySelector(`[data-structure-id="${CSS.escape(id)}"]`);
	}

	/** Serialized page content (body only), without transient editor state. */
	getContentHTML() {
		if (!this.doc) return '';
		this._finishTextEditing(false);
		this.getStructure(); // assigns IDs so styles survive a reload
		const clone = this.doc.body.cloneNode(true);
		clone.querySelectorAll(`#${this.skeletonId}, [data-editor]`).forEach(n => n.remove());
		clone.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
		clone.querySelectorAll('[class]').forEach(n => {
			n.classList.remove(...TRANSIENT_CLASSES);
			if (!n.classList.length) n.removeAttribute('class');
		});
		return clone.innerHTML.trim();
	}

	/** Replace the page content (undo/redo, page switch, import). */
	setContentHTML(html, { sanitizeInput = false } = {}) {
		if (!this.doc) return;
		const selectedId = this.selected?.dataset.structureId;
		this.select(null);
		this.editingElement = null;

		const template = this.doc.createElement('template');
		template.innerHTML = html || '';
		if (sanitizeInput) sanitize(template.content);

		this.doc.body.replaceChildren(template.content, ...this._editorNodes());
		this._normalize();
		this.commit({ record: false });
		if (selectedId) this.select(this.findById(selectedId));
	}

	/**
	 * Build a block element from a panel spec:
	 * { label, type, content, container, kind: 'block' | 'template', id }
	 */
	createBlock(spec) {
		const html = (spec.content || '').replace(/\{\{uid\}\}/g, () => Math.random().toString(36).slice(2, 8));
		const template = this.doc.createElement('template');
		template.innerHTML = html.trim();
		sanitize(template.content);

		let el;
		const roots = Array.from(template.content.children);
		if (spec.kind === 'template' || roots.length > 1) {
			el = this.doc.createElement('div');
			el.append(template.content);
		} else if (roots.length === 1) {
			el = roots[0];
		} else {
			const tag = /^[a-z][a-z0-9-]*$/i.test(spec.type || '') ? spec.type : 'div';
			el = this.doc.createElement(tag);
			el.textContent = spec.label || '';
		}

		el.setAttribute('data-buffer', JSON.stringify({
			label: spec.label || el.tagName.toLowerCase(),
			type: spec.kind === 'template' ? 'template' : (spec.type || el.tagName.toLowerCase()),
			context: spec.id || spec.context || '',
		}));
		el.setAttribute('draggable', 'true');
		if (spec.container) el.classList.add('droppable');
		el.querySelectorAll('[data-dropzone]').forEach(z => z.classList.add('droppable'));
		this._emit('create', el, spec);
		return el;
	}

	// --------------------------------------------------------------- mutations

	insertSorted(container, el, ref = null, position = null) {
		if (!container || !el) return false;
		if (el === container || el.contains(container)) {
			console.warn('Cannot insert an element into itself or one of its children.');
			return false;
		}
		if (ref === el) return false;

		if (ref && ref.parentElement === container) {
			if (position === 'above' || position === 'left') ref.before(el);
			else ref.after(el);
		} else {
			// Keep page content ahead of the editor-owned nodes at the end of <body>.
			const tail = container === this.doc.body ? this._editorNodes()[0] : null;
			container.insertBefore(el, tail || null);
		}

		this.commit();
		return true;
	}

	/**
	 * Click-to-add: put a new block inside the selected container, after the
	 * selected block, or at the end of the page.
	 */
	insertAtSelection(el) {
		const selected = this.selected;
		let inserted;
		if (selected && selected.classList.contains('droppable')) {
			inserted = this.insertSorted(selected, el);
		} else if (selected) {
			const block = selected.closest('[data-buffer]') || selected;
			inserted = this.insertSorted(block.parentElement, el, block, 'below');
		} else {
			inserted = this.insertSorted(this.doc.body, el);
		}
		if (inserted) {
			this.select(el);
			el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
		return inserted;
	}

	removeElement(el) {
		if (!el || !this.doc.body.contains(el) || el === this.doc.body) return;
		if (this.selected && el.contains(this.selected)) this.select(null);
		el.remove();
		this.commit();
	}

	duplicateElement(el) {
		if (!el || !this.doc.body.contains(el) || el === this.doc.body) return null;

		const copy = el.cloneNode(true);
		const sources = [el, ...el.querySelectorAll('[data-structure-id]')];
		const copies = [copy, ...copy.querySelectorAll('[data-structure-id]')];
		copies.forEach(node => {
			node.classList.remove(...TRANSIENT_CLASSES);
			node.removeAttribute('contenteditable');
			delete node.dataset.structureId;
		});

		el.after(copy);
		sources.forEach((src, i) => {
			if (src.dataset.structureId) {
				this.ensureId(copies[i]);
				this._emit('clone', src, copies[i]);
			}
		});

		this.commit();
		this.select(copy);
		return copy;
	}

	/** Move a block before/after its previous/next block sibling. */
	moveElement(el, direction) {
		if (!el || !el.parentElement) return false;
		const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-buffer'));
		const index = siblings.indexOf(el);
		const target = siblings[index + (direction === 'up' ? -1 : 1)];
		if (!target) return false;

		if (direction === 'up') target.before(el);
		else target.after(el);
		this.commit();
		return true;
	}

	/** The element new children should be appended to when dropping "inside" a block. */
	dropZoneFor(el) {
		if (!el) return null;
		return el.classList.contains('droppable') ? el : el.querySelector('.droppable');
	}

	// --------------------------------------------------------------- selection

	select(el) {
		if (el && (!this.doc || !this.doc.body.contains(el) || el === this.doc.body)) el = null;
		if (this.selected === el) return;

		if (this.selected) {
			this.selected.classList.remove('wb-selected');
			if (!this.selected.classList.length) this.selected.removeAttribute('class');
		}
		this.selected = el;
		if (el) el.classList.add('wb-selected');
		this._emit('select', el);
	}

	_onClick(e) {
		const target = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		if (!target || target.isContentEditable) return;

		// Links and buttons inside the canvas should not navigate / submit.
		if (target.closest('a, button')) e.preventDefault();

		// First click selects the block; clicking again inside the selection drills
		// down to the exact element (e.g. a button inside a template).
		const block = target.closest('[data-buffer]');
		const drillDown = this.selected && block && block.contains(this.selected) && this.selected.contains(target);
		this.select(drillDown ? target : block);
	}

	// ------------------------------------------------------------ text editing

	_onDoubleClick(e) {
		const el = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		if (!el || !el.closest('[data-buffer]') || !this._isTextEditable(el)) return;
		e.preventDefault();
		this.startTextEditing(el);
	}

	_isTextEditable(el) {
		if (NON_TEXT_TAGS.has(el.tagName) || el.classList.contains('droppable')) return false;
		const blocking = Array.from(NON_TEXT_TAGS).filter(tag => tag !== 'BR').join(',');
		if (el.querySelector(`[data-buffer], .droppable, ${blocking}`)) return false;
		return el.textContent.trim().length > 0;
	}

	startTextEditing(el) {
		this._finishTextEditing();
		const block = el.closest('[data-buffer]');
		if (!this.selected || !this.selected.contains(el)) this.select(el);

		this.editingElement = el;
		block.setAttribute('draggable', 'false');
		el.setAttribute('contenteditable', 'true');
		el.focus();
	}

	_finishTextEditing(record = true) {
		const el = this.editingElement;
		if (!el) return;
		this.editingElement = null;

		el.removeAttribute('contenteditable');
		const block = el.closest('[data-buffer]');
		if (block) block.setAttribute('draggable', 'true');
		if (record) this.commit();
	}

	_onFocusOut(e) {
		if (this.editingElement && e.target === this.editingElement) this._finishTextEditing();
	}

	_onKeyDown(e) {
		if (this.editingElement) {
			if (e.key === 'Escape') {
				e.preventDefault();
				this.editingElement.blur();
			}
			return;
		}

		const t = e.target;
		if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

		if ((e.key === 'Delete' || e.key === 'Backspace') && this.selected) {
			e.preventDefault();
			this.removeElement(this.selected);
		} else if (e.key === 'Escape') {
			this.select(null);
		}
	}

	// ------------------------------------------------------------- drag & drop

	_onDragStart(e) {
		const target = e.target.nodeType === 1 ? e.target : null;
		const block = target && target.closest('[data-buffer]');
		if (!block || block.isContentEditable) return;

		this.draggedElement = block;
		e.dataTransfer.effectAllowed = 'move';
		// Firefox only starts a drag when some data is set.
		e.dataTransfer.setData('text/plain', '');
	}

	_isNewBlockDrag(e) {
		return Array.from(e.dataTransfer?.types || []).includes(BLOCK_MIME);
	}

	/**
	 * Work out where a drop at the event's position would go.
	 * Returns { zone, ref, position } or null when dropping is not allowed.
	 */
	_resolveDropTarget(e) {
		const isNew = this._isNewBlockDrag(e);
		const dragged = isNew ? null : this.draggedElement;
		if (!isNew && !dragged) return null;

		const node = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		let zone = node && node.closest('.droppable');
		while (zone && dragged && dragged.contains(zone)) {
			zone = zone.parentElement && zone.parentElement.closest('.droppable');
		}
		if (!zone) return null;

		// Near the edge of a container block: insert next to it instead of inside it.
		if (zone !== this.doc.body && zone.hasAttribute('data-buffer')) {
			const rect = zone.getBoundingClientRect();
			const nearTop = e.clientY - rect.top < EDGE_BAND;
			const nearBottom = rect.bottom - e.clientY < EDGE_BAND;
			const parentZone = zone.parentElement && zone.parentElement.closest('.droppable');
			if ((nearTop || nearBottom) && parentZone) {
				let ref = zone;
				while (ref.parentElement !== parentZone) ref = ref.parentElement;
				return { zone: parentZone, ref, position: nearTop ? 'above' : 'below' };
			}
		}

		const children = Array.from(zone.children).filter(c => c !== dragged && this._isContentNode(c));
		if (!children.length) return { zone, ref: null, position: null };

		const x = e.clientX;
		const y = e.clientY;
		let closestX = null;
		let closestY = null;
		let minXDist = Infinity;
		let minYDist = Infinity;

		for (const child of children) {
			const rect = child.getBoundingClientRect();
			if (y >= rect.top && y <= rect.bottom) {
				const dist = Math.abs(x - (rect.left + rect.width / 2));
				if (dist < minXDist) { minXDist = dist; closestX = { el: child, rect }; }
			}
			if (x >= rect.left && x <= rect.right) {
				const dist = Math.abs(y - (rect.top + rect.height / 2));
				if (dist < minYDist) { minYDist = dist; closestY = { el: child, rect }; }
			}
		}

		if (closestX && (!closestY || minYDist > 10)) {
			const { el, rect } = closestX;
			return { zone, ref: el, position: x < rect.left + rect.width / 2 ? 'left' : 'right' };
		}
		if (closestY) {
			const { el, rect } = closestY;
			return { zone, ref: el, position: y < rect.top + rect.height / 2 ? 'above' : 'below' };
		}
		return { zone, ref: null, position: null };
	}

	_onDragOver(e) {
		const target = this._resolveDropTarget(e);
		if (!target) {
			this._clearIndicators();
			return;
		}

		e.preventDefault();
		e.dataTransfer.dropEffect = this._isNewBlockDrag(e) ? 'copy' : 'move';
		this.doc.body.classList.add('wb-dragging');

		if (target.ref) {
			this._highlightZone(null);
			this.showDropLine(target.ref, target.position);
		} else {
			this.hideDropLine();
			this._highlightZone(target.zone);
		}
	}

	_onDragLeave(e) {
		// relatedTarget is null when the pointer leaves the iframe entirely.
		if (!e.relatedTarget) this._clearIndicators();
	}

	_onDrop(e) {
		e.preventDefault();
		const target = this._resolveDropTarget(e);
		const raw = e.dataTransfer.getData(BLOCK_MIME);
		const dragged = this.draggedElement;
		this._endDrag();
		if (!target) return;

		let el = dragged;
		if (raw) {
			try {
				el = this.createBlock(JSON.parse(raw));
			} catch (err) {
				console.warn('Invalid block payload.', err);
				return;
			}
		}

		if (this.insertSorted(target.zone, el, target.ref, target.position)) {
			this.select(el);
		}
	}

	_endDrag() {
		this._clearIndicators();
		if (this.doc) this.doc.body.classList.remove('wb-dragging');
		this.draggedElement = null;
	}

	_clearIndicators() {
		this.hideDropLine();
		this._highlightZone(null);
	}

	_highlightZone(zone) {
		if (this.highlightedZone === zone) return;
		if (this.highlightedZone) this.highlightedZone.classList.remove('drop-target-highlight');
		this.highlightedZone = zone;
		if (zone) zone.classList.add('drop-target-highlight');
	}

	showDropLine(targetEl, position = 'below') {
		if (!this.dropLine || !targetEl) return;

		const box = targetEl.getBoundingClientRect();
		const bodyRect = this.doc.body.getBoundingClientRect();
		const left = box.left - bodyRect.left;
		const top = box.top - bodyRect.top;
		const style = this.dropLine.style;

		style.display = 'block';
		if (position === 'above' || position === 'below') {
			style.width = `${box.width}px`;
			style.height = '2px';
			style.left = `${Math.round(left)}px`;
			style.top = `${Math.round(position === 'above' ? top : top + box.height)}px`;
		} else {
			style.width = '2px';
			style.height = `${box.height}px`;
			style.top = `${Math.round(top)}px`;
			style.left = `${Math.round(position === 'left' ? left : left + box.width)}px`;
		}
	}

	hideDropLine() {
		if (this.dropLine) this.dropLine.style.display = 'none';
	}

	// ------------------------------------------------------------- debug view

	toggleBorders(status) {
		if (this.doc) this.doc.body.classList.toggle('wb-debug', Boolean(status));
	}

	togglePadding(status) {
		if (this.doc) this.doc.body.classList.toggle('wb-debug-spacing', Boolean(status));
	}

	// -------------------------------------------------------------- structure

	getStructure() {
		if (!this.doc || !this.doc.body) return [];

		const collect = node => {
			const out = [];
			for (const child of node.children) {
				if (!this._isContentNode(child)) continue;
				if (child.hasAttribute('data-buffer')) out.push(describe(child));
				else out.push(...collect(child));
			}
			return out;
		};

		const describe = el => {
			this.ensureId(el);
			let buffer = {};
			try { buffer = JSON.parse(el.getAttribute('data-buffer') || '{}'); } catch (err) {}
			return {
				tag: (buffer.type || el.tagName).toLowerCase(),
				context: buffer.context || '',
				label: buffer.label || '',
				element: el,
				container: Boolean(this.dropZoneFor(el)),
				children: collect(el),
			};
		};

		return collect(this.doc.body);
	}
}

export default function init(rootId) {
	return new DropManager(rootId);
}
