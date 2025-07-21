class ToolsManager {
	constructor(containerSelector) {
		this.container = document.getElementById(containerSelector);
		this.tabBar = document.createElement('div');
		this.tabBar.className = 'tab-bar';

		this.underline = document.createElement('div');
		this.underline.className = 'tab-underline';
		this.tabBar.appendChild(this.underline);
		this.container.appendChild(this.tabBar);

		this.tabs = [];
		this.tabContents = [];

		this.tabBar.addEventListener('click', e => {
			const tab = e.target.closest('.tab');
			if (tab) this.activateTab(tab.dataset.tab);
		});
	}

	addTab({ tab, description, icon, contentIdentifier = '', fallback = null }) {
		// Create the tab button
		const tabEl = document.createElement('div');
		tabEl.className = 'tab';
		tabEl.dataset.tab = tab;
		tabEl.title = description;
		tabEl.innerHTML = `<i class="${icon}"></i>`;
		this.tabBar.insertBefore(tabEl, this.underline);
		this.tabs.push(tabEl);

		// Create the content container
		const contentEl = document.createElement('div');
		contentEl.className = 'tab-content';
		contentEl.dataset.tab = tab;
		if (contentIdentifier) contentEl.id = contentIdentifier;

		this.container.appendChild(contentEl);
		this.tabContents.push(contentEl);

		// Execute fallback after tab and content are rendered
		if (typeof fallback === 'function') {
			requestAnimationFrame(() => fallback());
		}

		// Activate the first tab
		if (this.tabs.length === 1) {
			this.activateTab(tab);
		}
	}

	activateTab(tabName) {
		this.tabs.forEach(tab => {
			tab.classList.toggle('active', tab.dataset.tab === tabName);
		});

		this.tabContents.forEach(content => {
			content.classList.toggle('active', content.dataset.tab === tabName);
		});

		// Defer underline position update to next frame (after layout)
		requestAnimationFrame(() => this.updateUnderline());
	}

	updateUnderline() {
		const activeTab = this.tabBar.querySelector('.tab.active');
		if (!activeTab) return;

		const { offsetLeft, offsetWidth } = activeTab;
		this.underline.style.transform = `translateX(${offsetLeft}px)`;
		this.underline.style.width = `${offsetWidth}px`;
	}
}

export default function init(identifier) {
	return new ToolsManager(identifier);
}