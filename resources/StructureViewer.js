export default class StructureViewer
{
	constructor(structureRootId, dropManager) {
		this.bufferedStructureItem = {};
		this.container = document.getElementById(structureRootId);
		this.dropManager = dropManager;
		this.expandedNodes = new Set();
		this.dropLine = this.createDropLine(); // ✅ Drop line for sorting

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
		}
	}

	init() {
		this.dropManager.root.querySelectorAll('.droppable').forEach(el => {
			delete el.dataset.structureId;
		});

		const update = this.debounce(() => {
			const structure = this.dropManager.getStructure();
			this.render(structure);
		}, 200);

		const observer = new MutationObserver(update);
		observer.observe(this.dropManager.root, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		});

		document.addEventListener('click', e => {
			if (!this.container.contains(e.target)) {
				this.clearFocus();
			}
		});

		update();
	}

	render(structure) {
		this.expandedNodes.clear();
		this.container.querySelectorAll('.structure-item').forEach(item => {
			const id = item.dataset.elementId;
			const nested = item.querySelector('.structure-nested');
			if (nested && !nested.classList.contains('collapsed')) {
				this.expandedNodes.add(id);
			}
		});

		this.container.innerHTML = '';
		const ul = document.createElement('ul');
		ul.className = 'structure-tree';
		this.buildList(structure, ul);
		this.container.appendChild(ul);
		this.setupContainerDropHandler(ul);
		this.setupDragAndDrop();
		this.setupFocusListeners();
	}

	createDropLine() {
		let line = document.getElementById('structure-drop-line');
		if (!line) {
			line = document.createElement('div');
			line.id = 'structure-drop-line';
			Object.assign(line.style, {
				position: 'absolute',
				height: '2px',
				background: '#28a745',
				zIndex: 9999,
				display: 'none'
			});
			document.body.appendChild(line);
		}
		return line;
	}

	buildList(structure, parentEl) {
		structure.forEach(item => {
			const li = document.createElement('li');
			li.className = 'structure-item';
			li.draggable = true;
			li.dataset.elementId = item.element.dataset.structureId;

			this.bufferedStructureItem[li.dataset.elementId] = {
				tag: item.tag,
				context: item.context,
				label: item.label
			};

			const row = document.createElement('div');
			row.className = 'structure-row';

			const left = document.createElement('div');
			left.className = 'structure-left';
			left.innerHTML = `<span class="structure-label">${item.label || item.tag}</span>
						  <small class="structure-tag">&lt;${item.tag}&gt;</small>`;

			const right = document.createElement('div');
			right.className = 'structure-right';

			const toggleBtn = document.createElement('span');
			toggleBtn.className = 'structure-toggle';
			toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

			const editBtn = document.createElement('span');
			editBtn.className = 'structure-edit';
			editBtn.innerHTML = '<i class="fas fa-pen"></i>';

			right.appendChild(toggleBtn);
			right.appendChild(editBtn);
			row.appendChild(left);
			row.appendChild(right);
			li.appendChild(row);

			if (item.children?.length > 0) {
				const nestedUl = document.createElement('ul');
				nestedUl.classList.add('structure-nested');
				const isExpanded = this.expandedNodes.has(li.dataset.elementId);
				if (!isExpanded) {
					nestedUl.classList.add('collapsed');
					toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
				} else {
					toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
				}
				this.buildList(item.children, nestedUl);
				li.appendChild(nestedUl);
				toggleBtn.addEventListener('click', e => {
					e.stopPropagation();
					const isCollapsed = nestedUl.classList.toggle('collapsed');
					toggleBtn.innerHTML = isCollapsed
						? '<i class="fas fa-chevron-right"></i>'
						: '<i class="fas fa-chevron-down"></i>';

					const id = li.dataset.elementId;
					if (isCollapsed) {
						this.expandedNodes.delete(id);
					} else {
						this.expandedNodes.add(id);
					}
				});
			} else {
				toggleBtn.style.visibility = 'hidden';
			}

			li.addEventListener('dragover', e => {
				e.preventDefault();
				const rect = li.getBoundingClientRect();
				const midY = rect.top + rect.height / 2;
				const insertAbove = e.clientY < midY;
				this.dropLine.style.width = rect.width + 'px';
				this.dropLine.style.left = rect.left + 'px';
				this.dropLine.style.top = (insertAbove ? rect.top : rect.bottom) + 'px';
				this.dropLine.style.display = 'block';
				li.dataset.dropPosition = insertAbove ? 'above' : 'below';
				this.dropTarget = li;
			});

			li.addEventListener('dragleave', () => {
				this.dropLine.style.display = 'none';
			});

			li.addEventListener('drop', e => {
				e.preventDefault();
				this.dropLine.style.display = 'none';
				const id = li.dataset.elementId;
				const compiledTarget = Array.from(this.dropManager.root.querySelectorAll('.droppable'))
					.find(el => el.dataset.structureId === id);

				if (!compiledTarget) return;
				const dragged = this.dropManager.draggedElement;
				if (!dragged || dragged === compiledTarget || compiledTarget.contains(dragged)) return;

				const pos = li.dataset.dropPosition;
				this.dropManager.insertSorted(compiledTarget.parentElement, dragged, compiledTarget, pos);
				this.dropManager.draggedElement = null;
				this.render(this.dropManager.getStructure());
			});

			parentEl.appendChild(li);
		});
	}

	setupContainerDropHandler(treeContainer) {
		const firstItem = treeContainer.querySelector('.structure-item');

		treeContainer.addEventListener('dragover', e => {
			if (!firstItem || !this.dropManager.draggedElement) return;
			const rect = firstItem.getBoundingClientRect();
			const aboveFirst = e.clientY < rect.top;
			if (aboveFirst) {
				e.preventDefault();
				this.dropLine.style.width = rect.width + 'px';
				this.dropLine.style.left = rect.left + 'px';
				this.dropLine.style.top = rect.top + 'px';
				this.dropLine.style.display = 'block';
				firstItem.dataset.dropPosition = 'above';
				this.dropTarget = firstItem;
			}
		});

		treeContainer.addEventListener('dragleave', () => {
			this.dropLine.style.display = 'none';
		});

		treeContainer.addEventListener('drop', e => {
			e.preventDefault();
			this.dropLine.style.display = 'none';
			const target = this.dropTarget;
			const pos = target?.dataset.dropPosition;
			const id = target?.dataset.elementId;
			const compiledTarget = id
				? Array.from(this.dropManager.root.querySelectorAll('.droppable')).find(el => el.dataset.structureId === id)
				: null;

			const dragged = this.dropManager.draggedElement;
			if (!dragged || !compiledTarget || compiledTarget.contains(dragged) || compiledTarget === dragged) return;

			if (pos === 'above' || pos === 'below') {
				this.dropManager.insertSorted(compiledTarget.parentElement, dragged, compiledTarget, pos);
				this.dropManager.draggedElement = null;
				this.render(this.dropManager.getStructure());
			}
		});
	}

	setupDragAndDrop() {
		const structureItems = this.container.querySelectorAll('.structure-item');
		structureItems.forEach(item => {
			item.addEventListener('dragstart', e => {
				if (e.currentTarget !== e.target && !e.currentTarget.contains(e.target)) return;
				e.stopPropagation();
				const ghost = document.createElement('div');
				ghost.textContent = item.querySelector('.structure-label')?.textContent || 'Dragging';
				Object.assign(ghost.style, {
					position: 'absolute',
					top: '-1000px',
					left: '-1000px',
					padding: '4px 8px',
					background: '#eee',
					border: '1px solid #ccc',
					borderRadius: '4px',
					color: '#333',
					fontSize: '12px'
				});
				document.body.appendChild(ghost);
				e.dataTransfer.setDragImage(ghost, 0, 0);
				setTimeout(() => document.body.removeChild(ghost), 0);

				const id = item.dataset.elementId;
				const compiledEl = Array.from(this.dropManager.root.querySelectorAll('.droppable'))
					.find(el => el.dataset.structureId === id);

				if (compiledEl) {
					this.dropManager.draggedElement = compiledEl;
					e.dataTransfer.setData('type', this.bufferedStructureItem[id].tag);
					e.dataTransfer.setData('context', this.bufferedStructureItem[id].context);
					e.dataTransfer.setData('label', this.bufferedStructureItem[id].label);
				}
			});
		});
	}

	setupFocusListeners() {
		this.container.addEventListener('click', e => {
			if (e.target.closest('.structure-edit')) return;
			const clickedRow = e.target.closest('.structure-row');
			if (!clickedRow) return;
			const clickedItem = clickedRow.closest('.structure-item');
			if (!clickedItem) return;
			this.clearFocus();
			clickedItem.classList.add('focused');
			clickedItem.querySelectorAll('.structure-item').forEach(child =>
				child.classList.add('focused')
			);
		});
	}

	clearFocus() {
		this.container.querySelectorAll('.structure-item.focused')
			.forEach(el => el.classList.remove('focused'));
	}

	debounce(fn, delay = 100) {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	}
}