const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TAGS = new Set(['pre', 'textarea', 'script']);
const INLINE_TAGS = new Set([
	'a', 'abbr', 'b', 'br', 'button', 'code', 'em', 'i', 'img', 'input', 'label', 'mark', 'q', 's',
	'select', 'option', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'svg', 'path',
]);

const INDENT = '\t';

/**
 * Attributes / classes that only exist to make the canvas editable.
 * They are removed from anything that leaves the editor (preview, code, publish).
 */
export const EDITOR_ATTRIBUTES = ['data-buffer', 'data-structure-id', 'data-dropzone', 'draggable', 'contenteditable'];
export const EDITOR_CLASSES = [
	'droppable', 'drop-target-highlight', 'wb-selected', 'wb-debug', 'wb-debug-spacing', 'wb-dragging',
];

const escapeText = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function openTag(el) {
	const outer = el.cloneNode(false).outerHTML;
	return VOID_TAGS.has(el.localName) ? outer : outer.slice(0, outer.lastIndexOf('</'));
}

function isInlineOnly(el) {
	return Array.from(el.childNodes).every(node => {
		if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) return true;
		if (node.nodeType !== Node.ELEMENT_NODE) return true;
		return INLINE_TAGS.has(node.localName) && isInlineOnly(node);
	});
}

function collapsedOuterHTML(el) {
	const clone = el.cloneNode(true);
	const walker = clone.ownerDocument.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		if (node.parentElement && RAW_TAGS.has(node.parentElement.localName)) continue;
		node.textContent = node.textContent.replace(/\s+/g, ' ');
	}
	// Trim the whitespace just inside the outer tag.
	const first = clone.firstChild;
	const last = clone.lastChild;
	if (first && first.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.replace(/^\s+/, '');
	if (last && last.nodeType === Node.TEXT_NODE) last.textContent = last.textContent.replace(/\s+$/, '');
	return clone.outerHTML;
}

export function dedent(text, indent = '') {
	const lines = text.replace(/\r/g, '').split('\n');
	while (lines.length && !lines[0].trim()) lines.shift();
	while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
	const min = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length));
	return lines.map(l => (l.trim() ? indent + l.slice(min).trimEnd() : '')).join('\n');
}

function format(node, depth, out) {
	const pad = INDENT.repeat(depth);

	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent.replace(/\s+/g, ' ').trim();
		if (text) out.push(pad + escapeText(text));
		return;
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return;

	const tag = node.localName;
	if (VOID_TAGS.has(tag)) {
		out.push(pad + openTag(node));
		return;
	}
	if (tag === 'style') {
		// Raw CSS (site CSS, imported rules, SVG <style> text) must not close the element early.
		const text = node.textContent.replace(/<\/(style)/gi, '<\\/$1');
		const css = text.trim() ? dedent(text, pad + INDENT) : '';
		out.push(pad + openTag(node), ...(css ? [css] : []), `${pad}</style>`);
		return;
	}
	if (RAW_TAGS.has(tag) || isInlineOnly(node)) {
		out.push(pad + (RAW_TAGS.has(tag) ? node.outerHTML : collapsedOuterHTML(node)));
		return;
	}

	out.push(pad + openTag(node));
	node.childNodes.forEach(child => format(child, depth + 1, out));
	out.push(`${pad}</${tag}>`);
}

/**
 * Pretty-print an element (or a whole document) as indented HTML.
 */
export function formatHTML(node) {
	const out = [];
	if (node.nodeType === Node.DOCUMENT_NODE) {
		out.push('<!DOCTYPE html>');
		format(node.documentElement, 0, out);
	} else {
		format(node, 0, out);
	}
	return out.join('\n');
}

/**
 * Remove editor-only attributes and classes from a (detached) subtree.
 */
export function stripEditorArtifacts(root) {
	root.querySelectorAll('[data-editor]').forEach(el => el.remove());
	const nodes = [root, ...root.querySelectorAll('*')];
	nodes.forEach(el => {
		if (!el.removeAttribute) return;
		EDITOR_ATTRIBUTES.forEach(attr => el.removeAttribute(attr));
		if (el.classList) {
			el.classList.remove(...EDITOR_CLASSES);
			if (!el.classList.length) el.removeAttribute('class');
		}
		if (el.getAttribute && el.getAttribute('style') === '') el.removeAttribute('style');
	});
	return root;
}

/**
 * Remove scripts, inline event handlers, srcdoc documents and javascript: URLs from markup
 * that comes from outside the editor (imports, saved projects).
 */
export function sanitize(root) {
	root.querySelectorAll('script, base, meta[http-equiv], object, embed').forEach(el => el.remove());
	[root, ...root.querySelectorAll('*')].forEach(el => {
		if (!el.attributes) return;
		Array.from(el.attributes).forEach(attr => {
			const name = attr.name.toLowerCase();
			const value = attr.value.replace(/[\s\u0000-\u001f]/g, '').toLowerCase();
			if (name.startsWith('on') || name === 'srcdoc') el.removeAttribute(attr.name);
			else if (['href', 'src', 'action', 'formaction', 'xlink:href'].includes(name) && value.startsWith('javascript:')) {
				el.removeAttribute(attr.name);
			}
		});
	});
	return root;
}
