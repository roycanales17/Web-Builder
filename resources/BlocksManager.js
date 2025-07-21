export class BlocksManager
{
	constructor(identifier, options = {}) {
		this.categories = {};
		this.container = document.getElementById(identifier);

		this.onCategoryChange = options.onCategoryChange || (() => {});
		this.initContainer(); // generate DOM structure
		this.initBackButton();
	}

	/**
	 * Generates an HTML for blocks
	 */
	initContainer() {
		this.container.innerHTML = `
			<div class="block-categories" id="category-list">
				<ul class="category-list"></ul>
			</div>
	
			<div class="category-wrapper">
				<div id="category-header">
					<button id="back-to-categories">← Back</button>
					<h4 id="category-title"></h4>
				</div>
	
				<div class="block-panels"></div>
			</div>
		`;

		// Rebind elements after injecting HTML
		this.categoryListEl = this.container.querySelector('#category-list');
		this.categoryWrapper = this.container.querySelector('.category-wrapper');
		this.categoryTitleEl = this.container.querySelector('#category-title');
		this.backBtn = this.container.querySelector('#back-to-categories');
		this.blockPanelsEl = this.container.querySelector('.block-panels');
	}


	/**
	 * Register a blocks
	 *
	 * @param category
	 * @param block
	 */
	register(category, block) {
		if (!this.categories[category]) {
			this.categories[category] = {
				blocks: [],
				label: category,
				icon: 'fas fa-cube'
			};
		}
		this.categories[category].blocks.push(block);
	}

	/**
	 * Register a categories
	 *
	 * @param category
	 * @param label
	 * @param icon
	 */
	setCategoryLabel(category, label, icon = 'fas fa-cube') {
		if (!this.categories[category]) {
			this.categories[category] = {
				blocks: [],
				label,
				icon
			};
		} else {
			this.categories[category].label = label;
			this.categories[category].icon = icon;
		}
	}

	/**
	 * Renders the categories
	 */
	renderCategories() {
		const ul = document.createElement('ul');
		ul.className = 'category-list';

		for (const key in this.categories) {
			const { label, icon } = this.categories[key];
			const li = document.createElement('li');
			const btn = document.createElement('button');
			btn.className = 'category-btn';
			btn.dataset.target = key;
			btn.innerHTML = `<i class="${icon}"></i><span>${label}</span>`;
			btn.addEventListener('click', () => this.handleCategoryClick(key, label));
			li.appendChild(btn);
			ul.appendChild(li);
		}

		this.categoryListEl.innerHTML = '';
		this.categoryListEl.appendChild(ul);
	}

	/**
	 * Renders the category panel
	 *
	 * @param categoryKey
	 */
	renderPanels(categoryKey) {
		const panel = this.getOrCreatePanel();

		// Clear previous blocks
		panel.innerHTML = '';

		// Get blocks of selected category
		const category = this.categories[categoryKey];
		if (!category) return;

		category.blocks.forEach(block => {
			const blockEl = this.createBlockElement(block);
			panel.appendChild(blockEl);
		});
	}

	/**
	 * Handle category click function
	 *
	 * @param key
	 * @param label
	 */
	handleCategoryClick(key, label) {
		// Hide category list
		this.categoryListEl.classList.add('hidden');

		// Update header title
		this.categoryTitleEl.textContent = label;

		// Render only selected category blocks
		this.renderPanels(key);

		// Slide in wrapper
		this.categoryWrapper.classList.remove('slide-out');
		this.categoryWrapper.classList.add('slide-in');

		this.onCategoryChange(key);
	}

	/**
	 * Fetch/show the category panel
	 *
	 * @returns {*}
	 */
	getOrCreatePanel() {
		let panel = this.blockPanelsEl.querySelector('.block-panel');
		if (!panel) {
			panel = document.createElement('div');
			panel.className = 'block-panel slide-in';
			this.blockPanelsEl.appendChild(panel);
		}
		return panel;
	}

	/**
	 * Category back button action
	 */
	initBackButton() {
		this.backBtn.addEventListener('click', () => {
			this.categoryWrapper.classList.remove('slide-in');
			this.categoryWrapper.classList.add('slide-out');

			setTimeout(() => {
				this.categoryListEl.classList.remove('hidden');
			}, 300);
		});
	}

	/**
	 * Create block element for categories
	 *
	 * @param label - Element label for block
	 * @param type - Element type
	 * @param context - Block content (HTML)
	 * @param thumbnail - Block thumbnail
	 * @param attributes - Element attributes
	 * @returns {HTMLDivElement}
	 */
	createBlockElement({ label, type, context, thumbnail, attributes = {} }) {
		const div = document.createElement('div');
		div.classList.add('block');
		div.setAttribute('draggable', 'true');
		div.textContent = label;

		// Apply extra attributes (like input type, placeholder, etc.)
		for (const attr in attributes) {
			div.setAttribute(attr, attributes[attr]);
		}

		// ⬇️ Required to make DropManager work with this block
		div.addEventListener('dragstart', e => {
			e.dataTransfer.setData('type', type);
			e.dataTransfer.setData('context', context);
			e.dataTransfer.setData('label', label);
		});

		return div;
	}

	/**
	 * Toggle category panel
	 */
	renderAll() {
		this.renderCategories();
		this.renderPanels();
	}
}

export default function init(identifier) {
	return new BlocksManager(identifier);
}