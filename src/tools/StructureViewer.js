import { BLOCK_MIME } from './DropManager.js';

export default class StructureViewer {
	constructor(structureRootId, dropManager) {
		this.container = document.getElementById(structureRootId);
		this.skeleton = document.getElementById(`${structureRootId}-skeleton`);
		this.dropManager = dropManager;
		this.blockClassName = 'structure-block';
		this.expandedNodes = new Set();
		this.selectedBlock = null;

		this.dropLine = this.createDropLine();
		this._lastHover = null;
		this.dropMeta = null; // { target, pos }

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
			return;
		}
		if (!this.skeleton) {
			console.warn(`StructureViewer: skeleton #${structureRootId}-skeleton not found`);
		}

		this.setupContainerDropZone();
		this.setupDragDelegation();
		this.setupKeyboard();

		dropManager.onSelect(() => this.syncSelection());
	}

	updateTree(structure) {
		this.container.replaceChildren(...structure.map(item => this._render(item)));

		const hasItems = structure.length > 0;
		this.container.classList.toggle('hidden', !hasItems);
		this.container.classList.toggle('flex', hasItems);
		if (this.skeleton) this.skeleton.classList.toggle('hidden', hasItems);

		this.syncSelection();
	}

	/** Highlight the tree row of the block that contains the canvas selection. */
	syncSelection() {
		if (this.selectedBlock) this.selectedBlock.classList.remove('selected');
		this.selectedBlock = null;

		const selected = this.dropManager.selected;
		const block = selected && selected.closest('[data-buffer]');
		const id = block && block.dataset.structureId;
		if (!id) return;

		const row = this.container.querySelector(`[data-element-id="${CSS.escape(id)}"]`);
		if (!row) return;

		// Expand collapsed ancestors so the selection is visible.
		for (let wrapper = row.parentElement; wrapper && wrapper !== this.container; wrapper = wrapper.parentElement) {
			if (wrapper.classList.contains('structure-children') && wrapper.classList.contains('hidden')) {
				const owner = wrapper.closest('.' + this.blockClassName);
				this._setExpanded(owner, wrapper, true);
			}
		}

		this.selectedBlock = row;
		row.classList.add('selected');
		row.scrollIntoView({ block: 'nearest' });
	}

	_render(item) {
		const block = document.createElement('div');
		block.dataset.elementId = item.element.dataset.structureId;
		block.dataset.container = item.container ? '1' : '';
		this._blockInterface(block, item, item.children?.length > 0);
		return block;
	}

	_setExpanded(block, childrenWrapper, expanded) {
		childrenWrapper.classList.toggle('hidden', !expanded);
		const eye = block.querySelector(':scope > .structure-parent-row .structure-toggle');
		if (eye) eye.innerHTML = `<i class="fas ${expanded ? 'fa-eye' : 'fa-eye-slash'} structure-eye"></i>`;
		if (expanded) this.expandedNodes.add(block.dataset.elementId);
		else this.expandedNodes.delete(block.dataset.elementId);
	}

	_blockInterface(block, item, hasChildren) {
		block.className = this.blockClassName;
		block.setAttribute('draggable', 'true');

		const parentRow = document.createElement('div');
		parentRow.className = 'structure-parent-row';

		const label = document.createElement('span');
		label.className = 'structure-label';
		label.textContent = item.label || item.tag || 'Block';

		const actions = document.createElement('div');
		actions.className = 'structure-actions';

		const childrenWrapper = document.createElement('div');
		childrenWrapper.className = 'structure-children';
		const expanded = this.expandedNodes.has(block.dataset.elementId);
		if (!expanded) childrenWrapper.classList.add('hidden');

		if (hasChildren) {
			const eyeSpan = document.createElement('span');
			eyeSpan.className = 'structure-toggle';
			eyeSpan.title = 'Show / hide children';
			eyeSpan.innerHTML = `<i class="fas ${expanded ? 'fa-eye' : 'fa-eye-slash'} structure-eye"></i>`;
			eyeSpan.addEventListener('click', ev => {
				ev.stopPropagation();
				this._setExpanded(block, childrenWrapper, childrenWrapper.classList.contains('hidden'));
			});
			actions.appendChild(eyeSpan);
		}

		const trashSpan = document.createElement('span');
		trashSpan.title = 'Delete';
		trashSpan.innerHTML = '<i class="fas fa-trash structure-trash"></i>';
		trashSpan.addEventListener('click', ev => {
			ev.stopPropagation();
			const compiledEl = this.findCompiledEl(block.dataset.elementId);
			if (compiledEl && confirm('Are you sure you want to delete it?')) {
				this.dropManager.removeElement(compiledEl);
			}
		});
		actions.appendChild(trashSpan);

		const dragIconSpan = document.createElement('span');
		dragIconSpan.title = 'Drag to move';
		dragIconSpan.innerHTML = '<i class="fas fa-up-down-left-right structure-drag"></i>';
		actions.appendChild(dragIconSpan);

		parentRow.append(label, actions);
		block.appendChild(parentRow);

		parentRow.addEventListener('click', e => {
			e.stopPropagation();
			const compiledEl = this.findCompiledEl(block.dataset.elementId);
			if (!compiledEl) return;
			this.dropManager.select(compiledEl);
			compiledEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			this.container.focus({ preventScroll: true }); // allow keyboard nav
		});

		if (hasChildren) {
			item.children.forEach(child => childrenWrapper.appendChild(this._render(child)));
		}
		block.appendChild(childrenWrapper);
	}

	// ---------------------- DROP ZONE HANDLING ----------------------

	_isNewBlockDrag(e) {
		return Array.from(e.dataTransfer?.types || []).includes(BLOCK_MIME);
	}

	setupContainerDropZone() {
		this.container.addEventListener('dragover', e => {
			if (!this.dropManager.draggedElement && !this._isNewBlockDrag(e)) {
				this._clearHoverState();
				return;
			}
			e.preventDefault();

			let under = document.elementFromPoint(e.clientX, e.clientY);
			let hover = under && this.container.contains(under) ? under.closest('.' + this.blockClassName) : null;
			if (hover && hover.classList.contains('dragging')) hover = null;

			if (!hover) {
				this._handleContainerEdgeHover(e);
				return;
			}

			const rect = hover.querySelector('.structure-parent-row').getBoundingClientRect();
			const zone = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;
			const canNest = hover.dataset.container === '1';

			if (this._lastHover && this._lastHover !== hover) this._lastHover.classList.remove('drop-inside');
			this._lastHover = hover;
			this.dropLine.style.display = 'none';
			hover.classList.remove('drop-inside');

			if (canNest && zone >= 0.25 && zone <= 0.75) {
				hover.classList.add('drop-inside');
				this.dropMeta = { target: hover, pos: 'inside' };
			} else if (zone < (canNest ? 0.25 : 0.5)) {
				this._showDropLine(rect.left, hover.getBoundingClientRect().top, rect.width);
				this.dropMeta = { target: hover, pos: 'above' };
			} else {
				this._showDropLine(rect.left, hover.getBoundingClientRect().bottom, rect.width);
				this.dropMeta = { target: hover, pos: 'below' };
			}
		});

		this.container.addEventListener('dragleave', e => {
			if (!this.container.contains(e.relatedTarget)) this._clearHoverState();
		});

		this.container.addEventListener('drop', e => {
			e.preventDefault();
			const meta = this.dropMeta;
			this._clearHoverState();
			if (!meta) return;

			const manager = this.dropManager;
			let dragged = manager.draggedElement;
			const raw = e.dataTransfer.getData(BLOCK_MIME);
			if (raw) {
				try {
					dragged = manager.createBlock(JSON.parse(raw));
				} catch (err) {
					return;
				}
			}
			if (!dragged) return;

			const body = manager.doc.body;
			const target = meta.target ? this.findCompiledEl(meta.target.dataset.elementId) : null;
			if (target && (target === dragged || dragged.contains(target))) return;

			let inserted = false;
			if ((meta.pos === 'above' || meta.pos === 'below') && target) {
				inserted = manager.insertSorted(target.parentElement, dragged, target, meta.pos);
			} else if (meta.pos === 'inside' && target) {
				inserted = manager.insertSorted(manager.dropZoneFor(target), dragged);
			} else if (meta.pos === 'end') {
				inserted = manager.insertSorted(body, dragged);
			}

			manager.draggedElement = null;
			if (inserted) manager.select(dragged);
		});
	}

	_handleContainerEdgeHover(e) {
		const blocks = this.container.querySelectorAll(':scope > .' + this.blockClassName);
		this._clearHoverHighlight();

		if (blocks.length === 0) {
			const rect = this.container.getBoundingClientRect();
			this._showDropLine(rect.left, rect.top, rect.width);
			this.dropMeta = { target: null, pos: 'end' };
			return;
		}

		const first = blocks[0];
		const last = blocks[blocks.length - 1];
		const rectFirst = first.getBoundingClientRect();
		const rectLast = last.getBoundingClientRect();

		if (e.clientY < rectFirst.top) {
			this._showDropLine(rectFirst.left, rectFirst.top, rectFirst.width);
			this.dropMeta = { target: first, pos: 'above' };
		} else {
			// Anything below the last top-level row appends to the page.
			this._showDropLine(rectLast.left, rectLast.bottom, rectLast.width);
			this.dropMeta = { target: null, pos: 'end' };
		}
	}

	_clearHoverState() {
		this.dropLine.style.display = 'none';
		this._clearHoverHighlight();
		this.dropMeta = null;
	}

	_clearHoverHighlight() {
		if (this._lastHover) {
			this._lastHover.classList.remove('drop-inside');
			this._lastHover = null;
		}
	}

	_showDropLine(left, top, width) {
		Object.assign(this.dropLine.style, {
			width: `${width}px`,
			left: `${left}px`,
			top: `${top}px`,
			display: 'block',
		});
	}

	// ---------------------- DRAG DELEGATION ----------------------

	setupDragDelegation() {
		this.container.addEventListener('dragstart', e => {
			const item = e.target.closest('.' + this.blockClassName);
			if (!item) return;

			e.stopPropagation();
			e.dataTransfer.effectAllowed = 'move';

			const ghost = document.createElement('div');
			ghost.textContent = item.querySelector('.structure-label')?.textContent || 'Dragging';
			Object.assign(ghost.style, {
				position: 'absolute',
				top: '-9999px',
				left: '-9999px',
				padding: '4px 8px',
				background: '#fff',
				border: '1px solid #ccc',
				borderRadius: '4px',
				fontSize: '12px',
				color: '#111',
			});
			document.body.appendChild(ghost);
			e.dataTransfer.setDragImage(ghost, 0, 0);
			setTimeout(() => ghost.remove(), 0);

			item.classList.add('dragging');
			item.style.opacity = '0.5';

			const compiledEl = this.findCompiledEl(item.dataset.elementId);
			if (compiledEl) {
				this.dropManager.draggedElement = compiledEl;
				e.dataTransfer.setData('text/plain', '');
			}
		});

		this.container.addEventListener('dragend', () => {
			this.container.querySelectorAll(`.${this.blockClassName}.dragging`).forEach(el => {
				el.classList.remove('dragging');
				el.style.opacity = '';
			});
			this._clearHoverState();
			this.dropManager.draggedElement = null;
		});
	}

	setupKeyboard() {
		this.container.tabIndex = 0;
		this.container.addEventListener('keydown', e => {
			const selected = this.dropManager.selected;
			const block = selected && selected.closest('[data-buffer]');
			if (!block) return;

			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
				this.dropManager.moveElement(block, e.key === 'ArrowUp' ? 'up' : 'down');
			} else if (e.key === 'Delete' || e.key === 'Backspace') {
				e.preventDefault();
				this.dropManager.removeElement(block);
			} else if (e.key === 'Escape') {
				this.dropManager.select(null);
			}
		});
	}

	findCompiledEl(id) {
		return this.dropManager.findById(id);
	}

	// ---------------------- DROP LINE ----------------------

	createDropLine() {
		let line = document.getElementById('structure-drop-line');
		if (!line) {
			line = document.createElement('div');
			line.id = 'structure-drop-line';
			Object.assign(line.style, {
				position: 'fixed',
				height: '2px',
				background: '#28a745',
				zIndex: 9999,
				display: 'none',
				pointerEvents: 'none',
			});
			document.body.appendChild(line);
		}
		return line;
	}
}
