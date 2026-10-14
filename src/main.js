import initDropManager from './tools/DropManager.js';
import initBlocksManager from './tools/BlocksManager.js';
import StructureViewer from './tools/StructureViewer.js';
import StyleManager from './tools/StyleManager.js';
import ProjectManager from './tools/ProjectManager.js';
import EditorPanel from './tools/EditorPanel.js';
import ComponentsPanel from './tools/ComponentsPanel.js';
import { buildPageCode, buildPreviewHTML, exportSiteZip, pageFileName } from './tools/Exporter.js';
import { sanitize } from './tools/Serializer.js';
import registerBasicBlocks from './blocks.js';
import templates from '../blocks/components.js';

const canvas_area = document.getElementById('drop-zone');
const viewport_actions = document.querySelectorAll('[data-viewport]');
const toolbar_btn_debug = document.getElementById('btn-toolbar-debug');
const toolbar_btn_preview = document.getElementById('btn-toolbar-preview');

const VIEWPORT_WIDTHS = { desktop: 'max-w-full', tablet: 'max-w-[768px]', mobile: 'max-w-[375px]' };

function showConfiguration(tabName) {
	document.querySelectorAll('[data-tab]').forEach(tab => {
		tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
	});
	document.querySelectorAll('[data-tab-target]').forEach(button => {
		button.classList.toggle('active', button.getAttribute('data-tab-target') === tabName);
	});
}

function activeTab() {
	return document.querySelector('[data-tab].active')?.getAttribute('data-tab');
}

let toastTimer = null;
function toast(message) {
	const el = document.getElementById('toast');
	el.textContent = message;
	el.classList.add('show');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function download(filename, blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		const area = document.getElementById('code-output');
		area.select();
		document.execCommand('copy');
	}
}

document.querySelectorAll('[data-tab-target]').forEach(button => {
	button.addEventListener('click', () => showConfiguration(button.getAttribute('data-tab-target')));
});

// --------------------------------------------------------------------- setup

const drop = initDropManager('drop-zone');
const styles = new StyleManager();
const project = new ProjectManager(drop, styles);

const structureTree = new StructureViewer('structural-blocks', drop);
drop.onStructureChange(structure => structureTree.updateTree(structure));

const blockManager = initBlocksManager('blocks-panel', drop);
registerBasicBlocks(blockManager);
blockManager.renderAll();

new ComponentsPanel(
	{ listId: 'components-list', searchId: 'components-search', filtersId: 'components-filters' },
	templates,
	drop
);

project.init().then(() => {
	const editor = new EditorPanel('editor-panel', { drop, styles, project });

	// Selecting something on the canvas opens its properties (unless the
	// structure tree is in use).
	drop.doc.addEventListener('click', () => {
		if (drop.selected && activeTab() !== 'structure') showConfiguration('editor');
	});

	setupViewport(editor);
	setupPages();
	setupHistoryButtons();
	setupToolbar();
	setupCodeViewer();
	setupImportExport();
});

// ------------------------------------------------------------------ viewport

function setupViewport(editor) {
	viewport_actions.forEach(button => {
		button.addEventListener('click', () => {
			viewport_actions.forEach(btn => btn.classList.toggle('active', btn === button));

			const device = button.getAttribute('data-viewport');
			canvas_area.classList.remove(...Object.values(VIEWPORT_WIDTHS));
			canvas_area.classList.add(VIEWPORT_WIDTHS[device] || VIEWPORT_WIDTHS.desktop);
			editor.setDevice(device);
		});
	});
}

// --------------------------------------------------------------------- pages

function setupPages() {
	const select = document.getElementById('page-select');
	const status = document.getElementById('save-status');

	project.onChange(() => {
		select.replaceChildren(...project.pages.map((page, index) => {
			const option = document.createElement('option');
			option.value = page.id;
			option.textContent = `${page.name} — ${pageFileName(page, index)}`;
			option.selected = page.id === project.currentId;
			return option;
		}));
		document.getElementById('btn-page-delete').disabled = project.pages.length <= 1;
		status.textContent = project.storageError ? 'Not saved (storage full)' : 'Saved locally';
		status.classList.toggle('text-red-500', Boolean(project.storageError));
	});

	select.addEventListener('change', () => project.openPage(select.value));

	document.getElementById('btn-page-add').addEventListener('click', () => {
		const name = prompt('Name of the new page', `Page ${project.pages.length + 1}`);
		if (name && project.addPage(name)) toast(`Page "${name.trim()}" added`);
	});

	document.getElementById('btn-page-duplicate').addEventListener('click', () => {
		const page = project.duplicatePage(project.currentId);
		if (page) toast(`Duplicated as "${page.name}"`);
	});

	document.getElementById('btn-page-delete').addEventListener('click', () => {
		const page = project.current;
		if (project.pages.length > 1 && confirm(`Delete the page "${page.name}"? This cannot be undone.`)) {
			project.deletePage(page.id);
			toast(`Page "${page.name}" deleted`);
		}
	});

	document.getElementById('btn-clear-page').addEventListener('click', () => {
		if (confirm('Remove everything from this page? (You can undo this.)')) project.clearPage();
	});
}

function setupHistoryButtons() {
	const undo = document.getElementById('btn-toolbar-undo');
	const redo = document.getElementById('btn-toolbar-redo');
	undo.addEventListener('click', () => project.undo());
	redo.addEventListener('click', () => project.redo());
	project.onChange(() => {
		undo.disabled = !project.history?.canUndo();
		redo.disabled = !project.history?.canRedo();
	});
}

// ------------------------------------------------------------------- toolbar

function setupToolbar() {
	toolbar_btn_debug.addEventListener('click', () => {
		const isActive = toolbar_btn_debug.classList.toggle('active');
		drop.togglePadding(isActive);
		drop.toggleBorders(isActive);
	});

	toolbar_btn_preview.addEventListener('click', () => {
		const previewWindow = window.open('', 'web-builder-preview');
		if (!previewWindow) {
			toast('Allow pop-ups for this site to open the preview.');
			return;
		}
		renderPreview(previewWindow, project.toJSON(), project.currentId);
		previewWindow.focus();
	});

	document.getElementById('btn-toolbar-publish').addEventListener('click', publish);
}

/** Render a page into the preview window; links to other pages keep working. */
function renderPreview(previewWindow, data, pageId) {
	const doc = previewWindow.document;
	doc.open();
	doc.write(buildPreviewHTML(data, pageId));
	doc.close();

	const banner = doc.createElement('div');
	banner.textContent = 'Preview — press Esc to close';
	Object.assign(banner.style, {
		position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: '2147483647',
		padding: '10px 18px', borderRadius: '8px', background: 'rgba(0,0,0,.85)', color: '#fff',
		font: '14px sans-serif', pointerEvents: 'none', transition: 'opacity .5s',
	});
	doc.body.appendChild(banner);
	setTimeout(() => { banner.style.opacity = '0'; }, 3000);
	setTimeout(() => banner.remove(), 3600);

	doc.addEventListener('keydown', e => {
		if (e.key === 'Escape') previewWindow.close();
	});
	doc.addEventListener('submit', e => e.preventDefault());
	doc.addEventListener('click', e => {
		const link = e.target.closest('a[href]');
		const href = link?.getAttribute('href') || '';
		if (!link || href.startsWith('#') || /^[a-z]+:/i.test(href)) return;

		e.preventDefault();
		const index = data.pages.findIndex((page, i) => pageFileName(page, i) === href.split(/[?#]/)[0]);
		if (index !== -1) renderPreview(previewWindow, data, data.pages[index].id);
	});
}

async function publish() {
	const button = document.getElementById('btn-toolbar-publish');
	if (button.disabled) return;
	button.disabled = true;
	toast('Building your site…');
	try {
		const data = project.toJSON();
		download('website.zip', await exportSiteZip(data));
		toast(`Exported ${data.pages.length} page${data.pages.length === 1 ? '' : 's'} with generated CSS.`);
	} catch (err) {
		console.error(err);
		toast('Export failed — see the console for details.');
	} finally {
		button.disabled = false;
	}
}

// --------------------------------------------------------------- code viewer

function setupCodeViewer() {
	const modal = document.getElementById('code-modal');
	const output = document.getElementById('code-output');
	const tabs = document.getElementById('code-tabs');
	let files = [];
	let current = 0;

	const showFile = index => {
		current = index;
		output.value = files[index].content;
		tabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
	};

	const open = () => {
		const code = buildPageCode(project.toJSON(), project.currentId);
		files = [
			{ name: code.fileName, content: code.html },
			{ name: 'css/style.css', content: code.sharedCSS },
		];
		if (code.css) files.splice(1, 0, { name: `css/${code.fileName.replace(/\.html$/, '.css')}`, content: code.css });

		tabs.replaceChildren(...files.map((file, i) => {
			const button = document.createElement('button');
			button.className = 'btn';
			button.textContent = file.name;
			button.addEventListener('click', () => showFile(i));
			return button;
		}));
		showFile(0);
		modal.classList.add('open');
	};

	const close = () => modal.classList.remove('open');

	document.getElementById('btn-toolbar-code').addEventListener('click', open);
	document.getElementById('btn-view-code').addEventListener('click', open);
	document.getElementById('btn-code-close').addEventListener('click', close);
	document.getElementById('btn-code-download').addEventListener('click', publish);
	document.getElementById('btn-code-copy').addEventListener('click', async () => {
		await copyText(files[current]?.content || '');
		toast(`Copied ${files[current]?.name}`);
	});
	modal.addEventListener('click', e => { if (e.target === modal) close(); });
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && modal.classList.contains('open')) close();
	});
}

// ------------------------------------------------------------ import/export

function setupImportExport() {
	const fileInput = document.getElementById('project-import-file');

	document.getElementById('btn-project-export').addEventListener('click', () => {
		const json = JSON.stringify(project.toJSON(), null, 2);
		download('web-builder-project.json', new Blob([json], { type: 'application/json' }));
		toast('Project exported');
	});

	document.getElementById('btn-project-import').addEventListener('click', () => fileInput.click());

	fileInput.addEventListener('change', async () => {
		const file = fileInput.files[0];
		fileInput.value = '';
		if (!file) return;

		try {
			const text = await file.text();
			if (/\.json$/i.test(file.name) || file.type === 'application/json') {
				if (!confirm('Importing a project replaces all current pages. Continue?')) return;
				project.load(JSON.parse(text));
				toast(`Imported ${project.pages.length} page${project.pages.length === 1 ? '' : 's'}`);
			} else {
				importHTMLPage(text);
				toast('HTML added to the current page');
			}
		} catch (err) {
			console.error(err);
			toast(err.message || 'Could not import this file.');
		}
	});
}

/** Append an HTML document's body (and embedded styles) to the current page. */
function importHTMLPage(text) {
	const parsed = new DOMParser().parseFromString(text, 'text/html');
	sanitize(parsed.documentElement);

	const parts = Array.from(parsed.head.querySelectorAll('style')).map(style => style.outerHTML);
	Array.from(parsed.body.children).forEach(el => {
		if (el.localName !== 'style' && !el.hasAttribute('data-buffer')) {
			el.setAttribute('data-buffer', JSON.stringify({ label: el.id || el.localName, type: el.localName }));
		}
		parts.push(el.outerHTML);
	});

	drop.setContentHTML(drop.getContentHTML() + parts.join('\n'), { sanitizeInput: true });
	project.record();
}
