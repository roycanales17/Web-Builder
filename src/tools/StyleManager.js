/**
 * Responsive style store.
 *
 * Styles are kept per element (keyed by its structure id) and per device, and
 * compiled into real CSS. The canvas renders them through a generated <style>
 * element; the exporter compiles the same rules with clean selectors. Nothing
 * is written into inline `style` attributes, so exported pages only depend on
 * the generated stylesheet.
 */

/** Media query used for each device. Desktop rules have no media query. */
export const DEVICES = {
	desktop: null,
	tablet: '(max-width: 900px)',
	mobile: '(max-width: 575px)',
};

/** Base stylesheet shared by the canvas and every exported page. */
export const BASE_CSS = `*, *::before, *::after {
	box-sizing: border-box;
}

html, body {
	margin: 0;
	padding: 0;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	line-height: 1.6;
	color: #1f2937;
}

img, video {
	max-width: 100%;
	height: auto;
}`;

const cleanValue = value => String(value ?? '').replace(/[{}<]/g, '').trim();
const cleanProp = prop => String(prop || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

export function declarationsToText(decls, indent = '') {
	return Object.entries(decls || {})
		.map(([prop, value]) => `${indent}${prop}: ${value};`)
		.join('\n');
}

/** Parse "prop: value; prop2: value2" into an object. */
export function parseDeclarations(text) {
	const out = {};
	String(text || '').split(';').forEach(part => {
		const index = part.indexOf(':');
		if (index === -1) return;
		const prop = cleanProp(part.slice(0, index));
		const value = cleanValue(part.slice(index + 1));
		if (prop && value) out[prop] = value;
	});
	return out;
}

export default class StyleManager {
	constructor() {
		this.rules = {};     // { [id]: { desktop: {prop: value}, tablet: {...}, mobile: {...} } }
		this.siteCSS = '';   // free-form CSS shared by all pages
		this.elements = {};
	}

	/**
	 * Create the <style> elements inside the canvas document. Site and
	 * generated styles go at the end of <body> (as editor-owned nodes) so the
	 * cascade order matches the export: base → templates → site → generated.
	 */
	attach(doc) {
		const make = (id, parent) => {
			let el = doc.getElementById(id);
			if (!el) {
				el = doc.createElement('style');
				el.id = id;
				el.setAttribute('data-editor', '');
				parent.appendChild(el);
			}
			return el;
		};
		this.elements.base = make('wb-base-css', doc.head);
		this.elements.site = make('wb-site-css', doc.body);
		this.elements.generated = make('wb-generated-css', doc.body);
		this.elements.base.textContent = BASE_CSS;
		this.render();
	}

	get(id, device = 'desktop') {
		return { ...(this.rules[id]?.[device] || {}) };
	}

	getValue(id, prop, device = 'desktop') {
		return this.rules[id]?.[device]?.[prop] || '';
	}

	set(id, prop, value, device = 'desktop') {
		prop = cleanProp(prop);
		value = cleanValue(value);
		if (!id || !prop) return;

		const rule = this.rules[id] || (this.rules[id] = {});
		const decls = rule[device] || (rule[device] = {});
		if (value) decls[prop] = value;
		else delete decls[prop];

		this._compact(id);
		this.render();
	}

	/** Replace every declaration of one element for one device. */
	replace(id, decls, device = 'desktop') {
		if (!id) return;
		const rule = this.rules[id] || (this.rules[id] = {});
		rule[device] = {};
		Object.entries(decls || {}).forEach(([prop, value]) => {
			prop = cleanProp(prop);
			value = cleanValue(value);
			if (prop && value) rule[device][prop] = value;
		});
		this._compact(id);
		this.render();
	}

	copy(fromId, toId) {
		if (!this.rules[fromId]) return;
		this.rules[toId] = JSON.parse(JSON.stringify(this.rules[fromId]));
		this.render();
	}

	/** Forget rules of elements that no longer exist. */
	prune(existingIds) {
		Object.keys(this.rules).forEach(id => {
			if (!existingIds.has(id)) delete this.rules[id];
		});
	}

	_compact(id) {
		const rule = this.rules[id];
		if (!rule) return;
		Object.keys(rule).forEach(device => {
			if (!Object.keys(rule[device]).length) delete rule[device];
		});
		if (!Object.keys(rule).length) delete this.rules[id];
	}

	load(rules) {
		this.rules = JSON.parse(JSON.stringify(rules || {}));
		this.render();
	}

	snapshot() {
		return JSON.parse(JSON.stringify(this.rules));
	}

	setSiteCSS(css) {
		this.siteCSS = String(css || '');
		this.render();
	}

	/**
	 * Compile rules to CSS.
	 * @param {Object} rules
	 * @param {(id: string) => string|null} selectorFor  selector for an element id, or null to skip it
	 */
	static compile(rules, selectorFor) {
		const blocks = [];
		Object.entries(DEVICES).forEach(([device, media]) => {
			const css = Object.entries(rules || {})
				.map(([id, rule]) => {
					const selector = rule[device] && selectorFor(id);
					if (!selector) return '';
					const indent = media ? '\t\t' : '\t';
					const close = media ? '\t}' : '}';
					return `${media ? '\t' : ''}${selector} {\n${declarationsToText(rule[device], indent)}\n${close}`;
				})
				.filter(Boolean)
				.join('\n\n');

			if (css) blocks.push(media ? `@media ${media} {\n${css}\n}` : css);
		});
		return blocks.join('\n\n');
	}

	render() {
		if (this.elements.site) this.elements.site.textContent = this.siteCSS;
		if (!this.elements.generated) return;
		// `:is(#_, …)` gives the rule ID specificity, matching the `#id`
		// selectors used on export, so edits win over template stylesheets.
		this.elements.generated.textContent = StyleManager.compile(
			this.rules,
			id => `:is(#_, [data-structure-id="${CSS.escape(id)}"])`
		);
	}
}
