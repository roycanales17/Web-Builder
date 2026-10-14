/**
 * Snapshot based undo/redo stack.
 *
 * Snapshots are plain strings (serialized canvas HTML). The manager does not
 * know how to read or apply them; the owner passes them in through `push()`
 * and applies whatever `undo()` / `redo()` return.
 */
export default class HistoryManager {
	constructor(initialSnapshot = '', limit = 100) {
		this.limit = limit;
		this.reset(initialSnapshot);
	}

	reset(snapshot = '') {
		this.stack = [snapshot];
		this.index = 0;
	}

	get current() {
		return this.stack[this.index];
	}

	/**
	 * Record a new state. Identical consecutive snapshots are ignored so that
	 * no-op actions do not create empty undo steps.
	 */
	push(snapshot) {
		if (snapshot === this.current) return false;

		this.stack = this.stack.slice(0, this.index + 1);
		this.stack.push(snapshot);

		if (this.stack.length > this.limit) {
			this.stack.shift();
		}
		this.index = this.stack.length - 1;
		return true;
	}

	canUndo() {
		return this.index > 0;
	}

	canRedo() {
		return this.index < this.stack.length - 1;
	}

	undo() {
		if (!this.canUndo()) return null;
		this.index--;
		return this.current;
	}

	redo() {
		if (!this.canRedo()) return null;
		this.index++;
		return this.current;
	}
}
