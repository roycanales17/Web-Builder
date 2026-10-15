import { sanitize } from './Serializer.js';

/** dataTransfer type used for blocks / templates dragged from the side panels. */
export const BLOCK_MIME = 'application/x-wb-block';

/** Pixels near the top/bottom edge of a container that target its parent instead. */
const EDGE_BAND = 8;

/** Elements that can never hold text editing (void elements / form widgets). */
const NON_TEXT_TAGS = new Set(['INPUT', 'IMG', 'HR', 'BR', 'VIDEO', 'AUDIO', 'IFRAME', 'SELECT', 'TEXTAREA', 'svg']);

/** Classes that describe transient editor state and must not be recorded in history. */
const TRANSIENT_CLASSES = ['drop-target-highlight', 'wb-selected'];

/** Elements inside a block or component that accept dropped elements. */
const CONTAINER_TAGS = new Set(['div', 'section', 'header', 'footer', 'main', 'article', 'aside', 'nav', 'form', 'figure', 'li', 'details', 'fieldset']);

/** Elements that are only valid inside specific parents. */
const PARENT_RULES = { li: ['ul', 'ol'] };

/** Elements that are never dragged on their own. */
const UNDRAGGABLE_TAGS = new Set(['summary', 'option', 'optgroup', 'source', 'track', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption', 'col', 'colgroup', 'legend', 'br', 'style']);

/** Inline formatting that is dragged together with its parent (text, heading…). */
const DRAG_WITH_PARENT_TAGS = new Set(['span', 'strong', 'em', 'b', 'i', 'u', 's', 'small', 'sub', 'sup', 'mark', 'code', 'time', 'abbr', 'br', 'svg', 'path']);

/** Inline elements that may appear inside text being edited in place. */
const INLINE_TAGS = new Set(['BR', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'A', 'SMALL', 'CODE', 'MARK', 'SUB', 'SUP', 'TIME', 'ABBR']);

/** Names shown for elements that become blocks when they are moved. */
const FRIENDLY_NAMES = {
	h1: 'Heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading',
	p: 'Paragraph', a: 'Link', img: 'Image', button: 'Button', ul: 'List', ol: 'List', li: 'List item',
	blockquote: 'Quote', figure: 'Figure', form: 'Form', nav: 'Menu', header: 'Header', footer: 'Footer',
	section: 'Section', article: 'Article', aside: 'Aside', div: 'Container', span: 'Text', label: 'Label',
	input: 'Input', textarea: 'Textarea', select: 'Select', video: 'Video', audio: 'Audio', iframe: 'Embed',
	details: 'Details', time: 'Time', strong: 'Text', em: 'Text', small: 'Text',
};

/** Icons for the selection toolbar (the canvas has no icon font). */
const ICONS = {
	move: '<svg viewBox="0 0 24 24"><path d="M12 2l3.5 3.5H13v5.5h5.5V8.5L22 12l-3.5 3.5V13H13v5.5h2.5L12 22l-3.5-3.5H11V13H5.5v2.5L2 12l3.5-3.5V11H11V5.5H8.5z"/></svg>',
	up: '<svg viewBox="0 0 24 24"><path d="M12 4l7 7h-5v9h-4v-9H5z"/></svg>',
	copy: '<svg viewBox="0 0 24 24"><path d="M8 2h12v14H8zM10 4v10h8V4zM4 6h2v14h10v2H4z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M9 2h6l1 2h4v2H4V4h4zM6 8h12l-1 14H7zM10 10v10h1.5V10zm2.5 0v10H14V10z"/></svg>',
};

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
		this._setupToolbar();

		const on = (type, handler, options) => this.doc.addEventListener(type, handler.bind(this), options);
		on('mousedown', e => { this._pointerTarget = e.target; }, true);
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
		clone.querySelectorAll('[draggable]:not([data-buffer])').forEach(n => n.removeAttribute('draggable'));
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
		// One id per insert: every {{uid}} must expand to the same value so that
		// radio names, ids and label[for] stay linked.
		const uid = Math.random().toString(36).slice(2, 8);
		const html = (spec.content || '').replace(/\{\{uid\}\}/g, uid);
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

	/** Append several blocks to the end of the page as one change (one undo step). */
	appendBlocks(elements) {
		if (!this.doc || !elements.length) return;
		const tail = this._editorNodes()[0] || null;
		elements.forEach(el => this.doc.body.insertBefore(el, tail));
		this.commit();
		this.select(null);
		elements[0].scrollIntoView({ block: 'start' });
	}

	/**
	 * Click-to-add: put a new block inside the selected container, after the
	 * selected block, or at the end of the page.
	 */
	insertAtSelection(el) {
		const selected = this.selected;
		let inserted;
		if (selected && !this._isTemplate(selected) && this._isZone(selected, el)) {
			inserted = this.insertSorted(selected, el);
		} else if (selected && this._isZone(selected.parentElement, el)) {
			inserted = this.insertSorted(selected.parentElement, el, selected, 'below');
		} else if (selected) {
			const block = selected.closest('[data-buffer]') || selected;
			const parent = this._closestZone(block.parentElement, el) || this.doc.body;
			inserted = this.insertSorted(parent, el, block.parentElement === parent ? block : null, 'below');
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

		this._relinkIds(copy);
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

	/**
	 * Give a copied subtree fresh element ids and radio group names (updating
	 * label[for] to match), so the copy does not hijack the original's controls.
	 */
	_relinkIds(root) {
		const suffix = Math.random().toString(36).slice(2, 6);
		const ids = new Map();
		[root, ...root.querySelectorAll('[id]')].forEach(node => {
			if (!node.id) return;
			ids.set(node.id, `${node.id}-${suffix}`);
			node.id = ids.get(node.id);
		});
		root.querySelectorAll('label[for]').forEach(label => {
			if (ids.has(label.htmlFor)) label.htmlFor = ids.get(label.htmlFor);
		});
		// Radio groups are document-wide outside forms; inside a form the name is
		// submitted data and the group is already scoped to that form.
		root.querySelectorAll('input[type="radio"][name]').forEach(input => {
			if (!input.closest('form')) input.name = `${input.name}-${suffix}`;
		});
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
		if (el.classList.contains('droppable')) return el;
		const explicit = el.querySelector('.droppable');
		if (explicit) return explicit;
		// A component: its first container (e.g. the template's <section>).
		if (this._isTemplate(el)) return Array.from(el.children).find(c => this._isZone(c, null)) || null;
		return this._isZone(el, null) ? el : null;
	}

	_bufferOf(el) {
		try { return JSON.parse(el.getAttribute('data-buffer') || '{}'); } catch (err) { return {}; }
	}

	_isTemplate(el) {
		return Boolean(el && el.hasAttribute('data-buffer') && this._bufferOf(el).type === 'template');
	}

	/** Display name for an element: its block label, or a name based on its tag. */
	labelFor(el) {
		if (el.hasAttribute('data-buffer')) {
			const label = this._bufferOf(el).label;
			if (label) return label;
		}
		return FRIENDLY_NAMES[el.localName] || el.localName;
	}

	/**
	 * Turn an element that was part of a component into a block of its own, so it
	 * shows up in the structure tree and can be selected and dragged directly.
	 */
	_promote(el) {
		if (el.hasAttribute('data-buffer')) return;
		el.setAttribute('data-buffer', JSON.stringify({ label: this.labelFor(el), type: el.localName, context: '' }));
		el.setAttribute('draggable', 'true');
		delete el.__wbTempDraggable;
	}

	// ---------------------------------------------------------------- zones

	/** Elements that must stay in a specific kind of parent (e.g. li → ul/ol). */
	_requiredParents(el) {
		return (el && PARENT_RULES[el.localName]) || null;
	}

	/** Can `dragged` (null for a new block) be dropped inside `el`? */
	_isZone(el, dragged) {
		if (!el || el.nodeType !== 1) return false;
		const required = this._requiredParents(dragged);
		if (el === this.doc.body) return !required;
		if (el.hasAttribute('data-editor') || el.id === this.skeletonId || el.isContentEditable) return false;
		// Menus that follow the page list are regenerated, so nothing can be dropped in them.
		if (el.closest('[data-nav]')) return false;
		if (required) return required.includes(el.localName);
		if (el.classList.contains('droppable')) return true;
		return CONTAINER_TAGS.has(el.localName) && Boolean(el.closest('[data-buffer]'));
	}

	/** The nearest ancestor of `node` (inclusive) that accepts `dragged`, skipping `dragged` itself. */
	_closestZone(node, dragged) {
		for (let el = node; el && el !== this.doc.documentElement; el = el.parentElement) {
			if (dragged && dragged.contains(el)) continue;
			if (this._isZone(el, dragged)) return el;
		}
		return null;
	}

	/** Does `el` share a row with one of its siblings (flex row, grid…)? */
	_inRow(el, siblings = Array.from(el.parentElement ? el.parentElement.children : [])) {
		const rect = el.getBoundingClientRect();
		return siblings.some(sibling => {
			if (sibling === el || !this._isContentNode(sibling)) return false;
			const r = sibling.getBoundingClientRect();
			const overlap = Math.min(r.bottom, rect.bottom) - Math.max(r.top, rect.top);
			return overlap > Math.min(r.height, rect.height) / 2;
		});
	}

	/**
	 * Near the edge of a container, drop next to it instead of inside it: top and
	 * bottom always, left and right when it sits in a row with siblings (cards in
	 * a grid). Nested containers often share an edge (a card inside a grid inside
	 * a section), so keep climbing while the parent's edge is under the pointer too.
	 */
	_edgeTarget(zone, e, dragged) {
		let result = null;
		for (let current = zone; current && current !== this.doc.body;) {
			const rect = current.getBoundingClientRect();
			let position = null;
			if (e.clientY - rect.top < EDGE_BAND) position = 'above';
			else if (rect.bottom - e.clientY < EDGE_BAND) position = 'below';
			else if (e.clientX - rect.left < EDGE_BAND && this._inRow(current)) position = 'left';
			else if (rect.right - e.clientX < EDGE_BAND && this._inRow(current)) position = 'right';
			if (!position) break;

			const parentZone = this._closestZone(current.parentElement, dragged);
			if (!parentZone) break;
			let ref = current;
			while (ref.parentElement !== parentZone) ref = ref.parentElement;
			if (ref === dragged) break;

			result = { zone: parentZone, ref, position };
			current = parentZone;
		}
		return result;
	}

	// --------------------------------------------------------------- selection

	select(el) {
		if (el && (!this.doc || !this.doc.body.contains(el) || el === this.doc.body)) el = null;
		if (this.selected === el) return;

		const previous = this.selected;
		if (previous) {
			previous.classList.remove('wb-selected');
			if (!previous.classList.length) previous.removeAttribute('class');
			if (previous.__wbTempDraggable) {
				previous.removeAttribute('draggable');
				delete previous.__wbTempDraggable;
			}
		}

		this.selected = el;
		if (el) {
			el.classList.add('wb-selected');
			// Selected elements inside components can be dragged on their own.
			if (!el.hasAttribute('draggable') && !UNDRAGGABLE_TAGS.has(el.localName)) {
				el.setAttribute('draggable', 'true');
				el.__wbTempDraggable = true;
			}
		}
		this._updateToolbar();
		this._emit('select', el);
	}

	/** Select the parent of the current selection (stops below <body>). */
	selectParent() {
		const parent = this.selected && this.selected.parentElement;
		if (parent && parent !== this.doc.body) this.select(parent);
	}

	// ------------------------------------------------------------ toolbar

	/** Floating toolbar on the selected element: drag handle, parent, duplicate, delete. */
	_setupToolbar() {
		const bar = this.doc.createElement('div');
		bar.id = 'wb-toolbar';
		bar.setAttribute('data-editor', '');
		bar.innerHTML = `
			<span class="wb-tb-move" draggable="true" title="Drag to move">${ICONS.move}<span class="wb-tb-label"></span></span>
			<button type="button" data-action="parent" title="Select parent">${ICONS.up}</button>
			<button type="button" data-action="duplicate" title="Duplicate">${ICONS.copy}</button>
			<button type="button" data-action="delete" title="Delete">${ICONS.trash}</button>
		`;
		bar.addEventListener('click', e => {
			e.preventDefault();
			e.stopPropagation();
			const action = e.target.closest('[data-action]')?.dataset.action;
			const el = this.selected;
			if (!el || !action) return;
			if (action === 'parent') this.selectParent();
			else if (action === 'duplicate') this.duplicateElement(el);
			else if (action === 'delete') this.removeElement(el);
		});
		bar.addEventListener('dblclick', e => e.stopPropagation());
		this.doc.body.appendChild(bar);
		this.toolbar = bar;
	}

	_updateToolbar() {
		if (!this.toolbar) return;
		const el = this.selected;
		this.toolbar.classList.toggle('show', Boolean(el));
		if (!el) return;

		this.toolbar.querySelector('.wb-tb-label').textContent = this.labelFor(el);
		const parent = el.parentElement;
		this.toolbar.querySelector('[data-action="parent"]').disabled = !parent || parent === this.doc.body;

		// Follow the element while the page scrolls, reflows or styles change.
		if (!this._toolbarFrame) {
			const tick = () => {
				this._toolbarFrame = null;
				if (!this.selected) return;
				this._positionToolbar();
				this._toolbarFrame = this.doc.defaultView.requestAnimationFrame(tick);
			};
			tick();
		}
	}

	_positionToolbar() {
		const bar = this.toolbar;
		const el = this.selected;
		const visible = el.isConnected && !this.editingElement;
		bar.classList.toggle('show', visible);
		if (!visible) return;

		const rect = el.getBoundingClientRect();
		const body = this.doc.body.getBoundingClientRect();
		const height = bar.offsetHeight || 24;
		const viewportWidth = this.doc.documentElement.clientWidth;
		// Above the element, or just inside its top edge when there is no room.
		const top = (rect.top >= height ? rect.top - height : Math.max(rect.top, 0)) - body.top;
		const left = Math.max(0, Math.min(rect.left, viewportWidth - bar.offsetWidth)) - body.left;
		const position = `${Math.round(left)}px,${Math.round(top)}px`;
		if (bar.dataset.position !== position) {
			bar.dataset.position = position;
			bar.style.left = `${Math.round(left)}px`;
			bar.style.top = `${Math.round(top)}px`;
		}
	}

	_onClick(e) {
		const target = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		if (!target || target.isContentEditable) return;

		// Links and buttons inside the canvas should not navigate / submit.
		if (target.closest('a, button')) e.preventDefault();

		// First click selects the block; once something in a block is selected,
		// clicks inside that block select the exact element (e.g. a card or a
		// button inside a component).
		const block = target.closest('[data-buffer]');
		const drillDown = this.selected && block && block.contains(this.selected);
		this.select(drillDown ? target : block);
	}

	// ------------------------------------------------------------ text editing

	_onDoubleClick(e) {
		const el = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		if (!el || el.closest('[data-editor]') || !el.closest('[data-buffer]') || !this._isTextEditable(el)) return;
		e.preventDefault();
		this.startTextEditing(el);
	}

	_isTextEditable(el) {
		if (NON_TEXT_TAGS.has(el.tagName) || el.classList.contains('droppable')) return false;
		// Only text with inline formatting; editing a container in place could
		// delete the elements inside it.
		if (Array.from(el.querySelectorAll('*')).some(child => !INLINE_TAGS.has(child.tagName))) return false;
		return el.textContent.trim().length > 0;
	}

	startTextEditing(el) {
		this._finishTextEditing();
		if (!this.selected || !this.selected.contains(el)) this.select(el);

		// A draggable ancestor would turn text selection into a drag.
		this._dragLocks = [];
		for (let node = el; node && node !== this.doc.body; node = node.parentElement) {
			if (node.getAttribute('draggable') === 'true') {
				node.setAttribute('draggable', 'false');
				this._dragLocks.push(node);
			}
		}

		this.editingElement = el;
		el.setAttribute('contenteditable', 'true');
		el.focus();
	}

	_finishTextEditing(record = true) {
		const el = this.editingElement;
		if (!el) return;
		this.editingElement = null;

		el.removeAttribute('contenteditable');
		(this._dragLocks || []).forEach(node => node.setAttribute('draggable', 'true'));
		this._dragLocks = [];
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
		const target = e.target.nodeType === 1 ? e.target : e.target.parentElement;
		if (!target || this.editingElement) {
			if (this.editingElement && this.editingElement.contains(target)) return; // dragging selected text
			e.preventDefault();
			return;
		}

		// The browser starts the drag on the nearest draggable ancestor (usually the
		// whole block), so use the element that was under the pointer instead.
		const pointer = this._pointerTarget && this._pointerTarget.nodeType === 1 && target.contains(this._pointerTarget)
			? this._pointerTarget
			: target;

		let dragged;
		if (target.closest('#wb-toolbar')) dragged = this.selected;
		else if (this._dragsSelection(pointer)) dragged = this.selected;
		else dragged = this._dragCandidate(pointer);

		if (!dragged || dragged === this.doc.body || UNDRAGGABLE_TAGS.has(dragged.localName)) {
			e.preventDefault();
			return;
		}

		this.draggedElement = dragged;
		e.dataTransfer.effectAllowed = 'move';
		// Firefox only starts a drag when some data is set.
		e.dataTransfer.setData('text/plain', '');
		if (dragged !== target) {
			const rect = dragged.getBoundingClientRect();
			const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
			const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
			e.dataTransfer.setDragImage(dragged, x || 12, y || 12);
		}
	}

	/**
	 * Does grabbing `pointer` drag the current selection? Yes when the pointer is
	 * inside it, unless another block nested in the selection is in between
	 * (grabbing a heading inside a selected section drags the heading).
	 */
	_dragsSelection(pointer) {
		const selected = this.selected;
		if (!selected || !selected.contains(pointer)) return false;
		const innerBlock = pointer.closest('[data-buffer]');
		return !innerBlock || innerBlock === selected || innerBlock.contains(selected) || !selected.contains(innerBlock);
	}

	/** The element a drag starting on `node` moves. */
	_dragCandidate(node) {
		let el = node;
		// Inline formatting moves with its text; list options, summaries… with their parent.
		while (el && el !== this.doc.body && (DRAG_WITH_PARENT_TAGS.has(el.localName) || UNDRAGGABLE_TAGS.has(el.localName))) {
			el = el.parentElement;
		}
		if (!el || el === this.doc.body || !el.closest('[data-buffer]')) return null;

		// Generated menu links are rebuilt from the page list: move the whole menu.
		const menu = el.closest('[data-nav]');
		if (menu && menu !== el) el = menu;

		// The only element inside a block (a component's <section>, the Tabs
		// widget…) stands for the block itself.
		const parent = el.parentElement;
		if (parent && parent !== this.doc.body && parent.hasAttribute('data-buffer')
			&& Array.from(parent.children).filter(c => this._isContentNode(c)).length === 1) {
			el = parent;
		}
		return el;
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
		if (!node || node.closest('[data-editor]')) return null;
		const zone = this._closestZone(node, dragged);
		if (!zone) return null;

		const edge = this._edgeTarget(zone, e, dragged);
		if (edge) return edge;

		const children = Array.from(zone.children).filter(c => c !== dragged && this._isContentNode(c));
		if (!children.length) return { zone, ref: null, position: null };

		// The child nearest the pointer is the reference; whether we drop before or
		// after it horizontally or vertically depends on the layout: left/right only
		// when it shares a row with a sibling (flex rows, grids), else above/below.
		const x = e.clientX;
		const y = e.clientY;
		let hovered = null;
		let rect = null;
		let best = Infinity;
		for (const child of children) {
			const r = child.getBoundingClientRect();
			if (!r.width && !r.height) continue;
			const dx = Math.max(r.left - x, 0, x - r.right);
			const dy = Math.max(r.top - y, 0, y - r.bottom);
			const distance = dx * dx + dy * dy;
			if (distance < best) {
				best = distance;
				hovered = child;
				rect = r;
			}
		}
		if (!hovered) return { zone, ref: null, position: null };

		if (this._inRow(hovered, children)) {
			return { zone, ref: hovered, position: x < rect.left + rect.width / 2 ? 'left' : 'right' };
		}
		return { zone, ref: hovered, position: y < rect.top + rect.height / 2 ? 'above' : 'below' };
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

		// Elements moved out of (or around) a component become blocks of their own.
		if (!raw) this._promote(el);

		if (this.insertSorted(target.zone, el, target.ref, target.position)) {
			this.select(el);
		}
	}

	_endDrag() {
		this._pointerTarget = null;
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
