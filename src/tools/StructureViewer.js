export default class StructureViewer {
	constructor(structureRootId, dropManager) {
		this.container = document.getElementById(structureRootId);
		this.skeleton = document.getElementById(`${structureRootId}-skeleton`);
		this.dropManager = dropManager;
		this.blockClassName = "structure-block";
		this.bufferedStructureItem = {};
		this.expandedNodes = new Set();

		// floating drop-line element (positioned/ sized inline)
		this.dropLine = this.createDropLine();

		// state for current hover / target
		this.dropTarget = null;
		this._lastHover = null;

		// guards so we attach listeners only once
		this._containerDropInitialized = false;
		this._delegationInit = false;

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
		}
		if (!this.skeleton) {
			console.warn(`StructureViewer: skeleton #${structureRootId}-skeleton not found`);
		}
	}

	/**
	 * Render the structure list and wire up handlers.
	 * structure: array from dropManager.getStructure()
	 */
	updateTree(structure) {
		// clear and render
		this.container.innerHTML = "";

		structure.forEach(item => {
			const block = this._render(item);
			this.container.appendChild(block);
		});

		// Ensure drop zone handlers are installed (only once)
		this.setupContainerDropZone();

		// Use delegated dragstart/dragend handlers (only once)
		this.setupDragDelegation();

		// toggle skeleton <-> container (use explicit hidden/flex toggles)
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

		// dataset maps to structureId produced by dropManager.getStructure()
		block.dataset.elementId = item.element.dataset.structureId;

		// cache simple meta (used for dataTransfer / user hints)
		this.bufferedStructureItem[block.dataset.elementId] = {
			tag: item.tag,
			context: item.context,
			label: item.label,
		};

		this._blockInterface(block, item, hasChildren);
		return block;
	}

	_blockInterface(block, item, hasChildren) {
		// base class and draggable
		block.className = this.blockClassName; // or tailwind string if you already converted
		block.setAttribute("draggable", "true");

		// Parent row
		const parentRow = document.createElement("div");
		parentRow.className = "structure-parent-row";

		// Label
		const label = document.createElement("span");
		label.className = "structure-label";
		label.textContent = item.label || item.tag || "Block";

		// Actions container
		const actions = document.createElement("div");
		actions.className = "structure-actions";

		// Children wrapper
		const childrenWrapper = document.createElement("div");
		childrenWrapper.className = "structure-children hidden";

		// Eye toggle when children exist
		if (hasChildren) {
			const eyeSpan = document.createElement("span");
			eyeSpan.innerHTML = `<i class="fas fa-eye-slash structure-eye"></i>`;

			eyeSpan.addEventListener("click", (ev) => {
				ev.stopPropagation();
				const isHidden = childrenWrapper.classList.contains("hidden");
				if (isHidden) {
					childrenWrapper.classList.remove("hidden");
					eyeSpan.innerHTML = `<i class="fas fa-eye structure-eye"></i>`;
				} else {
					childrenWrapper.classList.add("hidden");
					eyeSpan.innerHTML = `<i class="fas fa-eye-slash structure-eye"></i>`;
				}
			});

			actions.appendChild(eyeSpan);
		}

		// Drag handle icon
		const dragIconSpan = document.createElement("span");
		dragIconSpan.innerHTML = `<i class="fas fa-up-down-left-right structure-drag"></i>`;
		actions.appendChild(dragIconSpan);

		// assemble
		parentRow.appendChild(label);
		parentRow.appendChild(actions);
		block.appendChild(parentRow);

		// Recursively append children
		if (hasChildren) {
			item.children.forEach(child => {
				const childBlock = this._render(child);
				childrenWrapper.appendChild(childBlock);
			});
		}
		block.appendChild(childrenWrapper);

		// We don't attach per-block dragover/drop here anymore.
		// Container-level logic (setupContainerDropZone) handles hover/line/positions centrally.
	}

	/**
	 * Container-level central drop handlers (handles nested cases reliably).
	 */
	setupContainerDropZone() {
		if (this._containerDropInitialized || !this.container) return;
		this._containerDropInitialized = true;

		// dragover: compute nearest block under cursor (ignoring the element with .dragging)
		this.container.addEventListener("dragover", (e) => {
			// only active when an element from the canvas is being tracked by dropManager
			if (!this.dropManager?.draggedElement) {
				this._clearHoverState();
				return;
			}

			// we always preventDefault to enable dropping
			e.preventDefault();

			// find topmost element under the cursor
			let under = document.elementFromPoint(e.clientX, e.clientY);
			// ensure under is inside our container; if not, fallback to above/below logic later
			if (!under || !this.container.contains(under)) {
				// fallback: above-first / below-last / empty
				this._handleContainerEdgeHover(e);
				return;
			}

			// find the nearest structure block ancestor
			let hover = under.closest("." + this.blockClassName);

			// If the hover element is the currently dragging item, temporarily ignore it
			if (hover && hover.classList.contains("dragging")) {
				hover.style.pointerEvents = "none"; // remove from hit-testing
				const nextUnder = document.elementFromPoint(e.clientX, e.clientY);
				hover.style.pointerEvents = ""; // restore
				hover = nextUnder ? nextUnder.closest("." + this.blockClassName) : null;
			}

			// If we found a hover block inside the container, compute the 3-zone (top/inside/bottom)
			if (hover && this.container.contains(hover)) {
				const rect = hover.getBoundingClientRect();
				const offsetY = e.clientY - rect.top;
				const zone = rect.height > 0 ? offsetY / rect.height : 0.5;

				// clear previous hover visuals if changed
				if (this._lastHover && this._lastHover !== hover) {
					this._lastHover.classList.remove("drop-inside");
				}
				this._lastHover = hover;

				// clear drop-line first
				this.dropLine.style.display = "none";

				if (zone < 0.25) {
					// top zone → show line above
					this.dropLine.style.width = rect.width + "px";
					this.dropLine.style.left = rect.left + "px";
					this.dropLine.style.top = rect.top + "px";
					this.dropLine.style.display = "block";

					hover.dataset.dropPosition = "above";
					this.dropTarget = hover;
					delete this.container.dataset.dropPosition;
				} else if (zone > 0.75) {
					// bottom zone → show line below
					this.dropLine.style.width = rect.width + "px";
					this.dropLine.style.left = rect.left + "px";
					this.dropLine.style.top = rect.bottom + "px";
					this.dropLine.style.display = "block";

					hover.dataset.dropPosition = "below";
					this.dropTarget = hover;
					delete this.container.dataset.dropPosition;
				} else {
					// middle zone → highlight as "drop inside"
					hover.classList.add("drop-inside");
					hover.dataset.dropPosition = "inside";
					this.dropTarget = hover;
					delete this.container.dataset.dropPosition;
				}
				return;
			}

			// if no hover block found (cursor in empty part of container), fallback to edge handling
			this._handleContainerEdgeHover(e);
		});

		// hide drop visuals when leaving container
		this.container.addEventListener("dragleave", () => {
			this._clearHoverState();
		});

		// centralized drop handler
		this.container.addEventListener("drop", (e) => {
			e.preventDefault();
			this.dropLine.style.display = "none";

			const dragged = this.dropManager.draggedElement;
			if (!dragged) return;

			// If we have a dropTarget block (above/inside/below)
			if (this.dropTarget) {
				const id = this.dropTarget.dataset.elementId;
				const compiledTarget = Array.from(this.dropManager.doc.body.querySelectorAll(".droppable"))
					.find(el => el.dataset.structureId === id);
				if (compiledTarget) {
					const pos = this.dropTarget.dataset.dropPosition;
					if (pos === "above" || pos === "below") {
						this.dropManager.insertSorted(compiledTarget.parentElement, dragged, compiledTarget, pos);
					} else if (pos === "inside") {
						compiledTarget.appendChild(dragged);
					}
				}
			} else {
				// Otherwise container-level positions (empty / above-first / below-last)
				const pos = this.container.dataset.dropPosition;
				if (pos === "empty") {
					this.dropManager.root.appendChild(dragged);
				} else if ((pos === "above-first" || pos === "below-last") && this.dropTarget) {
					const id = this.dropTarget.dataset.elementId;
					const compiledTarget = Array.from(this.dropManager.doc.body.querySelectorAll(".droppable"))
						.find(el => el.dataset.structureId === id);
					if (compiledTarget) {
						const insertionMode = pos === "above-first" ? "above" : "below";
						this.dropManager.insertSorted(compiledTarget.parentElement, dragged, compiledTarget, insertionMode);
					}
				}
			}

			// reset dragged state and rerender
			this.dropManager.draggedElement = null;
			this._clearHoverState();
			this.updateTree(this.dropManager.getStructure());
		});
	}

	/**
	 * Handle above-first / below-last / empty cases when no block hovered.
	 * Separated for readability.
	 */
	_handleContainerEdgeHover(e) {
		// we only show these when there is a dragged element
		if (!this.dropManager?.draggedElement) {
			this._clearHoverState();
			return;
		}

		const blocks = this.container.querySelectorAll("." + this.blockClassName);
		if (blocks.length === 0) {
			// empty container
			e.preventDefault();
			const rect = this.container.getBoundingClientRect();
			this.dropLine.style.width = rect.width + "px";
			this.dropLine.style.left = rect.left + "px";
			this.dropLine.style.top = rect.top + "px";
			this.dropLine.style.display = "block";
			this.dropTarget = null;
			this.container.dataset.dropPosition = "empty";
			return;
		}

		// above-first or below-last depending on clientY
		const firstBlock = blocks[0];
		const lastBlock = blocks[blocks.length - 1];
		const rectFirst = firstBlock.getBoundingClientRect();
		const rectLast = lastBlock.getBoundingClientRect();

		// above-first
		if (e.clientY < rectFirst.top) {
			e.preventDefault();
			this.dropLine.style.width = rectFirst.width + "px";
			this.dropLine.style.left = rectFirst.left + "px";
			this.dropLine.style.top = rectFirst.top + "px";
			this.dropLine.style.display = "block";
			this.dropTarget = firstBlock;
			this.container.dataset.dropPosition = "above-first";
			// clear any previous hover inside visuals
			if (this._lastHover) {
				this._lastHover.classList.remove("drop-inside");
				this._lastHover = null;
			}
			return;
		}

		// below-last
		if (e.clientY > rectLast.bottom) {
			e.preventDefault();
			this.dropLine.style.width = rectLast.width + "px";
			this.dropLine.style.left = rectLast.left + "px";
			this.dropLine.style.top = rectLast.bottom + "px";
			this.dropLine.style.display = "block";
			this.dropTarget = lastBlock;
			this.container.dataset.dropPosition = "below-last";
			if (this._lastHover) {
				this._lastHover.classList.remove("drop-inside");
				this._lastHover = null;
			}
			return;
		}

		// otherwise, clear visuals — no hover block found
		this._clearHoverState();
	}

	/**
	 * Clear drop visuals and hover state
	 */
	_clearHoverState() {
		this.dropLine.style.display = "none";
		if (this._lastHover) {
			this._lastHover.classList.remove("drop-inside");
			this._lastHover = null;
		}
		this.dropTarget = null;
		delete this.container.dataset.dropPosition;
	}

	/**
	 * Delegated dragstart / dragend handler installed once.
	 * Creates small drag ghost, marks the dragged structure-block with .dragging,
	 * and maps to the compiled element inside the canvas (dropManager.doc).
	 */
	setupDragDelegation() {
		if (this._delegationInit || !this.container) return;
		this._delegationInit = true;

		// dragstart delegation
		this.container.addEventListener("dragstart", (e) => {
			const item = e.target.closest("." + this.blockClassName);
			if (!item || !this.container.contains(item)) return;

			e.stopPropagation();
			e.dataTransfer.effectAllowed = "move";

			// small ghost so browser doesn't show the actual element
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

			// mark the structure block as dragging so we can ignore it in hit-testing
			item.classList.add("dragging");

			// map to compiled element in canvas iframe
			const id = item.dataset.elementId;
			const compiledEl = Array.from(this.dropManager.doc.body.querySelectorAll(".droppable"))
				.find(el => el.dataset.structureId === id);

			if (compiledEl) {
				this.dropManager.draggedElement = compiledEl;
				try {
					e.dataTransfer.setData("text/plain", id);
				} catch (err) { /* ignore security errors in some browsers */ }
			}
		});

		// dragend: cleanup visuals & states
		this.container.addEventListener("dragend", (e) => {
			// remove dragging class from any element (just in case)
			this.container.querySelectorAll("." + this.blockClassName + ".dragging")
				.forEach(el => el.classList.remove("dragging"));

			// hide line and reset state
			this._clearHoverState();

			// also clear dropManager.draggedElement if not already cleared by DropManager
			if (this.dropManager && this.dropManager.draggedElement) {
				this.dropManager.draggedElement = null;
			}
		});
	}

	/**
	 * Create or reuse a floating drop-line element (kept on body for overlay).
	 */
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
