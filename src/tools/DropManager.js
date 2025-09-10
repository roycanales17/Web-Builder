import HistoryManager from './HistoryManager.js';

class DropManager {
	constructor(rootId, blockClassName) {
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
		this.blockClassName = blockClassName;

		// handlers bound for stable add/remove
		this._onGlobalDragEnd = this._onGlobalDragEnd.bind(this);

		// make toolbar items in parent draggable immediately (toolbar lives in parent)
		document.querySelectorAll(`.${this.blockClassName}`).forEach(block => this.makeDraggable(block));

		// keyboard for undo/redo (historyManager will be attached once iframe ready)
		document.addEventListener('keydown', e => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				const after = () => {
					this.rebind();
					if (this.callback) {
						this.callback(this.getStructure());
					}
				};
				if (e.shiftKey) {
					this.historyManager?.redo(after);
				} else {
					this.historyManager?.undo(after);
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
			// ensure body is positioned so absolutely-positioned dropLine works predictably
			if (getComputedStyle(this.doc.body).position === 'static') {
				this.doc.body.style.position = 'relative';
			}
		} catch (err) {}

		// skeleton inside iframe (if present) -> clone into template so updateSkeleton works
		this.skeleton = this.doc.getElementById(this.skeletonId);
		if (this.skeleton) {
			this.skeletonTemplate = this.skeleton.cloneNode(true);
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
				background: 'limegreen',
				transition: 'opacity 120ms linear',
			});
			this.doc.body.appendChild(this.dropLine);
		}

		document.removeEventListener('dragend', this._onGlobalDragEnd);
		document.addEventListener('dragend', this._onGlobalDragEnd);

		try {
			this.doc.removeEventListener('dragend', this._onGlobalDragEnd);
			this.doc.addEventListener('dragend', this._onGlobalDragEnd);
		} catch (err) {}

		this.initDropZone(this.doc.body);
		this.rebind();
		this.updateSkeleton();

		return true;
	}

	_onGlobalDragEnd() {
		this.hideDropLine();
		this.toggleCompiledSpacing(false);
		this.draggedElement = null;
	}

	safeParseJSON(raw) {
		try { return JSON.parse(raw || '{}'); } catch (err) { return {}; }
	}

	updateSkeleton() {
		if (!this.doc) return;

		if (!this.skeletonTemplate) {
			const liveSkeleton = this.doc.getElementById(this.skeletonId);
			if (liveSkeleton) {
				this.skeletonTemplate = liveSkeleton.cloneNode(true);
			}
		}

		const hasRealChildren = Array.from(this.doc.body.children).some(c => {
			if (c.id === this.skeletonId) return false;
			if (c.id === 'drop-line') return false;
			if (c.tagName === 'SCRIPT' || c.tagName === 'STYLE') return false;
			return true;
		});

		if (hasRealChildren) {
			const liveSkeleton = this.doc.getElementById(this.skeletonId);
			if (liveSkeleton) {
				liveSkeleton.remove();
				this.skeleton = null;
			}
		} else {
			if (!this.doc.getElementById(this.skeletonId) && this.skeletonTemplate) {
				this.skeleton = this.skeletonTemplate.cloneNode(true);
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

		Array.from(this.doc.querySelectorAll('.droppable')).forEach(zone => this.initDropZone(zone));
		Array.from(this.doc.querySelectorAll('[draggable="true"]')).forEach(el => this.makeDraggable(el));
		this.updateSkeleton();
	}

	makeDraggable(el) {
		if (!el || el.__draggableInit) return;
		el.__draggableInit = true;

		try { el.setAttribute('draggable', 'true'); } catch (err) {}

		const onDragStart = e => {
			this.toggleCompiledSpacing(true);
			if (e.target !== el) return;

			const bufferData = this.safeParseJSON(el.getAttribute && el.getAttribute('data-buffer'));
			const isToolbarItem = el.classList && el.classList.contains(this.blockClassName);
			if (isToolbarItem) {
				e.dataTransfer.setData('type', bufferData.type || '');
				e.dataTransfer.setData('context', bufferData.context || '');
				e.dataTransfer.setData('label', bufferData.label || bufferData.type || el.innerText || '');
				this.draggedElement = null;
			} else {
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

			let closestX = null, closestY = null;
			let minXDist = Infinity, minYDist = Infinity;
			const cursorX = e.clientX, cursorY = e.clientY;

			for (let child of children) {
				const rect = child.getBoundingClientRect();

				const yWithinBounds = cursorY >= rect.top && cursorY <= rect.bottom;
				if (yWithinBounds) {
					const xDist = Math.abs(cursorX - (rect.left + rect.width / 2));
					if (xDist < minXDist) {
						minXDist = xDist;
						closestX = { el: child, rect };
					}
				}

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

		zone.addEventListener('dragleave', () => {
			this.toggleCompiledSpacing(false);
			this.toggleHighlight(zone, false);
			this.hideDropLine();
			zone.classList.remove('drop-target-highlight');
		});

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
				newElement.setAttribute('data-buffer', JSON.stringify({ label, type, context }));

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

		if (newEl.parentElement && newEl.parentElement !== container) {
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

		this.updateSkeleton();
		this.historyManager?.saveState();
		if (this.callback) {
			this.callback(this.getStructure());
		}
	}

	showDropLine(targetEl, position = 'below') {
		if (!this.dropLine || !this.doc || !targetEl) return;

		const box = targetEl.getBoundingClientRect();
		const bodyRect = this.doc.body.getBoundingClientRect();

		let left = box.left - bodyRect.left;
		let top = box.top - bodyRect.top;
		const width = box.width;
		const height = box.height;

		const invalid = !isFinite(left) || !isFinite(top) || Math.abs(left) > (this.doc.documentElement.clientWidth * 4);
		if (invalid) {
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
			this.dropLine.style.right = '';
			this.dropLine.style.bottom = '';
		} else {
			this.dropLine.style.height = (height) + 'px';
			this.dropLine.style.width = '2px';
			this.dropLine.style.top = `${Math.round(top)}px`;
			this.dropLine.style.left = `${Math.round(position === 'left' ? left : (left + width))}px`;
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
		if (!this.doc || !this.doc.body) return [];
		const traverse = node => {
			if (!node || !node.children) return [];
			const compiledChildren = Array.from(node.children).filter(child => {
				if (child.id === this.skeletonId) return false;
				if (child.id === 'drop-line') return false;
				return child.classList.contains('droppable');
			});
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

	onStructureChange(callback) {
		this.callback = callback;
	}
}

export default function init(rootId, blockClassName) {
	const manager = new DropManager(rootId, blockClassName);
	return {
		manager,
		makeDraggable: (el) => manager.makeDraggable(el),
		onStructureChange: (callback) => manager.onStructureChange(callback),
		togglePadding: (status) => manager.togglePadding(status),
		toggleBorders: (status) => manager.toggleBorders(status),
		compiledClickedEvent: (callback) => manager.compiledClickedEvent(callback)
	};
}