export default class StructureViewer
{
	constructor(structureRootId, dropManager) {
		this.bufferedStructureItem = {};
		this.container = document.getElementById(structureRootId);
		this.dropManager = dropManager;
		this.expandedNodes = new Set(); // ✅ Stores open/collapsed state

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
		}
	}

	/**
	 * Initial load for structure view
	 */
	init() {
		// Clear structureId attributes to force reassign
		this.dropManager.root.querySelectorAll('.compiled').forEach(el => {
			delete el.dataset.structureId;
		});

		// Add delay time for refreshing the structure viewer lists
		const update = this.debounce(() => {
			const structure = this.dropManager.getStructure();
			this.render(structure);
		}, 200);

		// Rerender structure view if any changes was made on the canvas.
		const observer = new MutationObserver(update);
		observer.observe(this.dropManager.root, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		});

		// Remove the focus highlights if outside the structure viewer lists
		document.addEventListener('click', e => {
			if (!this.container.contains(e.target)) {
				this.clearFocus();
			}
		});

		update();
	}

	/**
	 * Renders the whole blocks of structure viewer lists
	 *
	 * @param structure
	 */
	render(structure) {
		// ✅ Save the currently expanded nodes before wiping
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
		this.setupDragAndDrop();
		this.setupFocusListeners();
	}

	/**
	 * Displays the compiled elements including nested DOM
	 *
	 * @param structure
	 * @param parentEl
	 */
	buildList(structure, parentEl) {
		structure.forEach(item => {
			const li = document.createElement('li');
			li.className = 'structure-item';
			li.draggable = true;

			// Unique identifier for compiled elements
			li.dataset.elementId = item.element.dataset.structureId;

			// Reference: DropManager.getStructure() function...
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

				// ✅ Restore toggle state based on memory
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

					// ✅ Track state
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

			parentEl.appendChild(li);
		});
	}

	/**
	 * Adds an event for dragging to each structure items
	 */
	setupDragAndDrop() {
		const structureItems = this.container.querySelectorAll('.structure-item');

		structureItems.forEach(item => {
			item.addEventListener('dragstart', e => {
				// ✅ Ignore nested triggers: only handle if target is this specific item
				if (e.currentTarget !== e.target && !e.currentTarget.contains(e.target)) return;

				// ✅ Stop bubbling
				e.stopPropagation();

				// 👻 Create drag ghost
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
					fontSize: '12px',
				});
				document.body.appendChild(ghost);
				e.dataTransfer.setDragImage(ghost, 0, 0);
				setTimeout(() => document.body.removeChild(ghost), 0);

				// 🎯 Find the compiled DOM element
				const id = item.dataset.elementId;
				const compiledEl = Array.from(this.dropManager.root.querySelectorAll('.compiled'))
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

	/**
	 * Event for structure items highlights.
	 */
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

	/**
	 * Clear the highlights of each structure items
	 */
	clearFocus() {
		this.container.querySelectorAll('.structure-item.focused')
			.forEach(el => el.classList.remove('focused'));
	}

	/**
	 * For delaying an action
	 *
	 * @param fn
	 * @param delay
	 * @returns {(function(...[*]): void)|*}
	 */
	debounce(fn, delay = 100) {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	}
}