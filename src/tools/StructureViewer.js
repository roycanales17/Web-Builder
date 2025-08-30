export default class StructureViewer {
	constructor(structureRootId, dropManager) {
		this.dropManager = dropManager;
		this.container = document.getElementById(structureRootId);
		this.blocksContainer = document.getElementById("structural-blocks");
		this.skeleton = document.getElementById("structural-blocks-skeleton");
		this.observer = null;

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
			return;
		}

		// Wait until iframe is ready
		if (this.dropManager.doc?.body) {
			this._initObserver();
		} else {
			const checkReady = setInterval(() => {
				if (this.dropManager.doc?.body) {
					clearInterval(checkReady);
					this._initObserver();
				}
			}, 100);
		}
	}

	/**
	 * Setup MutationObserver
	 */
	_initObserver() {
		if (this.observer) this.observer.disconnect();

		let debounceTimer = null;
		const debouncedRender = () => {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const structure = this.dropManager.getStructure();
				this.render(structure);
			}, 100);
		};

		this.observer = new MutationObserver(() => {
			debouncedRender();
		});

		this.observer.observe(this.dropManager.doc.body, {
			childList: true,
			subtree: true,
			attributes: true,
		});

		// Initial render
		this.render(this.dropManager.getStructure());
	}

	/**
	 * Render the blocks structure
	 */
	render(structure) {
		if (!this.blocksContainer || !this.skeleton) return;

		// If no blocks → show skeleton, hide blocks container
		if (!structure || structure.length === 0) {
			this.blocksContainer.innerHTML = "";
			this.blocksContainer.classList.add("hidden");
			this.blocksContainer.classList.remove("active");
			this.skeleton.classList.remove("hidden");
			return;
		}

		// Otherwise → hide skeleton, show blocks container
		this.skeleton.classList.add("hidden");
		this.blocksContainer.classList.remove("hidden");
		this.blocksContainer.classList.add("active");
		this.blocksContainer.innerHTML = "";

		// Render recursively
		structure.forEach(block => {
			const blockEl = this._renderBlock(block);
			this.blocksContainer.appendChild(blockEl);
		});
	}

	/**
	 * Create a block element recursively
	 */
	_renderBlock(block) {
		const hasChildren = block.children && block.children.length > 0;

		// Main container
		const blockEl = document.createElement("div");
		blockEl.setAttribute("draggable", "true");
		blockEl.className =
			"flex flex-col gap-2 bg-white px-2 py-2 border-1 rounded border-neutral-300 cursor-grab";

		// Parent row
		const parentRow = document.createElement("div");
		parentRow.className = "flex justify-between items-center flex-row";

		const label = document.createElement("span");
		label.className = "text-sm";
		label.textContent = block.tag || "Block";

		const actions = document.createElement("div");
		actions.className = "flex flex-row gap-2";

		// Children wrapper (start hidden by default)
		const childrenWrapper = document.createElement("div");
		childrenWrapper.className = "flex flex-col gap-2 hidden";

		// Eye toggle (only if children exist)
		if (hasChildren) {
			const eyeSpan = document.createElement('span');
			eyeSpan.innerHTML = `
				<i class="fas fa-eye-slash text-sm text-gray-400 hover:text-gray-600 !cursor-pointer"></i>
			`;

			eyeSpan.addEventListener("click", () => {
				const isHidden = childrenWrapper.classList.contains("hidden");

				if (isHidden) {
					childrenWrapper.classList.remove("hidden");
					eyeSpan.innerHTML = `
						<i class="fas fa-eye text-sm text-gray-400 hover:text-gray-600 !cursor-pointer"></i>
					`;
				} else {
					childrenWrapper.classList.add("hidden");
					eyeSpan.innerHTML = `
						<i class="fas fa-eye-slash text-sm text-gray-400 hover:text-gray-600 !cursor-pointer"></i>
					`;
				}
			});

			actions.appendChild(eyeSpan);
		}

		// Drag icon
		const dragIconSpan = document.createElement('span');
		const dragIcon = document.createElement("i");
		dragIcon.className =
			"fas fa-up-down-left-right text-sm hover:text-gray-600 text-gray-400";
		dragIconSpan.appendChild(dragIcon);
		actions.appendChild(dragIconSpan);

		parentRow.appendChild(label);
		parentRow.appendChild(actions);
		blockEl.appendChild(parentRow);

		// Append children recursively
		if (hasChildren) {
			block.children.forEach(child => {
				childrenWrapper.appendChild(this._renderBlock(child));
			});
		}

		blockEl.appendChild(childrenWrapper);

		return blockEl;
	}

	/**
	 * Cleanup observer
	 */
	destroy() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}
}