function dropManagerInit(identifier = '') {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./DropManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => module.default(identifier));
}

function blockManagerInit(callback) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./BlocksManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => callback(module.default()));
}

// Tab content controller
document.addEventListener('DOMContentLoaded', () => {
	const tabs = document.querySelectorAll('.tab');
	const contents = document.querySelectorAll('.tab-content');
	const underline = document.querySelector('.tab-underline');

	function moveUnderlineTo(tab) {
		underline.style.width = `${tab.offsetWidth}px`;
		underline.style.left = `${tab.offsetLeft}px`;
	}

	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			tabs.forEach(t => t.classList.remove('active'));
			tab.classList.add('active');

			const tabName = tab.dataset.tab;
			contents.forEach(c => {
				c.classList.toggle('active', c.dataset.tab === tabName);
			});

			moveUnderlineTo(tab);
		});
	});

	// Initialize underline position
	const activeTab = document.querySelector('.tab.active');
	if (activeTab) {
		moveUnderlineTo(activeTab);
	}
});
