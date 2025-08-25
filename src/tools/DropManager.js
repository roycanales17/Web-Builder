import HistoryManager from './HistoryManager.js';

class DropManager {
	constructor(root, skeleton) {
		this.root = root;
		this.skeletonId = skeleton?.id || `${root}-skeleton`;
		this.skeletonTemplate = skeleton ? skeleton.cloneNode(true) : null;
		this.skeleton = skeleton;
		this.lastDropTarget = null;
		this.lastDropPosition = null;
		this.draggedElement = null;
		this.structureIdCounter = 0;
		this.withBorders = false;

		// History manager
		this.historyManager = new HistoryManager(this.root);

		// Adds dropzone event for canvas
		this.initDropZone(this.root);

		// Create drop-line element if not exist
		this.dropLine = document.getElementById('drop-line');
		if (!this.dropLine) {
			this.dropLine = document.createElement('div');
			this.dropLine.id = 'drop-line';
			document.body.appendChild(this.dropLine);
		}

		// Make all toolbar blocks draggable
		document.querySelectorAll('.item-block').forEach(block => this.makeDraggable(block));

		// Keyboard events for undo/redo
		document.addEventListener('keydown', e => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					this.historyManager.redo(() => this.rebind());
				} else {
					this.historyManager.undo(() => this.rebind());
				}
			}
		});
	}

	/**
	 * Ensures skeleton is shown if canvas is empty,
	 * hidden/removed otherwise.
	 */
	updateSkeleton() {
		if (!this.skeletonTemplate) return;

		const hasRealChildren = Array.from(this.root.children)
			.some(c => c.id !== this.skeletonId && c.id !== 'drop-line');

		if (hasRealChildren) {
			// remove live skeleton if it exists
			const liveSkeleton = this.root.querySelector(`#${this.skeletonId}`);
			if (liveSkeleton) {
				liveSkeleton.remove();
				this.skeleton = null;
			}
		} else {
			// restore skeleton if missing
			if (!this.root.querySelector(`#${this.skeletonId}`)) {
				this.skeleton = this.skeletonTemplate.cloneNode(true);
				this.root.appendChild(this.skeleton);
			}
		}
	}

	rebind() {
		this.root.querySelectorAll('.droppable').forEach(zone => this.initDropZone(zone));
		this.root.querySelectorAll('[draggable="true"]').forEach(el => this.makeDraggable(el));

		// Check skeleton after undo/redo
		this.updateSkeleton();
	}

	makeDraggable(el) {
		el.setAttribute('draggable', 'true');

		el.addEventListener('dragstart', e => {
			this.toggleCompiledSpacing(true);
			if (e.target !== el) return;

			const bufferData = JSON.parse(el.getAttribute('data-buffer'));
			const isToolbarItem = el.classList.contains('item-block');
			if (isToolbarItem) {
				e.dataTransfer.setData('type', bufferData.type);
				e.dataTransfer.setData('context', bufferData.context);
				e.dataTransfer.setData('label', bufferData.label || bufferData.type || el.innerText);
				this.draggedElement = null;
			} else {
				this.draggedElement = el;
			}
		});

		document.addEventListener('dragend', () => {
			this.hideDropLine();
			this.toggleCompiledSpacing(false);
			this.draggedElement = null;
		});
	}

	initDropZone(zone) {
		zone.classList.add('droppable');
		if (this.withBorders) {
			zone.classList.add('with-border');
		}

		zone.addEventListener('dragover', e => {
			this.toggleCompiledSpacing(true);
			const targetZone = e.target.closest('.droppable');
			if (targetZone !== zone) return;
			e.preventDefault();

			const children = Array.from(zone.children).filter(c => c !== this.draggedElement);
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

				// Check horizontal (X axis)
				const yWithinBounds = cursorY >= rect.top && cursorY <= rect.bottom;
				if (yWithinBounds) {
					const xDist = Math.abs(cursorX - (rect.left + rect.width / 2));
					if (xDist < minXDist) {
						minXDist = xDist;
						closestX = { el: child, rect };
					}
				}

				// Check vertical (Y axis)
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

				newElement = document.createElement(type);
				newElement.innerHTML = context;
				newElement.setAttribute('draggable', 'true');
				newElement.setAttribute('data-buffer', JSON.stringify({
					'label': label,
					'type': type,
					'context': context
				}));

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

			// Remove skeleton after first drop
			this.updateSkeleton();

			// Save state
			this.historyManager.saveState();

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
		const children = Array.from(container.children).filter(c => c !== newEl);
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

	showDropLine(targetEl, position = 'below') {
		const box = targetEl.getBoundingClientRect();
		this.dropLine.style.display = 'block';
		if (position === 'above' || position === 'below') {
			this.dropLine.style.width = box.width + 'px';
			this.dropLine.style.height = '2px';
			this.dropLine.style.left = box.left + 'px';
			this.dropLine.style.top = (position === 'above' ? box.top : box.bottom) + 'px';
		} else {
			this.dropLine.style.height = box.height + 'px';
			this.dropLine.style.width = '2px';
			this.dropLine.style.top = box.top + 'px';
			this.dropLine.style.left = (position === 'left' ? box.left : box.right) + 'px';
		}
	}

	hideDropLine() {
		this.dropLine.style.display = 'none';
	}

	toggleBorders(status) {
		document.querySelectorAll('.droppable').forEach(el => {
			el.classList.toggle('with-border', status);
		});

		this.withBorders = status;
	}

	togglePadding(status) {
		this.padding = status;
	}

	toggleCompiledSpacing(status) {
		document.querySelectorAll('.droppable').forEach(el => {
			if (this.padding) {
				el.classList.toggle('drag-margin', status);
			}
		});
	}

	compiledClickedEvent(callback) {
		if (!this.root || typeof callback !== 'function') return;
		this.root.addEventListener('click', e => {
			const el = e.target.closest('.droppable');
			if (!el || !this.root.contains(el)) return;
			callback(el);
		});
	}

	getStructure() {
		const traverse = node => {
			const compiledChildren = Array.from(node.children).filter(child => child.classList.contains('droppable'));
			return compiledChildren.map(child => {
				if (!child.dataset.structureId) {
					child.dataset.structureId = `node-${++this.structureIdCounter}`;
				}
				const bufferData = JSON.parse(child.getAttribute('data-buffer'));
				return {
					tag: bufferData.type.toLowerCase(),
					context: bufferData.context,
					label: bufferData.label || '',
					element: child,
					children: traverse(child)
				};
			});
		};
		return traverse(this.root);
	}
}

export default function init(root) {
	const manager = new DropManager(
		document.getElementById(root),
		document.getElementById(`${root}-skeleton`)
	);

	return {
		manager,
		getStructure: () => manager.getStructure(),
		togglePadding: (status) => manager.togglePadding(status),
		toggleBorders: (status) => manager.toggleBorders(status),
		compiledClickedEvent: (callback) => manager.compiledClickedEvent(callback)
	}
}