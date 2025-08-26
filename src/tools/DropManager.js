// DropManager.js
import HistoryManager from './HistoryManager.js';

class DropManager {
	constructor(rootId) {
		// parent container element (the div that holds the iframe)
		this.parentRoot = document.getElementById(rootId);
		if (!this.parentRoot) throw new Error(`Missing parent root: ${rootId}`);

		// iframe element (expected to exist in parent DOM)
		this.iframe = document.getElementById(`${rootId}-iframe`);
		if (!this.iframe) throw new Error(`Missing iframe: ${rootId}-iframe`);

		// skeleton id that should exist inside the iframe (e.g. id="drop-zone-skeleton")
		this.skeletonId = `${rootId}-skeleton`;

		// state
		this.doc = null;                 // iframe document (set when ready)
		this.skeleton = null;            // live skeleton element inside iframe (if present)
		this.skeletonTemplate = null;    // clone to restore the skeleton
		this.dropLine = null;            // visual drop line inside iframe
		this.lastDropTarget = null;
		this.lastDropPosition = null;
		this.draggedElement = null;
		this.structureIdCounter = 0;
		this.withBorders = false;
		this.padding = false;

		// handlers bound for stable add/remove
		this._onGlobalDragEnd = this._onGlobalDragEnd.bind(this);

		// make toolbar items in parent draggable immediately (toolbar lives in parent)
		document.querySelectorAll('.item-block').forEach(block => this.makeDraggable(block));

		// keyboard for undo/redo (historyManager will be attached once iframe ready)
		document.addEventListener('keydown', e => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					this.historyManager?.redo(() => this.rebind());
				} else {
					this.historyManager?.undo(() => this.rebind());
				}
			}
		});

		// setup iframe (if already ready) or wait for its load event
		if (!this._setupIframe()) {
			this.iframe.addEventListener('load', () => {
				this._setupIframe();
			}, { once: true });
		}
	}

	/**
	 * Try to initialise iframe internals. Returns true if done.
	 */
	_setupIframe() {
		this.doc = this.iframe.contentDocument || (this.iframe.contentWindow && this.iframe.contentWindow.document);
		if (!this.doc || !this.doc.body) return false;

		// defensive normalized styles inside iframe
		try {
			this.doc.documentElement.style.height = '100%';
			this.doc.body.style.height = '100%';
			this.doc.documentElement.style.margin = '0';
			this.doc.body.style.margin = '0';
			// ensure body is positioned so absolutely-positioned dropLine works predictably
			if (getComputedStyle(this.doc.body).position === 'static') {
				this.doc.body.style.position = 'relative';
			}
		} catch (err) {
			// ignore cross-origin or styling issues (shouldn't happen for srcdoc)
		}

		// skeleton inside iframe (if present) -> clone into template so updateSkeleton works
		this.skeleton = this.doc.getElementById(this.skeletonId);
		if (this.skeleton) {
			this.skeletonTemplate = this.skeleton.cloneNode(true);
		} else {
			// Fallback: create a minimal skeleton if the srcdoc didn't include it.
			const fallback = this.doc.createElement('div');
			fallback.id = this.skeletonId;
			// keep minimal content to avoid visual glitch
			fallback.innerHTML = `<div style="padding:24px;color:#666;text-align:center">Drag components here</div>`;
			this.doc.body.appendChild(fallback);
			this.skeleton = fallback;
			this.skeletonTemplate = fallback.cloneNode(true);
		}

		// ✅ Ensure skeleton state is updated before history snapshot
		this.updateSkeleton();

		// history manager should track iframe body
		this.historyManager = new HistoryManager(this.doc.body);

		// create dropLine inside iframe if missing
		this.dropLine = this.doc.getElementById('drop-line');
		if (!this.dropLine) {
			this.dropLine = this.doc.createElement('div');
			this.dropLine.id = 'drop-line';
			Object.assign(this.dropLine.style, {
				position: 'absolute',
				display: 'none',
				pointerEvents: 'none',
				zIndex: '9999',
				// visible styling (adjust if you like)
				background: '#4a90e2',
				transition: 'opacity 120ms linear',
			});
			this.doc.body.appendChild(this.dropLine);
		}

		// global dragend needs to be listened on both parent and iframe docs
		document.removeEventListener('dragend', this._onGlobalDragEnd);
		document.addEventListener('dragend', this._onGlobalDragEnd);

		// iframe document dragend as well so dragging inside iframe ends cleanly
		try {
			this.doc.removeEventListener('dragend', this._onGlobalDragEnd);
			this.doc.addEventListener('dragend', this._onGlobalDragEnd);
		} catch (err) {
			// ignore (edge cases)
		}

		// initialize dropzone behavior on the iframe body
		this.initDropZone(this.doc.body);

		// rebind draggables/droppables already inside iframe
		this.rebind();

		// ensure skeleton is correct on init (again, after rebind)
		this.updateSkeleton();

		return true;
	}

	_onGlobalDragEnd() {
		this.hideDropLine();
		this.toggleCompiledSpacing(false);
		this.draggedElement = null;
	}

	safeParseJSON(raw) {
		try {
			return JSON.parse(raw || '{}');
		} catch (err) {
			return {};
		}
	}

	/**
	 * Ensures skeleton is shown if canvas is empty, hidden/removed otherwise.
	 */
	updateSkeleton() {
		if (!this.doc) return;

		// Ensure we always have a skeletonTemplate cached
		if (!this.skeletonTemplate) {
			const liveSkeleton = this.doc.getElementById(this.skeletonId);
			if (liveSkeleton) {
				this.skeletonTemplate = liveSkeleton.cloneNode(true);
			}
		}

		// Only count "real" children — ignore skeleton, drop-line, and <script>/<style>
		const hasRealChildren = Array.from(this.doc.body.children).some(c => {
			if (c.id === this.skeletonId) return false;
			if (c.id === 'drop-line') return false;
			if (c.tagName === 'SCRIPT' || c.tagName === 'STYLE') return false;
			return true;
		});

		if (hasRealChildren) {
			// remove live skeleton if it exists
			const liveSkeleton = this.doc.getElementById(this.skeletonId);
			if (liveSkeleton) {
				liveSkeleton.remove();
				this.skeleton = null;
			}
		} else {
			// restore skeleton if missing
			if (!this.doc.getElementById(this.skeletonId) && this.skeletonTemplate) {
				this.skeleton = this.skeletonTemplate.cloneNode(true);
				// ensure it appears before drop-line so overlay works
				const dropLine = this.doc.getElementById('drop-line');
				if (dropLine) {
					this.doc.body.insertBefore(this.skeleton, dropLine);
				} else {
					this.doc.body.insertBefore(this.skeleton, this.doc.body.firstChild);
				}
			}
		}
	}

	rebind() {
		if (!this.doc) return;

		// init droppable zones already present inside iframe
		Array.from(this.doc.querySelectorAll('.droppable')).forEach(zone => this.initDropZone(zone));

		// make draggable any elements inside iframe that are marked draggable
		Array.from(this.doc.querySelectorAll('[draggable="true"]')).forEach(el => this.makeDraggable(el));

		// check skeleton state
		this.updateSkeleton();
	}

	makeDraggable(el) {
		if (!el || el.__draggableInit) return;
		el.__draggableInit = true;

		// ensure attribute exists
		try { el.setAttribute('draggable', 'true'); } catch (err) { /*ignore*/ }

		const onDragStart = e => {
			this.toggleCompiledSpacing(true);
			if (e.target !== el) return;

			const bufferData = this.safeParseJSON(el.getAttribute && el.getAttribute('data-buffer'));
			const isToolbarItem = el.classList && el.classList.contains('item-block');
			if (isToolbarItem) {
				// toolbar items live in parent; carry their buffer data through dataTransfer
				e.dataTransfer.setData('type', bufferData.type || '');
				e.dataTransfer.setData('context', bufferData.context || '');
				e.dataTransfer.setData('label', bufferData.label || bufferData.type || el.innerText || '');
				this.draggedElement = null;
			} else {
				// dragging an existing element (either in iframe or parent)
				this.draggedElement = el;
			}
		};

		el.addEventListener('dragstart', onDragStart);
	}

	initDropZone(zone) {
		if (!zone || zone.__dropZoneInitialized) return;
		zone.__dropZoneInitialized = true;

		zone.classList.add('droppable');
		if (this.withBorders) zone.classList.add('with-border');

		// dragover
		zone.addEventListener('dragover', e => {
			if (!this.doc) return;
			this.toggleCompiledSpacing(true);

			const targetZone = e.target.closest('.droppable');
			if (targetZone !== zone) return;
			e.preventDefault();

			const children = Array.from(zone.children).filter(c => c !== this.draggedElement && c.id !== 'drop-line');
			if (children.length === 0) {
				this.hideDropLine();
				zone.classList.add('drop-target-highlight');
				this.toggleHighlight(zone, true);
				return;
			}

			let closestX = null;
			let closestY = null;
			let minXDist = Infinity;
			let minYDist = Infinity;

			const cursorX = e.clientX;
			const cursorY = e.clientY;

			for (let child of children) {
				const rect = child.getBoundingClientRect();

				// horizontal (x)
				const yWithinBounds = cursorY >= rect.top && cursorY <= rect.bottom;
				if (yWithinBounds) {
					const xDist = Math.abs(cursorX - (rect.left + rect.width / 2));
					if (xDist < minXDist) {
						minXDist = xDist;
						closestX = { el: child, rect };
					}
				}

				// vertical (y)
				const xWithinBounds = cursorX >= rect.left && cursorX <= rect.right;
				if (xWithinBounds) {
					const yDist = Math.abs(cursorY - (rect.top + rect.height / 2));
					if (yDist < minYDist) {
						minYDist = yDist;
						closestY = { el: child, rect };
					}
				}
			}

			let finalTarget = null;
			let position = null;

			if (closestX && (!closestY || minYDist > 10)) {
				finalTarget = closestX.el;
				const rect = closestX.rect;
				position = cursorX < rect.left + rect.width / 2 ? 'left' : 'right';
			} else if (closestY) {
				finalTarget = closestY.el;
				const rect = closestY.rect;
				position = cursorY < rect.top + rect.height / 2 ? 'above' : 'below';
			}

			if (finalTarget) {
				this.showDropLine(finalTarget, position);
				zone.classList.remove('drop-target-highlight');
				this.lastDropTarget = finalTarget;
				this.lastDropPosition = position;
			} else {
				this.hideDropLine();
				zone.classList.add('drop-target-highlight');
			}

			this.toggleHighlight(zone, true);
		});

		// dragleave
		zone.addEventListener('dragleave', () => {
			this.toggleCompiledSpacing(false);
			this.toggleHighlight(zone, false);
			this.hideDropLine();
			zone.classList.remove('drop-target-highlight');
		});

		// drop
		zone.addEventListener('drop', e => {
			if (!this.doc) return;
			e.preventDefault();

			this.hideDropLine();
			this.toggleCompiledSpacing(false);
			this.toggleHighlight(zone, false);
			zone.classList.remove('drop-target-highlight');

			const targetZone = e.target.closest('.droppable');
			if (targetZone !== zone) return;

			let newElement = null;
			let fromToolbar = false;

			if (!this.draggedElement) {
				const type = e.dataTransfer.getData('type');
				const context = e.dataTransfer.getData('context');
				const label = e.dataTransfer.getData('label') || context || type;

				if (!type || !/^[a-z]+[a-z0-9\-]*$/i.test(type)) {
					console.warn("Invalid or missing element type from toolbar.");
					return;
				}

				newElement = this.doc.createElement(type);
				newElement.setAttribute('draggable', 'true');
				newElement.setAttribute('data-buffer', JSON.stringify({
					label,
					type,
					context
				}));

				newElement.innerText = label;
				this.makeDraggable(newElement);
				this.initDropZone(newElement);
				fromToolbar = true;
			} else {
				newElement = this.draggedElement;
			}

			if (!newElement) {
				console.warn("No element to drop.");
				return;
			}

			if (!fromToolbar && newElement !== zone && newElement.contains(zone)) {
				console.warn("Cannot drop a parent into one of its own children.");
				this.draggedElement = null;
				return;
			}

			const canMove = !fromToolbar && newElement !== zone && !newElement.contains(zone);
			if (canMove) {
				newElement.remove();
			}

			this.insertSorted(zone, newElement, this.lastDropTarget, this.lastDropPosition);

			// Update skeleton and save
			this.updateSkeleton();
			this.historyManager?.saveState();

			this.draggedElement = null;
			this.lastDropTarget = null;
			this.lastDropPosition = null;
		});
	}

	toggleHighlight(zone, status) {
		zone.style.borderColor = status ? '#aaa' : '#ddd';
		zone.querySelectorAll('.droppable').forEach(el =>
			el.classList.toggle('drag-highlight', status)
		);
	}

	insertSorted(container, newEl, dropTarget = null, dropPosition = null) {
		if (newEl.contains(container)) {
			console.warn("Cannot insert element into one of its own children.");
			return;
		}
		const children = Array.from(container.children).filter(c => c !== newEl && c.id !== 'drop-line');
		if (newEl.parentElement !== container) {
			newEl.remove();
		}
		if (dropTarget && children.includes(dropTarget)) {
			if (dropPosition === 'above' || dropPosition === 'left') {
				container.insertBefore(newEl, dropTarget);
			} else {
				container.insertBefore(newEl, dropTarget.nextSibling);
			}
		} else {
			container.appendChild(newEl);
		}
	}

	/**
	 * Show dropLine. This function is robust: it first attempts boundingRect - bodyRect
	 * calculation; if that yields nonsense it falls back to accumulating offsets.
	 */
	showDropLine(targetEl, position = 'below') {
		if (!this.dropLine || !this.doc || !targetEl) return;

		// try boundingRect approach (most reliable)
		const box = targetEl.getBoundingClientRect();
		const bodyRect = this.doc.body.getBoundingClientRect();

		// positions relative to iframe document
		let left = box.left - bodyRect.left;
		let top = box.top - bodyRect.top;
		const width = box.width;
		const height = box.height;

		// fallback: compute offsets relative to body if the values look wrong
		const invalid = !isFinite(left) || !isFinite(top) || Math.abs(left) > (this.doc.documentElement.clientWidth * 4);
		if (invalid) {
			// accumulate offsets (works even if boundingRect fails for cross-window weirdness)
			let x = 0, y = 0;
			let el = targetEl;
			while (el && el !== this.doc.body && el !== this.doc.documentElement) {
				x += el.offsetLeft || 0;
				y += el.offsetTop || 0;
				el = el.offsetParent;
			}
			left = x;
			top = y;
		}

		this.dropLine.style.display = 'block';
		this.dropLine.style.opacity = '1';

		if (position === 'above' || position === 'below') {
			this.dropLine.style.width = (width) + 'px';
			this.dropLine.style.height = '2px';
			this.dropLine.style.left = `${Math.round(left)}px`;
			this.dropLine.style.top = `${Math.round(position === 'above' ? top : (top + height))}px`;
			// clear vertical styles
			this.dropLine.style.right = '';
			this.dropLine.style.bottom = '';
		} else {
			// vertical line (left or right)
			this.dropLine.style.height = (height) + 'px';
			this.dropLine.style.width = '2px';
			this.dropLine.style.top = `${Math.round(top)}px`;
			this.dropLine.style.left = `${Math.round(position === 'left' ? left : (left + width))}px`;
			// clear horizontal styles
			this.dropLine.style.right = '';
			this.dropLine.style.bottom = '';
		}
	}

	hideDropLine() {
		if (!this.dropLine) return;
		this.dropLine.style.display = 'none';
		this.dropLine.style.opacity = '0';
	}

	toggleBorders(status) {
		if (!this.doc) return;
		this.doc.querySelectorAll('.droppable').forEach(el => {
			el.classList.toggle('with-border', status);
		});
		this.withBorders = status;
	}

	togglePadding(status) {
		this.padding = Boolean(status);
	}

	toggleCompiledSpacing(status) {
		if (!this.doc) return;
		this.doc.querySelectorAll('.droppable').forEach(el => {
			if (this.padding) {
				el.classList.toggle('drag-margin', status);
			}
		});
	}

	compiledClickedEvent(callback) {
		if (!this.doc || typeof callback !== 'function') return;
		this.doc.body.addEventListener('click', e => {
			const el = e.target.closest('.droppable');
			if (!el || !this.doc.body.contains(el)) return;
			callback(el);
		});
	}

	getStructure() {
		if (!this.doc) return [];
		const traverse = node => {
			const compiledChildren = Array.from(node.children).filter(child => child.classList.contains('droppable'));
			return compiledChildren.map(child => {
				if (!child.dataset.structureId) {
					child.dataset.structureId = `node-${++this.structureIdCounter}`;
				}
				const bufferData = this.safeParseJSON(child.getAttribute('data-buffer'));
				return {
					tag: bufferData.type ? bufferData.type.toLowerCase() : child.tagName.toLowerCase(),
					context: bufferData.context || '',
					label: bufferData.label || '',
					element: child,
					children: traverse(child)
				};
			});
		};
		return traverse(this.doc.body);
	}
}

/**
 * init(rootId)
 * rootId should be the id string of the parent container that also contains
 * the iframe with id `${rootId}-iframe`.
 */
export default function init(rootId) {
	const manager = new DropManager(rootId);
	return {
		manager,
		getStructure: () => manager.getStructure(),
		togglePadding: (status) => manager.togglePadding(status),
		toggleBorders: (status) => manager.toggleBorders(status),
		compiledClickedEvent: (callback) => manager.compiledClickedEvent(callback)
	};
}
