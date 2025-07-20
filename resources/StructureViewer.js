export default class StructureViewer {
	constructor(structureRootId, dropManager) {
		this.container = document.getElementById(structureRootId);
		this.dropManager = dropManager;
		this.draggedItem = null;

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
			return;
		}
	}

	init() {
		const update = this.debounce(() => {
			const structure = this.dropManager.getStructure();
			this.render(structure);
		}, 200);

		// Watch for structure updates
		const observer = new MutationObserver(update);
		observer.observe(this.dropManager.root, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		});

		// Initial render
		update();
	}

	render(structure) {
		this.container.innerHTML = '';
		const ul = document.createElement('ul');
		ul.className = 'structure-tree';
		this.buildList(structure, ul);
		this.container.appendChild(ul);
		this.setupDragAndDrop();
	}

	buildList(structure, parentEl) {
		structure.forEach(item => {
			const li = document.createElement('li');
			li.className = 'structure-item';
			li.draggable = true;
			li.innerHTML = `<strong>${item.label || item.tag}</strong> <small>&lt;${item.tag}&gt;</small>`;
			li.dataset.elementId = item.element.dataset.structureId;

			if (item.children && item.children.length > 0) {
				const nestedUl = document.createElement('ul');
				this.buildList(item.children, nestedUl);
				li.appendChild(nestedUl);
			}

			parentEl.appendChild(li);
		});
	}

	setupDragAndDrop() {
		this.container.querySelectorAll('.structure-item').forEach(item => {
			item.addEventListener('dragstart', e => {
				this.draggedItem = item;
				e.dataTransfer.effectAllowed = 'move';
			});

			item.addEventListener('dragover', e => {
				e.preventDefault();
				item.classList.add('drag-over');
			});

			item.addEventListener('dragleave', () => {
				item.classList.remove('drag-over');
			});

			item.addEventListener('drop', e => {
				e.preventDefault();
				item.classList.remove('drag-over');

				if (!this.draggedItem || this.draggedItem === item) return;

				// Move in structure panel
				item.parentNode.insertBefore(this.draggedItem, item.nextSibling);

				// Move in canvas
				const draggedId = this.draggedItem.dataset.elementId;
				const targetId = item.dataset.elementId;

				const draggedEl = document.querySelector(`[data-structure-id="${draggedId}"]`);
				const targetEl = document.querySelector(`[data-structure-id="${targetId}"]`);

				if (draggedEl && targetEl && draggedEl !== targetEl && targetEl.parentNode === draggedEl.parentNode) {
					targetEl.parentNode.insertBefore(draggedEl, targetEl.nextSibling);
				}
			});
		});
	}

	debounce(fn, delay = 100) {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	}
}