import { BASE_CSS } from './StyleManager.js';
import { pageFileName } from './ProjectManager.js';

/** Where template images live, as an absolute URL (so exports can bundle them). */
const ASSETS_URL = new URL('blocks/resources/', document.baseURI).href;

/** Width templates are rendered at before being scaled down into a thumbnail. */
const THUMBNAIL_RENDER_WIDTH = 1280;

/** Pages used to fill {{nav}} in thumbnails. */
const SAMPLE_PAGES = [
	{ name: 'Home', file: 'index.html' },
	{ name: 'About', file: 'about.html' },
	{ name: 'Services', file: 'services.html' },
	{ name: 'Contact', file: 'contact.html' },
];

const escapeHTML = text => String(text)
	.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Context used to fill template placeholders:
 *  - pages:       [{ name, file }] for {{nav}}
 *  - currentFile: the page being edited (gets aria-current="page")
 *  - pageName:    replaces {{page}}
 */
export function navContext(pages, page) {
	const index = pages.indexOf(page);
	return {
		pages: pages
			.map((p, i) => ({ name: p.name, file: pageFileName(p, i), hidden: p.hideInNav }))
			.filter(p => !p.hidden),
		currentFile: index === -1 ? '' : pageFileName(page, index),
		pageName: page ? page.name : 'Page title',
	};
}

export function projectContext(project, page = project.current) {
	return navContext(project.pages, page);
}

export const SAMPLE_CONTEXT = { pages: SAMPLE_PAGES, currentFile: 'index.html', pageName: 'About us' };

function navLinks(context) {
	return context.pages
		.map(({ name, file }) => {
			const current = file === context.currentFile ? ' aria-current="page"' : '';
			return `<a href="${escapeHTML(file)}"${current}>${escapeHTML(name)}</a>`;
		})
		.join('\n');
}

/**
 * Rewrite the links of every `[data-nav]` menu under `root` from the page list.
 * Only touches menus whose links actually changed. Returns true if any did.
 */
export function syncNavs(root, context) {
	const menus = root.querySelectorAll('[data-nav]');
	if (!menus.length) return false;

	const template = root.ownerDocument.createElement('template');
	template.innerHTML = navLinks(context);
	const html = template.innerHTML;

	let changed = false;
	menus.forEach(menu => {
		if (menu.innerHTML.trim() === html) return;
		menu.innerHTML = html;
		changed = true;
	});
	return changed;
}

/** Fill a template's placeholders and turn it into a block spec for DropManager. */
export function resolveTemplate(template, context = SAMPLE_CONTEXT) {
	const content = template.content
		.replace(/\{\{assets\}\}/g, ASSETS_URL)
		.replace(/\{\{nav\}\}/g, () => navLinks(context))
		.replace(/\{\{page\}\}/g, () => escapeHTML(context.pageName));

	return { kind: 'template', id: template.id, label: template.label, content };
}

/**
 * Render HTML, scaled down, inside `frame` as a live thumbnail.
 * `frame` should be position: relative with a fixed height.
 */
export function renderThumbnail(frame, html, height = 150) {
	if (frame.querySelector('iframe')) return;

	const iframe = document.createElement('iframe');
	iframe.setAttribute('aria-hidden', 'true');
	iframe.tabIndex = -1;
	iframe.setAttribute('sandbox', '');
	iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
		html, body { overflow: hidden; pointer-events: none; }</style></head>
		<body>${html}</body></html>`;

	const scale = (frame.clientWidth || 260) / THUMBNAIL_RENDER_WIDTH;
	Object.assign(iframe.style, {
		position: 'absolute',
		top: '0',
		left: '0',
		width: `${THUMBNAIL_RENDER_WIDTH}px`,
		height: `${Math.ceil(height / scale)}px`,
		border: '0',
		transform: `scale(${scale})`,
		transformOrigin: '0 0',
		pointerEvents: 'none',
	});
	frame.appendChild(iframe);
}

/** Lazily render thumbnails once their frame scrolls into view. */
export function lazyThumbnails(root, render) {
	if (!('IntersectionObserver' in window)) {
		return { observe: frame => render(frame) };
	}
	const observer = new IntersectionObserver(entries => entries.forEach(entry => {
		if (!entry.isIntersecting) return;
		render(entry.target);
		observer.unobserve(entry.target);
	}), { root });
	return observer;
}

/** Template objects for a page template's section ids (unknown ids are skipped). */
export function pageSections(pageTemplate, sectionTemplates) {
	const byId = new Map(sectionTemplates.map(t => [t.id, t]));
	return (pageTemplate.sections || []).map(id => byId.get(id)).filter(Boolean);
}
