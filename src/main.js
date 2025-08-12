const canvas_area = document.getElementById('drop-zone');
const viewport_actions = document.querySelectorAll('[data-viewport]');
const toolbar_btn_padding = document.getElementById('btn-toolbar-padding');
const toolbar_btn_borders = document.getElementById('btn-toolbar-borders');

function showConfiguration(tabName) {
	// Hide all tab contents
	document.querySelectorAll('[data-tab]').forEach(tab => {
		tab.classList.remove('active');
	});

	// Show the selected one
	const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
	if (activeTab) {
		activeTab.classList.add('active');
	}

	// Remove 'active' from all buttons
	document.querySelectorAll('[data-tab-target]').forEach(button => {
		button.classList.remove('active');
	});

	// Add 'active' to the clicked button
	const activeButton = document.querySelector(`[data-tab-target="${tabName}"]`);
	if (activeButton) {
		activeButton.classList.add('active');
	}
}

function blockManagerInit(identifier, callback) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./tools/BlocksManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => callback(module.default(identifier)));
}

function dropManagerInit(identifier) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./tools/DropManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => module.default(identifier));
}

viewport_actions.forEach(button => {
	button.addEventListener('click', () => {
		viewport_actions.forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');

		// Remove any existing max-width class
		canvas_area.classList.remove('max-w-[375px]', 'max-w-[768px]', 'max-w-full');

		// Add new width class based on viewport
		const viewport = button.getAttribute('data-viewport');
		switch (viewport) {
			case 'mobile':
				canvas_area.classList.add('max-w-[375px]');
				break;
			case 'tablet':
				canvas_area.classList.add('max-w-[768px]');
				break;
			case 'desktop':
			default:
				canvas_area.classList.add('max-w-full');
				break;
		}
	});
});

document.querySelectorAll('[data-tab-target]').forEach(button => {
	button.addEventListener('click', () => {
		const target = button.getAttribute('data-tab-target');
		showConfiguration(target);
	});
});

document.addEventListener('DOMContentLoaded', async function () {
	const dropManager = await dropManagerInit('drop-zone');

	blockManagerInit('blocks-panel', blockManager => {
		blockManager.createPanel('layouts', 'Layouts', (block) => {
			block.register({ label: 'Row', icon: 'fas fa-columns', type: 'div', context: 'Row' });
			block.register({ label: 'Section', icon: 'fas fa-object-group', type: 'section', context: 'Section' });
			block.register({ label: 'Container', icon: 'fas fa-square-full', type: 'div', context: 'Container' });
			block.register({ label: 'Grid', icon: 'fas fa-th', type: 'div', context: 'Grid Container' });
		});

		blockManager.createPanel('controls', 'Form Controls', (block) => {
			block.register({ label: 'Input', icon: 'fas fa-i-cursor', type: 'input', context: 'Type here' });
			block.register({ label: 'Button', icon: 'fas fa-mouse-pointer', type: 'button', context: 'Click me' });
			block.register({ label: 'Checkbox', icon: 'fas fa-check-square', type: 'input', context: 'Checkbox' });
			block.register({ label: 'Select', icon: 'fas fa-caret-down', type: 'select', context: 'Select Option' });
			block.register({ label: 'Textarea', icon: 'fas fa-align-left', type: 'textarea', context: 'Write something...' });
		});

		blockManager.createPanel('components', 'Components', (block) => {
			block.register({ label: 'List', icon: 'fas fa-list-ul', type: 'ul', context: 'List' });
			block.register({ label: 'Image', icon: 'fas fa-image', type: 'img', context: 'Image' });
			block.register({ label: 'Icon', icon: 'fas fa-star', type: 'i', context: 'Icon' });
			block.register({ label: 'Divider', icon: 'fas fa-minus', type: 'hr', context: 'Divider' });
		});

		blockManager.createPanel('content', 'Content', (block) => {
			block.register({ label: 'Heading', icon: 'fas fa-heading', type: 'h1', context: 'Header' });
			block.register({ label: 'Paragraph', icon: 'fas fa-align-left', type: 'p', context: 'Paragraph' });
			block.register({ label: 'Quote', icon: 'fas fa-quote-left', type: 'blockquote', context: 'Quote' });
			block.register({ label: 'Code', icon: 'fas fa-code', type: 'code', context: '<code>code here</code>' });
		});

		blockManager.createPanel('media', 'Media', (block) => {
			block.register({ label: 'Video', icon: 'fas fa-video', type: 'video', context: 'Video' });
			block.register({ label: 'Audio', icon: 'fas fa-music', type: 'audio', context: 'Audio' });
			block.register({ label: 'Embed', icon: 'fas fa-code', type: 'iframe', context: '<iframe></iframe>' });
		});

		blockManager.createPanel('interactive', 'Interactive', (block) => {
			block.register({ label: 'Tabs', icon: 'fas fa-folder', type: 'div', context: 'Tabs' });
			block.register({ label: 'Accordion', icon: 'fas fa-bars', type: 'div', context: 'Accordion' });
			block.register({ label: 'Carousel', icon: 'fas fa-images', type: 'div', context: 'Carousel' });
		});

		blockManager.renderAll();
	});

	toolbar_btn_borders.addEventListener('click', () => {
		const isActive = toolbar_btn_borders.classList.toggle('active');
		dropManager.toggleBorders(isActive);
	});

	toolbar_btn_padding.addEventListener('click', () => {
		const isActive = toolbar_btn_padding.classList.toggle('active');
		dropManager.togglePadding(isActive);
	});
});





