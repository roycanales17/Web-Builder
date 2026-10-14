import { declarationsToText, parseDeclarations } from './StyleManager.js';
import { EDITOR_CLASSES } from './Serializer.js';

const DEVICE_LABELS = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
const DEVICE_FALLBACK = { desktop: [], tablet: ['desktop'], mobile: ['tablet', 'desktop'] };
const NO_TEXT_TAGS = new Set(['input', 'img', 'hr', 'br', 'video', 'audio', 'iframe', 'select', 'textarea', 'svg']);

const sel = (...options) => ({ type: 'select', options: ['', ...options] });

const STYLE_GROUPS = [
	{ title: 'Layout', open: true, fields: [
		{ prop: 'display', ...sel('block', 'flex', 'grid', 'inline-block', 'inline', 'none') },
		{ prop: 'flex-direction', ...sel('row', 'column', 'row-reverse', 'column-reverse') },
		{ prop: 'flex-wrap', ...sel('wrap', 'nowrap') },
		{ prop: 'justify-content', ...sel('flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly') },
		{ prop: 'align-items', ...sel('stretch', 'flex-start', 'center', 'flex-end', 'baseline') },
		{ prop: 'gap', placeholder: '16px' },
		{ prop: 'grid-template-columns', placeholder: 'repeat(3, 1fr)', wide: true },
		{ prop: 'flex', placeholder: '1' },
		{ prop: 'order', placeholder: '0' },
	] },
	{ title: 'Size', fields: [
		{ prop: 'width', placeholder: 'auto' },
		{ prop: 'max-width', placeholder: 'none' },
		{ prop: 'height', placeholder: 'auto' },
		{ prop: 'min-height', placeholder: '0' },
	] },
	{ title: 'Spacing', open: true, fields: [
		{ prop: 'padding', placeholder: '16px 24px' },
		{ prop: 'margin', placeholder: '0 auto' },
	] },
	{ title: 'Typography', open: true, fields: [
		{ prop: 'font-size', placeholder: '16px' },
		{ prop: 'font-weight', ...sel('300', '400', '500', '600', '700', '800') },
		{ prop: 'color', type: 'color' },
		{ prop: 'text-align', ...sel('left', 'center', 'right', 'justify') },
		{ prop: 'line-height', placeholder: '1.6' },
		{ prop: 'letter-spacing', placeholder: '0' },
		{ prop: 'font-family', placeholder: 'Georgia, serif', wide: true },
		{ prop: 'text-transform', ...sel('none', 'uppercase', 'lowercase', 'capitalize') },
		{ prop: 'text-decoration', ...sel('none', 'underline', 'line-through') },
	] },
	{ title: 'Background', fields: [
		{ prop: 'background-color', type: 'color' },
		{ prop: 'background-size', ...sel('cover', 'contain', 'auto') },
		{ prop: 'background-image', placeholder: 'url(https://…) or linear-gradient(…)', wide: true },
		{ prop: 'background-position', placeholder: 'center' },
		{ prop: 'background-repeat', ...sel('no-repeat', 'repeat', 'repeat-x', 'repeat-y') },
	] },
	{ title: 'Border', fields: [
		{ prop: 'border', placeholder: '1px solid #e5e7eb', wide: true },
		{ prop: 'border-radius', placeholder: '8px' },
		{ prop: 'border-color', type: 'color' },
		{ prop: 'box-shadow', placeholder: '0 4px 12px rgba(0,0,0,.1)', wide: true },
	] },
	{ title: 'Position & effects', fields: [
		{ prop: 'position', ...sel('static', 'relative', 'absolute', 'fixed', 'sticky') },
		{ prop: 'z-index', placeholder: 'auto' },
		{ prop: 'top', placeholder: 'auto' },
		{ prop: 'left', placeholder: 'auto' },
		{ prop: 'opacity', placeholder: '1' },
		{ prop: 'overflow', ...sel('visible', 'hidden', 'auto', 'scroll') },
		{ prop: 'object-fit', ...sel('cover', 'contain', 'fill', 'none') },
		{ prop: 'transition', placeholder: 'all .2s ease' },
	] },
];

const ATTRIBUTE_FIELDS = {
	img: [{ attr: 'src', label: 'Image URL', upload: 'image/*' }, { attr: 'alt', label: 'Alt text' }],
	a: [{ attr: 'href', label: 'Link (URL or page)', pages: true }, { attr: 'target', label: 'Open in new tab', toggle: '_blank' }],
	input: [
		{ attr: 'type', label: 'Type', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'checkbox', 'radio', 'submit'] },
		{ attr: 'placeholder', label: 'Placeholder' },
		{ attr: 'name', label: 'Name' },
		{ attr: 'value', label: 'Value' },
	],
	textarea: [{ attr: 'placeholder', label: 'Placeholder' }, { attr: 'name', label: 'Name' }, { attr: 'rows', label: 'Rows' }],
	button: [{ attr: 'type', label: 'Type', options: ['button', 'submit', 'reset'] }],
	select: [{ attr: 'name', label: 'Name' }],
	form: [{ attr: 'action', label: 'Action URL' }, { attr: 'method', label: 'Method', options: ['get', 'post'] }],
	video: [
		{ attr: 'src', label: 'Video URL', upload: 'video/*' },
		{ attr: 'poster', label: 'Poster image URL' },
		{ attr: 'controls', label: 'Show controls', toggle: '' },
		{ attr: 'autoplay', label: 'Autoplay', toggle: '' },
		{ attr: 'loop', label: 'Loop', toggle: '' },
		{ attr: 'muted', label: 'Muted', toggle: '' },
	],
	audio: [{ attr: 'src', label: 'Audio URL', upload: 'audio/*' }, { attr: 'controls', label: 'Show controls', toggle: '' }],
	iframe: [{ attr: 'src', label: 'Embed URL' }, { attr: 'title', label: 'Title' }],
};

const INPUT_CLASS = 'w-full min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#0072F4]';
const LABEL_CLASS = 'block mb-1 text-[11px] font-medium text-neutral-500';
const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;

const DOM_PROPERTIES = new Set(['value', 'checked', 'selected', 'disabled', 'open']);

/** Tiny DOM helper: h('div', { class: 'x', onclick() {} }, ...children) */
function h(tag, attrs = {}, ...children) {
	const el = document.createElement(tag);
	Object.entries(attrs).forEach(([key, value]) => {
		if (value === undefined || value === null || value === false) return;
		if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
		else if (key === 'class') el.className = value;
		else if (DOM_PROPERTIES.has(key)) el[key] = value;
		else el.setAttribute(key, value === true ? '' : value);
	});
	children.flat().forEach(child => {
		if (child === null || child === undefined || child === false) return;
		el.append(child instanceof Node ? child : document.createTextNode(String(child)));
	});
	return el;
}

const toHexColor = value => {
	const v = String(value || '').trim();
	if (/^#[0-9a-f]{6}$/i.test(v)) return v;
	if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(c => c + c).join('');
	return '#000000';
};

export default class EditorPanel {
	constructor(containerId, { drop, styles, project }) {
		this.container = document.getElementById(containerId);
		this.drop = drop;
		this.styles = styles;
		this.project = project;
		this.device = 'desktop';
		this.element = null;

		drop.onSelect(el => this.render(el));
		project.onChange(() => {
			if (!this.element && !this.container.contains(document.activeElement)) this.render(null);
		});
	}

	setDevice(device) {
		this.device = device;
		this.render(this.element);
	}

	/** Record an undo step after a field is committed. */
	_commit() {
		this.drop.commit();
	}

	render(el) {
		this.element = el && this.drop.doc.body.contains(el) ? el : null;
		this.container.replaceChildren(this.element ? this._elementView(this.element) : this._pageView());
	}

	// ------------------------------------------------------------- page view

	_pageView() {
		const page = this.project.current;
		if (!page) return h('div');
		const isHome = this.project.pages[0] === page;

		return h('div', { class: 'flex flex-col' },
			this._header('Page settings', 'Select an element on the canvas to edit it'),
			this._section('Page',
				this._field('Page name', this._input(page.name, {
					onchange: e => this.project.updatePage(page.id, { name: e.target.value }),
				})),
				this._field('File name', isHome
					? this._input('index.html', { disabled: true, title: 'The first page is always exported as index.html' })
					: this._input(page.slug, {
						onchange: e => this.project.updatePage(page.id, { slug: e.target.value }),
					})),
				this._field('Browser title', this._input(page.title, {
					onchange: e => this.project.updatePage(page.id, { title: e.target.value }),
				})),
				h('label', { class: 'flex items-start gap-2 mt-1 text-xs text-neutral-600' },
					h('input', {
						type: 'checkbox',
						class: 'mt-0.5',
						checked: !page.hideInNav,
						onchange: e => this.project.updatePage(page.id, { hideInNav: !e.target.checked }),
					}),
					h('span', {}, 'Show in menus', h('br'),
						h('span', { class: 'text-[11px] text-neutral-400' }, 'Turn off for pages like 404 or privacy that menus should not link to.')),
				),
			),
			this._section('Site CSS (all pages)',
				h('p', { class: 'mb-2 text-[11px] text-neutral-500' }, 'Custom CSS added to the generated style.css of every page.'),
				h('textarea', {
					class: `${INPUT_CLASS} font-mono h-40`,
					spellcheck: 'false',
					placeholder: '.btn-primary {\n\tbackground: #2563eb;\n}',
					value: this.styles.siteCSS,
					oninput: e => this.styles.setSiteCSS(e.target.value),
					onchange: e => this.project.setSiteCSS(e.target.value),
				}),
			),
			this._section('Tips',
				h('ul', { class: 'list-disc pl-4 text-[11px] leading-5 text-neutral-500' },
					h('li', {}, 'Click an element to select it, click again to select something inside it.'),
					h('li', {}, 'Double-click text on the canvas to edit it in place.'),
					h('li', {}, 'Switch to Tablet or Mobile to add responsive styles.'),
					h('li', {}, 'Delete removes the selection, Ctrl/⌘+Z undoes.'),
				),
			),
		);
	}

	// ---------------------------------------------------------- element view

	_elementView(el) {
		const block = el.closest('[data-buffer]');
		let label = el.localName;
		if (block === el) {
			try { label = JSON.parse(el.getAttribute('data-buffer')).label || label; } catch (err) {}
		}

		const parent = el.parentElement;
		const canSelectParent = parent && parent !== this.drop.doc.body && this.drop.doc.body.contains(parent);

		return h('div', { class: 'flex flex-col' },
			this._header(label, block === el ? `<${el.localName}> block` : `<${el.localName}> inside ${this._label(block)}`),
			h('div', { class: 'flex flex-wrap gap-2 px-3 py-3 border-b border-gray-200' },
				this._button('fas fa-arrow-up', 'Parent', () => this.drop.select(parent), !canSelectParent),
				this._button('fas fa-clone', 'Duplicate', () => this.drop.duplicateElement(el)),
				this._button('fas fa-trash', 'Delete', () => this.drop.removeElement(el)),
			),
			this._contentSection(el),
			this._styleSection(el),
		);
	}

	_label(block) {
		try { return JSON.parse(block.getAttribute('data-buffer')).label || block.localName; } catch (err) { return 'block'; }
	}

	_contentSection(el) {
		const fields = [];
		const tag = el.localName;

		if (!NO_TEXT_TAGS.has(tag) && el.children.length === 0 && !el.classList.contains('droppable')) {
			fields.push(this._field('Text', h('textarea', {
				class: `${INPUT_CLASS} h-20`,
				value: el.textContent,
				oninput: e => { el.textContent = e.target.value; },
				onchange: () => this._commit(),
			})));
		} else if (!NO_TEXT_TAGS.has(tag) && !el.classList.contains('droppable') && el.textContent.trim()) {
			fields.push(h('p', { class: 'mb-3 text-[11px] text-neutral-500' }, 'Double-click the text on the canvas to edit it.'));
		}

		// A menu that follows the page list: the element itself, or the menu a link belongs to.
		const menu = el.closest('[data-nav]') || el.closest('nav');
		if (menu && menu !== el && menu.hasAttribute('data-nav')) {
			fields.push(h('p', { class: 'mb-3 px-2 py-1.5 rounded-md bg-amber-50 text-[11px] text-amber-700' },
				'This link is generated from your pages. Turn off "Links follow your pages" below to edit it by hand.'));
		}

		(ATTRIBUTE_FIELDS[tag] || []).forEach(def => fields.push(this._attributeField(el, def)));

		if (menu) {
			fields.push(h('label', { class: 'flex items-start gap-2 mb-3 text-xs text-neutral-600' },
				h('input', {
					type: 'checkbox',
					class: 'mt-0.5',
					checked: menu.hasAttribute('data-nav'),
					onchange: e => {
						if (e.target.checked) menu.setAttribute('data-nav', '');
						else menu.removeAttribute('data-nav');
						this._commit(); // re-enabling syncs the links right away
						this.render(el);
					},
				}),
				h('span', {}, 'Links follow your pages', h('br'),
					h('span', { class: 'text-[11px] text-neutral-400' }, 'Adds, renames and removes links automatically when pages change.')),
			));
		}

		if (tag === 'select') {
			fields.push(this._field('Options (one per line)', h('textarea', {
				class: `${INPUT_CLASS} h-20`,
				value: Array.from(el.options).map(o => o.textContent).join('\n'),
				oninput: e => {
					el.replaceChildren(...e.target.value.split('\n').filter(Boolean).map(text => h('option', {}, text)));
				},
				onchange: () => this._commit(),
			})));
		}

		fields.push(h('div', { class: 'grid grid-cols-2 gap-2' },
			this._field('ID', this._input(el.id, {
				placeholder: 'auto',
				oninput: e => {
					const id = e.target.value.trim().replace(/\s+/g, '-');
					if (id) el.id = id;
					else el.removeAttribute('id');
				},
				onchange: () => this._commit(),
			})),
			this._field('Classes', this._input(Array.from(el.classList).filter(c => !EDITOR_CLASSES.includes(c)).join(' '), {
				placeholder: 'card featured',
				onchange: e => {
					const keep = Array.from(el.classList).filter(c => EDITOR_CLASSES.includes(c));
					el.className = [...keep, ...e.target.value.split(/\s+/).filter(Boolean)].join(' ');
					this._commit();
				},
			})),
		));

		return this._section('Content', ...fields);
	}

	_attributeField(el, def) {
		if (def.toggle !== undefined) {
			return h('label', { class: 'flex items-center gap-2 mb-2 text-xs text-neutral-600' },
				h('input', {
					type: 'checkbox',
					checked: el.hasAttribute(def.attr),
					onchange: e => {
						e.target.checked ? el.setAttribute(def.attr, def.toggle) : el.removeAttribute(def.attr);
						if (def.attr === 'target' && e.target.checked) el.setAttribute('rel', 'noopener');
						this._commit();
					},
				}),
				def.label,
			);
		}

		if (def.options) {
			return this._field(def.label, h('select', {
				class: INPUT_CLASS,
				onchange: e => { el.setAttribute(def.attr, e.target.value); this._commit(); },
			}, def.options.map(o => h('option', { value: o, selected: el.getAttribute(def.attr) === o }, o))));
		}

		const listId = def.pages ? 'wb-page-links' : undefined;
		const value = el.getAttribute(def.attr) || '';
		const input = this._input(value.startsWith('data:') ? '(uploaded file)' : value, {
			list: listId,
			oninput: e => el.setAttribute(def.attr, e.target.value),
			onchange: () => this._commit(),
		});

		const extras = [];
		if (def.pages) {
			extras.push(h('datalist', { id: listId },
				this.project.pages.map((page, i) => h('option', { value: i === 0 ? 'index.html' : `${page.slug}.html` }, page.name))));
		}
		if (def.upload) {
			extras.push(h('label', { class: 'mt-1 inline-flex items-center gap-1 text-[11px] text-[#0072F4] cursor-pointer' },
				'Upload file…',
				h('input', {
					type: 'file',
					accept: def.upload,
					class: 'hidden',
					onchange: e => this._upload(e.target.files[0], el, def.attr),
				}),
			));
		}
		return this._field(def.label, input, ...extras);
	}

	_upload(file, el, attr) {
		if (!file) return;
		if (file.size > MAX_UPLOAD_BYTES) {
			alert('Files larger than 1.5 MB are not stored in the project. Host the file and paste its URL instead.');
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			el.setAttribute(attr, reader.result);
			this._commit();
			this.render(el);
		};
		reader.readAsDataURL(file);
	}

	_styleSection(el) {
		const id = this.drop.ensureId(el);
		const device = this.device;
		const inherited = prop => {
			for (const fallback of DEVICE_FALLBACK[device]) {
				const value = this.styles.getValue(id, prop, fallback);
				if (value) return value;
			}
			return '';
		};

		const groups = STYLE_GROUPS.map(group => {
			const fields = group.fields.map(def => {
				const value = this.styles.getValue(id, def.prop, device);
				const placeholder = inherited(def.prop) || def.placeholder || '';
				const set = v => this.styles.set(id, def.prop, v, device);
				let control;

				if (def.type === 'select') {
					control = h('select', { class: INPUT_CLASS, onchange: e => { set(e.target.value); this._commit(); } },
						def.options.map(o => h('option', { value: o, selected: o === value }, o || (placeholder ? `(${placeholder})` : '—'))));
				} else if (def.type === 'color') {
					const text = this._input(value, { placeholder: placeholder || '#000000' });
					const swatch = h('input', {
						type: 'color',
						class: 'w-7 h-7 p-0 border border-gray-200 rounded cursor-pointer shrink-0',
						value: toHexColor(value || placeholder),
						oninput: e => { text.value = e.target.value; set(e.target.value); },
						onchange: () => this._commit(),
					});
					text.addEventListener('input', e => { set(e.target.value); swatch.value = toHexColor(e.target.value); });
					text.addEventListener('change', () => this._commit());
					control = h('div', { class: 'flex items-center gap-1' }, swatch, text);
				} else {
					control = this._input(value, {
						placeholder,
						oninput: e => set(e.target.value),
						onchange: () => this._commit(),
					});
				}

				const field = this._field(def.prop, control);
				if (def.wide) field.classList.add('col-span-2');
				return field;
			});

			return h('details', { class: 'border-b border-gray-200 group', open: group.open },
				h('summary', { class: 'px-3 py-2.5 text-xs font-semibold text-neutral-700 cursor-pointer select-none hover:bg-gray-50' }, group.title),
				h('div', { class: 'grid grid-cols-2 gap-x-2 px-3 pb-3' }, fields),
			);
		});

		const raw = h('textarea', {
			class: `${INPUT_CLASS} font-mono h-28`,
			spellcheck: 'false',
			placeholder: 'property: value;',
			value: declarationsToText(this.styles.get(id, device)),
			onchange: e => {
				this.styles.replace(id, parseDeclarations(e.target.value), device);
				this._commit();
				this.render(el);
			},
		});

		return h('div', { class: 'flex flex-col' },
			h('div', { class: 'flex items-center justify-between px-3 pt-4 pb-2' },
				h('h4', { class: 'text-xs font-semibold uppercase tracking-wide text-neutral-500' }, 'Styles'),
				h('span', {
					class: 'px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#0072F4]/10 text-[#0072F4]',
					title: device === 'desktop' ? 'Base styles' : 'Overrides for this screen size (switch device in the top bar)',
				}, `${DEVICE_LABELS[device]}${device === 'desktop' ? '' : ' override'}`),
			),
			groups,
			h('details', { class: 'border-b border-gray-200' },
				h('summary', { class: 'px-3 py-2.5 text-xs font-semibold text-neutral-700 cursor-pointer select-none hover:bg-gray-50' }, 'All declarations (CSS)'),
				h('div', { class: 'px-3 pb-3' }, raw),
			),
		);
	}

	// --------------------------------------------------------------- helpers

	_header(title, subtitle) {
		return h('div', { class: 'flex flex-col gap-1 px-3 py-4 border-b border-gray-200' },
			h('h3', { class: 'text-neutral-700 font-medium text-sm leading-5 truncate' }, title),
			h('p', { class: 'text-neutral-500 text-xs leading-4' }, subtitle),
		);
	}

	_section(title, ...children) {
		return h('div', { class: 'flex flex-col px-3 py-3 border-b border-gray-200' },
			h('h4', { class: 'mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500' }, title),
			...children,
		);
	}

	_field(label, ...controls) {
		return h('div', { class: 'mb-2 min-w-0' }, h('label', { class: LABEL_CLASS }, label), ...controls);
	}

	_input(value, attrs = {}) {
		return h('input', { type: 'text', class: INPUT_CLASS, value: value || '', ...attrs });
	}

	_button(icon, text, onClick, disabled = false) {
		return h('button', {
			class: 'btn-2 btn-default !w-auto gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed',
			disabled,
			onclick: onClick,
		}, h('i', { class: `${icon} w-3 h-3` }), text);
	}
}
