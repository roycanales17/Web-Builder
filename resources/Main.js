function structureView(identifier, dropManager) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./StructureViewer.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => {
		const StructureViewer = module.default;
		const viewer = new StructureViewer(identifier, dropManager);
		viewer.init();
		return viewer;
	});
}

function dropManagerInit(identifier) {
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

function blockManagerInit(identifier, callback) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./BlocksManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => callback(module.default(identifier)));
}

function toolsManagerInit(identifier, callback) {
	const getModule = (() => {
		let modulePromise;
		return () => {
			if (!modulePromise) {
				modulePromise = import('./ToolsManager.js');
			}
			return modulePromise;
		};
	})();

	return getModule().then(module => callback(module.default(identifier)));
}
