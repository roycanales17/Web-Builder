class DropManager
{
	constructor(root) {
		this.root = root;
		this.lastDropTarget = null;
		this.lastDropPosition = null;
		this.draggedElement = null;
		this.structureIdCounter = 0;

		// Adds an event dropzone for the `canvas`.
		this.initDropZone(this.root);

		// Creates a `drop-line` element if not exist for dragover highlight indicator.
		this.dropLine = document.getElementById('drop-line');
		if (!this.dropLine) {
			this.dropLine = document.createElement('div');
			this.dropLine.id = 'drop-line';
			document.body.appendChild(this.dropLine);
		}

		// Adds an event to all `block` class element
		document.querySelectorAll('.block').forEach(block => this.makeDraggable(block));
	}

	/**
	 * Creates an event for dragstart within the canvas.
	 *
	 * @param el
	 */
	makeDraggable(el) {
		el.setAttribute('draggable', 'true');

		el.addEventListener('dragstart', e => {
			this.toggleCompiledSpacing(true);

			if (e.target !== el) return;

			const bufferData = JSON.parse(el.getAttribute('data-buffer'));
			const isToolbarItem = el.classList.contains('block');
			if (isToolbarItem) {
				e.dataTransfer.setData('type', bufferData.type);
				e.dataTransfer.setData('context', bufferData.context);
				e.dataTransfer.setData('label', bufferData.label || bufferData.type || el.innerText );
				this.draggedElement = null;
			} else {
				this.draggedElement = el;
			}
		});

		document.addEventListener('dragend', e => {
			this.hideDropLine();
			this.toggleCompiledSpacing(false);
			this.draggedElement = null;
		});
	}

	/**
	 * Creates a drop/dragover/dragleave zone event,
	 * basically means it handles the drop actions within the zone `element`.
	 *
	 * @param zone
	 */
	initDropZone(zone) {
		zone.classList.add('droppable');

		zone.addEventListener('dragover', e => {
			this.toggleCompiledSpacing(true);
			const targetZone = e.target.closest('.droppable');
			if (targetZone !== zone) return;
			e.preventDefault();

			const children = Array.from(zone.children).filter(c => c !== this.draggedElement);
			let closestChild = null;
			let minOffset = Infinity;

			for (let child of children) {
				const rect = child.getBoundingClientRect();
				const isFullWidth = (rect.width / zone.clientWidth) > 0.95;
				const offset = isFullWidth
					? Math.abs(rect.top + rect.height / 2 - e.clientY)
					: Math.abs(rect.left + rect.width / 2 - e.clientX);

				if (offset < minOffset) {
					minOffset = offset;
					closestChild = child;
				}
			}

			if (closestChild) {
				const rect = closestChild.getBoundingClientRect();
				const isFullWidth = (rect.width / zone.clientWidth) > 0.95;

				const useHorizontal = !isFullWidth;
				const position = useHorizontal
					? (e.clientX < rect.left + rect.width / 2 ? 'left' : 'right')
					: (e.clientY < rect.top + rect.height / 2 ? 'above' : 'below');

				this.showDropLine(closestChild, position);
				zone.classList.remove('drop-target-highlight');
				this.lastDropTarget = closestChild;
				this.lastDropPosition = position;
			} else {
				this.hideDropLine();
				zone.classList.add('drop-target-highlight');
			}

			this.toggleHighlight(zone, true);
		});

		zone.addEventListener('dragleave', e => {
			const relatedZone = e.relatedTarget?.closest('.droppable');
			if (relatedZone !== zone) {
				this.toggleHighlight(zone, false);
				this.hideDropLine();
				zone.classList.remove('drop-target-highlight');
			}
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

				// ✅ Prevent invalid tag creation
				if (!type || !/^[a-z]+[a-z0-9\-]*$/i.test(type)) {
					console.warn("Invalid or missing element type from toolbar.");
					return;
				}

				newElement = document.createElement(type);
				newElement.textContent = context;
				newElement.classList.add('compiled');
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

			// ✅ Optional A: Prevent dropping nothing
			if (!newElement) {
				console.warn("No element to drop.");
				return;
			}

			// ❌ Block drop into own descendant
			if (!fromToolbar && newElement !== zone && newElement.contains(zone)) {
				console.warn("Cannot drop a parent into one of its own children.");
				this.draggedElement = null;
				return;
			}

			const canMove =
				!fromToolbar &&
				newElement !== zone &&
				!newElement.contains(zone);

			if (canMove) {
				newElement.remove();
			}

			this.insertSorted(zone, newElement, this.lastDropTarget, this.lastDropPosition);
			this.draggedElement = null;
			this.lastDropTarget = null;
			this.lastDropPosition = null;
		});
	}

	/**
	 * Toggle the `drop-line`, an indication on which to place the element within the canvas.
	 *
	 * @param zone
	 * @param status
	 */
	toggleHighlight(zone, status) {
		zone.style.borderColor = status ? '#aaa' : '#ddd';
		zone.querySelectorAll('.compiled').forEach(el =>
			el.classList.toggle('drag-highlight', status)
		);
	}

	/**
	 * Handles the complex placement of element.
	 *
	 * @param container
	 * @param newEl
	 * @param dropTarget
	 * @param dropPosition
	 */
	insertSorted(container, newEl, dropTarget = null, dropPosition = null) {
		if (newEl.contains(container)) {
			console.warn("Cannot insert element into one of its own children.");
			return;
		}

		const children = Array.from(container.children).filter(c => c !== newEl);

		// Remove only if we're actually going to insert
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
	 * Add `drop-line` on the target element with position applied.
	 *
	 * @param targetEl
	 * @param position
	 */
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

	/**
	 * Hides the `drop-line`
	 */
	hideDropLine() {
		this.dropLine.style.display = 'none';
	}

	/**
	 * Adds spacing to all compiled elements within the canvas
	 *
	 * @param status
	 */
	toggleCompiledSpacing(status) {
		document.querySelectorAll('.compiled').forEach(el =>
			el.classList.toggle('drag-margin', status)
		);
	}

	compiledClickedEvent(callback) {
		if (!this.root || typeof callback !== 'function') return;

		this.root.addEventListener('click', e => {
			const el = e.target.closest('.compiled');
			if (!el || !this.root.contains(el)) return;
			callback(el);
		});
	}

	/**
	 * Retrieves all the compiled elements from canvas.
	 *
	 * @returns {any}
	 */
	getStructure() {
		const traverse = node => {
			const compiledChildren = Array.from(node.children).filter(child => child.classList.contains('compiled'));

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
	const manager = new DropManager(document.getElementById(root));

	return {
		manager,
		getStructure: () => manager.getStructure(),
		compiledClickedEvent: (callback) => manager.compiledClickedEvent(callback)
	};
}
