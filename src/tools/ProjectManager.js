import HistoryManager from './HistoryManager.js';

const STORAGE_KEY = 'web-builder:project';
const PROJECT_VERSION = 1;

/** Slugs whose file names the export already uses (index.html, css/style.css). */
const RESERVED_SLUGS = ['index', 'style'];

export function slugify(text) {
	return String(text || '')
		.toLowerCase()
		.normalize('NFKD').replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'page';
}

/** File name a page is exported as; the first page is always index.html. */
export const pageFileName = (page, index) => (index === 0 ? 'index.html' : `${page.slug}.html`);

const newPageId = () => `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Owns the multi-page project: page list, which page is on the canvas,
 * per-page undo/redo history and persistence to localStorage.
 *
 * Page shape: { id, name, slug, title, html, styles }
 * The first page is always exported as index.html.
 */
export default class ProjectManager {
	constructor(dropManager, styleManager) {
		this.drop = dropManager;
		this.styles = styleManager;
		this.pages = [];
		this.currentId = null;
		this.histories = new Map();
		this.listeners = [];
		this.storageError = null;
	}

	async init() {
		await this.drop.ready;
		this.styles.attach(this.drop.doc);

		const saved = this._load();
		if (saved) {
			this.pages = saved.pages;
			this.styles.setSiteCSS(saved.siteCSS || '');
		} else {
			this.pages = [this._createPage('Home')];
		}
		this._openPage(saved?.currentId && this.getPage(saved.currentId) ? saved.currentId : this.pages[0].id);

		this.drop.onChange(() => this.record());
		// Blocks can ship default styles: { desktop: {...}, tablet: {...}, mobile: {...} }
		this.drop.onCreate((el, spec) => {
			Object.entries(spec.styles || {}).forEach(([device, decls]) => {
				this.styles.replace(this.drop.ensureId(el), decls, device);
			});
		});
		this.drop.onClone((source, copy) => {
			this.styles.copy(source.dataset.structureId, copy.dataset.structureId);
		});

		const onKeyDown = e => this._onKeyDown(e);
		document.addEventListener('keydown', onKeyDown);
		this.drop.doc.addEventListener('keydown', onKeyDown);
		return this;
	}

	// ----------------------------------------------------------------- pages

	get current() {
		return this.getPage(this.currentId);
	}

	getPage(id) {
		return this.pages.find(p => p.id === id) || null;
	}

	/** File name used on export. */
	fileName(page) {
		return page === this.pages[0] ? 'index.html' : `${page.slug}.html`;
	}

	onChange(fn) {
		this.listeners.push(fn);
		fn(this);
	}

	_emit() {
		this.listeners.forEach(fn => fn(this));
	}

	_uniqueSlug(name, exceptId = null) {
		const base = slugify(name);
		let slug = base;
		let n = 2;
		while (RESERVED_SLUGS.includes(slug) || this.pages.some(p => p.slug === slug && p.id !== exceptId)) {
			slug = `${base}-${n++}`;
		}
		return slug;
	}

	_createPage(name, data = {}) {
		return {
			id: newPageId(),
			name,
			slug: this._uniqueSlug(name),
			title: data.title || name,
			html: data.html || '',
			styles: data.styles || {},
			hideInNav: Boolean(data.hideInNav),
		};
	}

	addPage(name, options = {}) {
		name = String(name || '').trim();
		if (!name) return null;
		this._syncCurrent();
		const page = this._createPage(name, options);
		this.pages.push(page);
		this._openPage(page.id);
		return page;
	}

	duplicatePage(id) {
		const source = this.getPage(id);
		if (!source) return null;
		this._syncCurrent();
		const page = this._createPage(`${source.name} copy`, JSON.parse(JSON.stringify(source)));
		this.pages.splice(this.pages.indexOf(source) + 1, 0, page);
		this._openPage(page.id);
		return page;
	}

	updatePage(id, changes) {
		const page = this.getPage(id);
		if (!page) return;
		if (changes.name !== undefined && String(changes.name).trim()) page.name = String(changes.name).trim();
		if (changes.slug !== undefined) page.slug = this._uniqueSlug(changes.slug || page.name, id);
		if (changes.title !== undefined) page.title = String(changes.title);
		if (changes.hideInNav !== undefined) page.hideInNav = Boolean(changes.hideInNav);
		this.save();
		this._emit();
	}

	deletePage(id) {
		if (this.pages.length <= 1) return false;
		const index = this.pages.findIndex(p => p.id === id);
		if (index === -1) return false;

		this.pages.splice(index, 1);
		this.histories.delete(id);
		if (id === this.currentId) {
			this.currentId = null;
			this._openPage(this.pages[Math.max(0, index - 1)].id);
		}
		this.save();
		this._emit();
		return true;
	}

	openPage(id) {
		if (id === this.currentId || !this.getPage(id)) return;
		this._syncCurrent();
		this._openPage(id);
	}

	_openPage(id) {
		const page = this.getPage(id);
		this.currentId = id;
		this.styles.load(page.styles);
		// Any page may come from storage or an import, not only the first one opened.
		this.drop.setContentHTML(page.html, { sanitizeInput: true });

		if (!this.histories.has(id)) {
			this.histories.set(id, new HistoryManager(this._snapshot()));
		}
		this.save();
		this._emit();
	}

	// --------------------------------------------------------------- history

	_snapshot() {
		return JSON.stringify({ html: this.drop.getContentHTML(), styles: this.styles.snapshot() });
	}

	/** Copy the canvas state into the current page object. */
	_syncCurrent() {
		const page = this.current;
		if (!page || !this.drop.doc) return;

		page.html = this.drop.getContentHTML();
		const ids = new Set(Array.from(this.drop.doc.querySelectorAll('[data-structure-id]')).map(el => el.dataset.structureId));
		this.styles.prune(ids);
		page.styles = this.styles.snapshot();
	}

	/** Record the current canvas state as an undo step and autosave. */
	record() {
		this._syncCurrent();
		// Same shape as _snapshot(), built from the state _syncCurrent just serialized.
		const page = this.current;
		this.histories.get(this.currentId)?.push(JSON.stringify({ html: page.html, styles: page.styles }));
		this._persist(this._data());
		this._emit();
	}

	get history() {
		return this.histories.get(this.currentId);
	}

	undo() {
		this._applySnapshot(this.history?.undo());
	}

	redo() {
		this._applySnapshot(this.history?.redo());
	}

	_applySnapshot(snapshot) {
		if (snapshot == null) return;
		const { html, styles } = JSON.parse(snapshot);
		this.styles.load(styles);
		this.drop.setContentHTML(html);
		this._syncCurrent();
		this._persist(this._data());
		this._emit();
	}

	_onKeyDown(e) {
		if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
		const key = e.key.toLowerCase();
		if (key !== 'z' && key !== 'y') return;

		// Leave native undo to text fields and inline text editing.
		const t = e.target;
		if (this.drop.editingElement || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;

		e.preventDefault();
		if (key === 'y' || e.shiftKey) this.redo();
		else this.undo();
	}

	// ------------------------------------------------------------ site styles

	setSiteCSS(css) {
		this.styles.setSiteCSS(css);
		this.save();
	}

	// ----------------------------------------------------------- persistence

	toJSON() {
		this._syncCurrent();
		return this._data();
	}

	/** Project data as currently held in the page objects (no canvas sync). */
	_data() {
		return {
			app: 'web-builder',
			version: PROJECT_VERSION,
			currentId: this.currentId,
			siteCSS: this.styles.siteCSS,
			pages: this.pages.map(({ id, name, slug, title, html, styles, hideInNav }) => ({ id, name, slug, title, html, styles, hideInNav })),
		};
	}

	save() {
		this._persist(this.toJSON());
	}

	_persist(data) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			this.storageError = null;
		} catch (err) {
			// Storage can be full or unavailable (private mode); keep working in memory.
			if (!this.storageError) console.warn('Could not save the project to localStorage.', err);
			this.storageError = err;
		}
	}

	_load() {
		try {
			return ProjectManager.validate(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
		} catch (err) {
			return null;
		}
	}

	/** Returns a normalised project object, or null when the data is not a project. */
	static validate(data) {
		if (!data || typeof data !== 'object' || !Array.isArray(data.pages) || !data.pages.length) return null;
		const seen = new Set();
		const slugs = new Set(RESERVED_SLUGS);
		const pages = data.pages
			.filter(p => p && typeof p === 'object')
			.map((p, i) => {
				let id = typeof p.id === 'string' && p.id ? p.id : newPageId();
				if (seen.has(id)) id = newPageId();
				seen.add(id);

				const name = String(p.name || `Page ${i + 1}`);
				const base = slugify(p.slug || name);
				let slug = base;
				for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;
				slugs.add(slug);

				return {
					id,
					name,
					slug,
					title: String(p.title ?? name),
					html: String(p.html || ''),
					styles: p.styles && typeof p.styles === 'object' ? p.styles : {},
					hideInNav: Boolean(p.hideInNav),
				};
			});
		if (!pages.length) return null;
		return { pages, currentId: data.currentId, siteCSS: String(data.siteCSS || '') };
	}

	/** Replace the whole project (import). */
	load(data) {
		const project = ProjectManager.validate(data);
		if (!project) throw new Error('This file is not a Web Builder project.');

		this.pages = project.pages;
		this.histories.clear();
		this.styles.setSiteCSS(project.siteCSS);
		this.currentId = null;
		const startId = this.getPage(project.currentId) ? project.currentId : this.pages[0].id;
		this._openPage(startId);
	}

	/** Remove everything from the current page (undoable). */
	clearPage() {
		this.drop.select(null);
		this.styles.load({});
		this.drop.setContentHTML('');
		this.record();
	}
}
