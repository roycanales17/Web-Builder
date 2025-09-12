import HistoryManager from './HistoryManager.js';

export default class StructureViewer {
	constructor(structureRootId, dropManager) {
		this.container = document.getElementById(structureRootId);
		this.skeleton = document.getElementById(`${structureRootId}-skeleton`);
		this.dropManager = dropManager;
		this.blockClassName = "structure-block";
		this.bufferedStructureItem = {};
		this.expandedNodes = new Set();
		this.selectedBlock = null;

		// floating drop-line element
		this.dropLine = this.createDropLine();

		// state for current hover / drop
		this._lastHover = null;
		this.dropMeta = null; // { target, pos }

		// guards
		this._containerDropInitialized = false;
		this._delegationInit = false;

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
		}
		if (!this.skeleton) {
			console.warn(`StructureViewer: skeleton #${structureRootId}-skeleton not found`);
		}

		// Listen for clicks outside to clear selection
		document.addEventListener("click", (e) => {
			if (
				this.selectedBlock &&
				!this.container.contains(e.target)
			) {
				this.selectedBlock.classList.remove("selected");
				this.selectedBlock = null;
			}
		});

	}

	updateTree(structure) {
		this.container.innerHTML = "";

		structure.forEach(item => {
			const block = this._render(item);
			this.container.appendChild(block);
		});

		this.setupContainerDropZone();
		this.setupDragDelegation();

		if (structure && structure.length > 0) {
			this.container.classList.remove("hidden");
			this.container.classList.add("flex");
			if (this.skeleton) this.skeleton.classList.add("hidden");
		} else {
			this.container.classList.add("hidden");
			this.container.classList.remove("flex");
			if (this.skeleton) this.skeleton.classList.remove("hidden");
		}
	}

	_render(item) {
		const block = document.createElement("div");
		const hasChildren = item.children?.length > 0;

		block.dataset.elementId = item.element.dataset.structureId;

		this.bufferedStructureItem[block.dataset.elementId] = {
			tag: item.tag,
			context: item.context,
			label: item.label,
		};

		this._blockInterface(block, item, hasChildren);
		return block;
	}

	_blockInterface(block, item, hasChildren) {
		block.className = this.blockClassName;
		block.setAttribute("draggable", "true");

		const parentRow = document.createElement("div");
		parentRow.className = "structure-parent-row";

		const label = document.createElement("span");
		label.className = "structure-label";
		label.textContent = item.label || item.tag || "Block";

		const actions = document.createElement("div");
		actions.className = "structure-actions";

		const childrenWrapper = document.createElement("div");
		childrenWrapper.className = "structure-children hidden";

		// --- Restore expanded state ---
		if (this.expandedNodes.has(block.dataset.elementId)) {
			childrenWrapper.classList.remove("hidden");
		}

		if (hasChildren) {
			const eyeSpan = document.createElement("span");

			// --- Correct initial icon based on expanded state ---
			if (this.expandedNodes.has(block.dataset.elementId)) {
				eyeSpan.innerHTML = `<i class="fas fa-eye structure-eye"></i>`;
			} else {
				eyeSpan.innerHTML = `<i class="fas fa-eye-slash structure-eye"></i>`;
			}

			eyeSpan.addEventListener("click", (ev) => {
				ev.stopPropagation();
				const isHidden = childrenWrapper.classList.contains("hidden");

				if (isHidden) {
					childrenWrapper.classList.remove("hidden");
					eyeSpan.innerHTML = `<i class="fas fa-eye structure-eye"></i>`;
					this.expandedNodes.add(block.dataset.elementId);
				} else {
					childrenWrapper.classList.add("hidden");
					eyeSpan.innerHTML = `<i class="fas fa-eye-slash structure-eye"></i>`;
					this.expandedNodes.delete(block.dataset.elementId);
				}
			});

			actions.appendChild(eyeSpan);
		}

		// Trash icon
		const trashSpan = document.createElement("span");
		trashSpan.innerHTML = `<i class="fas fa-trash structure-trash"></i>`;
		trashSpan.addEventListener("click", (ev) => {
			ev.stopPropagation();
			if (confirm("Are you sure you want to delete it?")) {
				const id = block.dataset.elementId;
				const compiledEl = this.findCompiledEl(id);

				if (compiledEl) {
					compiledEl.remove();
					this.updateTree(this.dropManager.getStructure());
				}
			}
		});
		actions.appendChild(trashSpan);

		// Drag icon
		const dragIconSpan = document.createElement("span");
		dragIconSpan.innerHTML = `<i class="fas fa-up-down-left-right structure-drag"></i>`;
		actions.appendChild(dragIconSpan);

		parentRow.appendChild(label);
		parentRow.appendChild(actions);
		block.appendChild(parentRow);

		parentRow.addEventListener("click", (e) => {
			e.stopPropagation();

			// clear old selection
			if (this.selectedBlock) {
				this.selectedBlock.classList.remove("selected");
			}

			// set new
			this.selectedBlock = block;
			block.classList.add("selected");
			this.container.focus(); // allow keyboard nav
		});

		if (hasChildren) {
			item.children.forEach(child => {
				const childBlock = this._render(child);
				childrenWrapper.appendChild(childBlock);
			});
		}
		block.appendChild(childrenWrapper);
	}

	// ---------------------- DROP ZONE HANDLING ----------------------

	setupContainerDropZone() {
		if (this._containerDropInitialized || !this.container) return;
		this._containerDropInitialized = true;

		this.container.addEventListener("dragover", (e) => {
			if (!this.dropManager?.draggedElement) {
				this._clearHoverState();
				return;
			}
			e.preventDefault();

			let under = document.elementFromPoint(e.clientX, e.clientY);
			if (!under || !this.container.contains(under)) {
				this._handleContainerEdgeHover(e);
				return;
			}

			let hover = under.closest("." + this.blockClassName);
			if (hover && hover.classList.contains("dragging")) {
				hover.style.pointerEvents = "none";
				const nextUnder = document.elementFromPoint(e.clientX, e.clientY);
				hover.style.pointerEvents = "";
				hover = nextUnder ? nextUnder.closest("." + this.blockClassName) : null;
			}

			if (hover && this.container.contains(hover)) {
				const rect = hover.getBoundingClientRect();
				const offsetY = e.clientY - rect.top;
				const zone = rect.height > 0 ? offsetY / rect.height : 0.5;

				if (this._lastHover && this._lastHover !== hover) {
					this._lastHover.classList.remove("drop-inside");
				}
				this._lastHover = hover;
				this.dropLine.style.display = "none";

				if (zone < 0.25) {
					// ABOVE
					this._showDropLine(rect.left, rect.top, rect.width);
					this.dropMeta = { target: hover, pos: "above" };
				} else if (zone > 0.75) {
					// BELOW
					this._showDropLine(rect.left, rect.bottom, rect.width);
					this.dropMeta = { target: hover, pos: "below" };
				} else {
					// INSIDE
					hover.classList.add("drop-inside");
					this.dropMeta = { target: hover, pos: "inside" };
				}
				return;
			}

			this._handleContainerEdgeHover(e);
		});

		this.container.addEventListener("dragleave", () => {
			this._clearHoverState();
		});

		this.container.addEventListener("drop", (e) => {
			e.preventDefault();
			this.dropLine.style.display = "none";

			const dragged = this.dropManager.draggedElement;
			if (!dragged || !this.dropMeta) return;

			const { target, pos } = this.dropMeta;
			let compiledTarget = null;
			if (target) {
				const id = target.dataset.elementId;
				compiledTarget = this.findCompiledEl(id);
			}

			if (pos === "above" || pos === "below") {
				this.dropManager.insertSorted(compiledTarget?.parentElement, dragged, compiledTarget, pos);
			} else if (pos === "inside") {
				compiledTarget?.appendChild(dragged);
			} else if (pos === "empty") {
				this.dropManager.root.appendChild(dragged);
			} else if (pos === "above-first") {
				const firstBlock = this.container.querySelector("." + this.blockClassName);
				if (firstBlock) {
					const id = firstBlock.dataset.elementId;
					const compiledFirst = this.findCompiledEl(id);
					this.dropManager.insertSorted(compiledFirst.parentElement, dragged, compiledFirst, "above");
				}
			} else if (pos === "below-last") {
				const lastBlock = this.container.querySelectorAll("." + this.blockClassName);
				if (lastBlock.length) {
					const last = lastBlock[lastBlock.length - 1];
					const id = last.dataset.elementId;
					const compiledLast = this.findCompiledEl(id);
					this.dropManager.insertSorted(compiledLast.parentElement, dragged, compiledLast, "below");
				}
			}

			this.dropManager.draggedElement = null;
			this._clearHoverState();
			this.updateTree(this.dropManager.getStructure());
		});
	}

	_handleContainerEdgeHover(e) {
		if (!this.dropManager?.draggedElement) {
			this._clearHoverState();
			return;
		}

		const blocks = this.container.querySelectorAll("." + this.blockClassName);
		if (blocks.length === 0) {
			const rect = this.container.getBoundingClientRect();
			this._showDropLine(rect.left, rect.top, rect.width);
			this.dropMeta = { target: null, pos: "empty" };
			return;
		}

		const firstBlock = blocks[0];
		const lastBlock = blocks[blocks.length - 1];
		const rectFirst = firstBlock.getBoundingClientRect();
		const rectLast = lastBlock.getBoundingClientRect();

		if (e.clientY < rectFirst.top) {
			this._showDropLine(rectFirst.left, rectFirst.top, rectFirst.width);
			this.dropMeta = { target: firstBlock, pos: "above-first" };
			this._clearHoverHighlight();
			return;
		}

		if (e.clientY > rectLast.bottom) {
			this._showDropLine(rectLast.left, rectLast.bottom, rectLast.width);
			this.dropMeta = { target: lastBlock, pos: "below-last" };
			this._clearHoverHighlight();
			return;
		}

		this._clearHoverState();
	}

	_clearHoverState() {
		this.dropLine.style.display = "none";
		this._clearHoverHighlight();
		this.dropMeta = null;
	}

	_clearHoverHighlight() {
		if (this._lastHover) {
			this._lastHover.classList.remove("drop-inside");
			this._lastHover = null;
		}
	}

	_showDropLine(left, top, width) {
		Object.assign(this.dropLine.style, {
			width: width + "px",
			left: left + "px",
			top: top + "px",
			display: "block"
		});
	}

	// ---------------------- DRAG DELEGATION ----------------------

	setupDragDelegation() {
		if (this._delegationInit || !this.container) return;
		this._delegationInit = true;

		this.container.addEventListener("dragstart", (e) => {
			const item = e.target.closest("." + this.blockClassName);
			if (!item) return;

			e.stopPropagation();
			e.dataTransfer.effectAllowed = "move";

			const ghost = document.createElement("div");
			ghost.textContent = item.querySelector(".structure-label")?.textContent || "Dragging";
			Object.assign(ghost.style, {
				position: "absolute",
				top: "-9999px",
				left: "-9999px",
				padding: "4px 8px",
				background: "#fff",
				border: "1px solid #ccc",
				borderRadius: "4px",
				fontSize: "12px",
				color: "#111"
			});
			document.body.appendChild(ghost);
			e.dataTransfer.setDragImage(ghost, 0, 0);
			setTimeout(() => ghost.remove(), 0);

			item.classList.add("dragging");
			item.style.opacity = "0.5";

			const id = item.dataset.elementId;
			const compiledEl = this.findCompiledEl(id);

			if (compiledEl) {
				this.dropManager.draggedElement = compiledEl;
				try {
					e.dataTransfer.setData("text/plain", id);
				} catch {}
			}
		});

		this.container.addEventListener("dragend", () => {
			this.container.querySelectorAll("." + this.blockClassName + ".dragging")
				.forEach(el => {
					el.classList.remove("dragging");
					el.style.opacity = "";
				});

			this._clearHoverState();
			if (this.dropManager?.draggedElement) {
				this.dropManager.draggedElement = null;
			}
		});

		// --- Keyboard navigation for moving selected block ---
		this.container.tabIndex = 0; // make container focusable
		this.container.addEventListener("keydown", (e) => {
			if (!this.selectedBlock) return;

			const id = this.selectedBlock.dataset.elementId;
			const compiledEl = this.findCompiledEl(id);

			if (!compiledEl) return;

			if (e.key === "ArrowUp") {
				const prev = this.selectedBlock.previousElementSibling;
				if (prev) {
					prev.before(this.selectedBlock);
					compiledEl.parentElement.insertBefore(compiledEl, compiledEl.previousElementSibling);
				}
			} else if (e.key === "ArrowDown") {
				const next = this.selectedBlock.nextElementSibling;
				if (next) {
					next.after(this.selectedBlock);
					compiledEl.parentElement.insertBefore(compiledEl, compiledEl.nextElementSibling.nextSibling);
				}
			}
		});
	}

	findCompiledEl(id) {
		return Array.from(this.dropManager.doc.body.querySelectorAll(".droppable"))
			.find(el => el.dataset.structureId === id)
	}

	// ---------------------- DROP LINE ----------------------

	createDropLine() {
		let line = document.getElementById("structure-drop-line");
		if (!line) {
			line = document.createElement("div");
			line.id = "structure-drop-line";
			Object.assign(line.style, {
				position: "absolute",
				height: "2px",
				background: "#28a745",
				zIndex: 9999,
				display: "none",
			});
			document.body.appendChild(line);
		}
		return line;
	}
}