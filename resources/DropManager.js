class DropManager {

	constructor(root) {
		this.root = root;
		this.lastDropTarget = null;
		this.lastDropPosition = null;
		this.draggedElement = null;
		this.initDropZone(this.root);

		this.dropLine = document.getElementById('drop-line');

		// Create drop-line if it doesn't exist
		if (!this.dropLine) {
			this.dropLine = document.createElement('div');
			this.dropLine.id = 'drop-line';
			document.body.appendChild(this.dropLine);
		}

		// Initialize toolbar blocks
		document.querySelectorAll('.block').forEach(block => this.makeDraggable(block));
	}

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
			zone.classList.remove('drop-target-highlight');

			const targetZone = e.target.closest('.droppable');
			if (targetZone !== zone) return;

			this.toggleHighlight(zone, false);

			let newElement;
			let fromToolbar = false;

			if (!this.draggedElement) {
				// From toolbar
				const type = e.dataTransfer.getData('type');
				const context = e.dataTransfer.getData('context');

				newElement = document.createElement(type);
				newElement.textContent = context;
				newElement.classList.add('compiled');
				newElement.setAttribute('draggable', 'true');

				this.makeDraggable(newElement);
				this.initDropZone(newElement);
				fromToolbar = true;
			} else {
				newElement = this.draggedElement;

				// ❌ Block drop into own descendant
				if (newElement !== zone && newElement.contains(zone)) {
					console.warn("Cannot drop a parent into one of its own children.");
					this.draggedElement = null;
					return;
				}

				this.draggedElement = null;
			}

			// ✅ Final safety check before modifying DOM
			if (!fromToolbar && newElement.contains(zone)) {
				console.warn("Cannot insert element into one of its own children.");
				return;
			}

			// ✅ Remove only now if needed
			if (!fromToolbar && newElement.parentElement !== zone) {
				newElement.remove();
			}

			this.insertSorted(zone, newElement, this.lastDropTarget, this.lastDropPosition);
			this.lastDropTarget = null;
			this.lastDropPosition = null;
		});
	}

	toggleHighlight(zone, status) {
		zone.style.borderColor = status ? '#aaa' : '#ddd';
		zone.querySelectorAll('.compiled').forEach(el =>
			el.classList.toggle('drag-highlight', status)
		);
	}

	makeDraggable(el) {
		el.setAttribute('draggable', 'true');

		el.addEventListener('dragstart', e => {
			this.toggleCompiledSpacing(true);

			// ✅ Ensure only this specific element is being dragged
			if (e.target !== el) return;

			const isToolbarItem = el.classList.contains('block');

			if (isToolbarItem) {
				e.dataTransfer.setData('type', el.dataset.type);
				e.dataTransfer.setData('context', el.dataset.context);
				this.draggedElement = null;
			} else {
				this.draggedElement = el;
			}
		});

		el.addEventListener('dragend', (e) => this.toggleCompiledSpacing(false));
	}

	insertSorted(container, newEl, dropTarget = null, dropPosition = null) {
		if (newEl.contains(container)) {
			console.warn("Cannot insert element into one of its own children.");
			return;
		}

		const children = Array.from(container.children).filter(c => c !== newEl);

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
		} else if (position === 'left' || position === 'right') {
			this.dropLine.style.height = box.height + 'px';
			this.dropLine.style.width = '2px';
			this.dropLine.style.top = box.top + 'px';
			this.dropLine.style.left = (position === 'left' ? box.left : box.right) + 'px';
		}
	}

	hideDropLine() {
		this.dropLine.style.display = 'none';
	}

	toggleCompiledSpacing(status) {
		// Add margin on dragging
		if (status) {
			const compiledElements = document.querySelectorAll('.compiled');
			compiledElements.forEach(elm => {
				elm.classList.add('drag-margin');
			});

			return;
		}

		const compiledElements = document.querySelectorAll('.compiled.drag-margin');
		compiledElements.forEach(elm => {
			elm.classList.remove('drag-margin');
		});
	}
}

export default function init(root) {
	return new DropManager(document.getElementById(root));
}