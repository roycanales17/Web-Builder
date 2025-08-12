export default class HistoryManager {
	constructor(root) {
		this.root = root;
		this.history = [];
		this.historyIndex = -1;
		this.saveState(); // Initial state
	}

	saveState() {
		const snapshot = this.root.innerHTML;
		this.history = this.history.slice(0, this.historyIndex + 1);
		this.history.push(snapshot);
		this.historyIndex++;
	}

	undo(rebindCallback) {
		if (this.historyIndex > 0) {
			this.historyIndex--;
			this.root.innerHTML = this.history[this.historyIndex];
			if (typeof rebindCallback === 'function') {
				rebindCallback();
			}
		}
	}

	redo(rebindCallback) {
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			this.root.innerHTML = this.history[this.historyIndex];
			if (typeof rebindCallback === 'function') {
				rebindCallback();
			}
		}
	}
}
