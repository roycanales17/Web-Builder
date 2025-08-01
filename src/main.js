const canvas_area = document.getElementById('drop-zone');
const canvas_skeleton = document.getElementById('drop-zone-skeleton');
const viewport_actions = document.querySelectorAll('[data-viewport]');

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

document.querySelectorAll('[data-tab-target]').forEach(button => {
	button.addEventListener('click', () => {
		const target = button.getAttribute('data-tab-target');
		showConfiguration(target);
	});
});




