import { BLOCK_MIME } from './DropManager.js';

export class BlocksManager
{
	constructor(identifier, dropManager) {
		this.categories = {};
		this.container = document.getElementById(identifier);
		this.dropManager = dropManager;
	}

	/**
	 * Register a category
	 *
	 * Blocks: { label, icon, type, content?, container? }
	 *  - content:   HTML used to create the element (defaults to an empty <type>)
	 *  - container: true when other blocks can be dropped inside it
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
	 */
	renderBlockPanels(categories) {
		Object.values(categories).forEach(({ label, blocks }) => {

			// Panel wrapper
			const section = document.createElement('div');
			section.className = 'flex flex-col gap-3 mb-5';

			// Header
			const header = document.createElement('div');
			header.className = 'flex items-center gap-2';
			header.innerHTML = `
				<div class="h-px flex-1 bg-gray-200"></div>
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"></h3>
				<div class="h-px flex-1 bg-gray-200"></div>
			`;
			header.querySelector('h3').textContent = label;
			section.appendChild(header);

			// Grid for blocks
			const grid = document.createElement('div');
			grid.className = 'grid grid-cols-2 gap-3';

			blocks.forEach(block => {
				const spec = { kind: 'block', ...block };
				const item = document.createElement('div');
				item.className = 'flex flex-col justify-center items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-grab bg-white hover:border-[#0072F4] transition-colors';
				item.classList.add('item-block');
				item.setAttribute('draggable', 'true');
				item.title = `Drag to the canvas or click to add ${block.label}`;

				item.addEventListener('dragstart', (e) => {
					e.dataTransfer.effectAllowed = 'copy';
					e.dataTransfer.setData(BLOCK_MIME, JSON.stringify(spec));
				});

				item.addEventListener('click', () => {
					const manager = this.dropManager;
					if (manager && manager.doc) manager.insertAtSelection(manager.createBlock(spec));
				});

				item.innerHTML = `
					<i class="${block.icon} w-6 h-6 text-gray-600"></i>
					<span class="font-medium text-xs leading-4 text-neutral-600"></span>
				`;
				item.querySelector('span').textContent = block.label;

				grid.appendChild(item);
			});

			section.appendChild(grid);
			this.container.appendChild(section);
		});
	}

	renderAll() {
		this.renderBlockPanels(this.categories);
	}
}

export default function init(identifier, dropManager) {
	return new BlocksManager(identifier, dropManager);
}
