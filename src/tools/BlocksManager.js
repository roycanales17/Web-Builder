export class BlocksManager
{
	constructor(identifier) {
		this.categories = {};
		this.container = document.getElementById(identifier);
	}

	/**
	 * Register a categories
	 *
	 * @param category
	 * @param label
	 * @param callback
	 */
	createPanel(category, label, callback) {
		if (!this.categories[category]) {
			this.categories[category] = {
				blocks: [],
				label
			};
		} else {
			this.categories[category].label = label;
		}

		callback({
			register: (block) => {
				this.categories[category].blocks.push(block);
			}
		});
	}

	/**
	 * Create block element for categories
	 *
	 * @returns {HTMLDivElement}
	 */
	renderBlockPanels(categories) {
		Object.entries(categories).forEach(([key, { label, blocks }]) => {

			// Panel wrapper
			const section = document.createElement('div');
			section.className = 'flex flex-col gap-3 mb-5';

			// Header
			section.innerHTML = `
				<div class="flex items-center gap-2">
					<div class="h-px flex-1 bg-gray-200"></div>
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">${label}</h3>
					<div class="h-px flex-1 bg-gray-200"></div>
				</div>
			`;

			// Grid for blocks
			const grid = document.createElement('div');
			grid.className = 'grid grid-cols-2 gap-3';

			blocks.forEach(block => {
				const item = document.createElement('div');
				item.className = 'flex flex-col justify-center items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-grab bg-white';
				item.classList.add('item-block');
				item.setAttribute('draggable', 'true');

				// Drag event for DropManager
				item.addEventListener('dragstart', (e) => {
					e.dataTransfer.setData('type', block.type);
					e.dataTransfer.setData('context', block.context);
					e.dataTransfer.setData('label', block.label);
				});

				item.innerHTML = `
					<i class="${block.icon} w-6 h-6 text-gray-600 group-hover:text-primary"></i>
					<span class="font-medium text-xs leading-4 text-neutral-600">${block.label}</span>
				`;

				grid.appendChild(item);
			});

			section.appendChild(grid);
			this.container.appendChild(section);
		});
	}

	renderAll() {
		this.renderBlockPanels(this.categories);
		console.log(this.categories)
	}
}

export default function init(identifier) {
	return new BlocksManager(identifier);
}