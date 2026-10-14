import { BLOCK_MIME } from './DropManager.js';
import { BASE_CSS } from './StyleManager.js';

/** Where template images live, as an absolute URL (so exports can bundle them). */
const ASSETS_URL = new URL('blocks/resources/', document.baseURI).href;

/** Width the template is rendered at before being scaled down into its card. */
const THUMBNAIL_RENDER_WIDTH = 1280;

export function resolveTemplate(template) {
	return {
		kind: 'template',
		id: template.id,
		label: template.label,
		content: template.content.replace(/\{\{assets\}\}/g, ASSETS_URL),
	};
}

/**
 * Template library: searchable, filterable cards with live thumbnails.
 * Templates are plain objects { id, label, category, description?, content },
 * see blocks/components.js.
 */
export default class ComponentsPanel {
	constructor({ listId, searchId, filtersId }, templates, dropManager) {
		this.list = document.getElementById(listId);
		this.search = document.getElementById(searchId);
		this.filters = document.getElementById(filtersId);
		this.templates = templates;
		this.dropManager = dropManager;
		this.category = 'All';
		this.cards = [];

		this.observer = 'IntersectionObserver' in window
			? new IntersectionObserver(entries => entries.forEach(entry => {
				if (entry.isIntersecting) {
					this._loadThumbnail(entry.target);
					this.observer.unobserve(entry.target);
				}
			}), { root: this.list.closest('.overflow-y-auto') })
			: null;

		this._renderFilters();
		this._renderCards();
		this.search.addEventListener('input', () => this._applyFilter());
	}

	_renderFilters() {
		const categories = ['All', ...new Set(this.templates.map(t => t.category))];
		this.filters.replaceChildren(...categories.map(category => {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = 'px-2.5 py-1 text-[11px] font-medium rounded-full border border-gray-200 bg-white text-neutral-600 hover:border-[#0072F4] [&.active]:bg-[#0072F4] [&.active]:border-[#0072F4] [&.active]:text-white';
			chip.textContent = category;
			chip.classList.toggle('active', category === this.category);
			chip.addEventListener('click', () => {
				this.category = category;
				this.filters.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === chip));
				this._applyFilter();
			});
			return chip;
		}));
	}

	_renderCards() {
		this.cards = this.templates.map(template => {
			const spec = resolveTemplate(template);

			const card = document.createElement('div');
			card.className = 'flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-white hover:border-[#0072F4] transition-colors';

			const frame = document.createElement('div');
			frame.className = 'w-full h-[150px] border border-gray-200 rounded-md overflow-hidden relative group bg-gray-50 cursor-grab';
			frame.setAttribute('draggable', 'true');
			frame.title = 'Drag to the canvas';
			frame.dataset.templateId = template.id;
			frame.innerHTML = `
				<div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
					<i class="fas fa-arrows-alt text-white text-2xl drop-shadow-md"></i>
				</div>
			`;
			frame.addEventListener('dragstart', e => {
				e.dataTransfer.effectAllowed = 'copy';
				e.dataTransfer.setData(BLOCK_MIME, JSON.stringify(spec));
			});

			const title = document.createElement('label');
			title.className = 'text-sm text-black leading-none';
			title.textContent = template.label;

			const meta = document.createElement('p');
			meta.className = 'text-xs text-neutral-500';
			meta.textContent = template.description || template.category;

			const actions = document.createElement('div');
			actions.className = 'flex gap-2 mt-1';
			const add = document.createElement('button');
			add.type = 'button';
			add.className = 'btn-2 btn-default';
			add.textContent = 'Add to page';
			add.title = 'Insert after the selected element, or at the end of the page';
			add.addEventListener('click', () => {
				if (this.dropManager.doc) this.dropManager.insertAtSelection(this.dropManager.createBlock(spec));
			});
			actions.appendChild(add);

			card.append(frame, title, meta, actions);
			this.list.appendChild(card);

			if (this.observer) this.observer.observe(frame);
			else this._loadThumbnail(frame);

			return { card, template, text: `${template.label} ${template.category} ${template.description || ''}`.toLowerCase() };
		});
	}

	/** Render the template itself, scaled down, as its thumbnail. */
	_loadThumbnail(frame) {
		const template = this.templates.find(t => t.id === frame.dataset.templateId);
		if (!template || frame.querySelector('iframe')) return;

		const iframe = document.createElement('iframe');
		iframe.setAttribute('aria-hidden', 'true');
		iframe.tabIndex = -1;
		iframe.setAttribute('sandbox', '');
		iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
			html, body { overflow: hidden; pointer-events: none; }</style></head>
			<body>${resolveTemplate(template).content}</body></html>`;

		const scale = (frame.clientWidth || 260) / THUMBNAIL_RENDER_WIDTH;
		Object.assign(iframe.style, {
			position: 'absolute',
			top: '0',
			left: '0',
			width: `${THUMBNAIL_RENDER_WIDTH}px`,
			height: `${Math.ceil(150 / scale)}px`,
			border: '0',
			transform: `scale(${scale})`,
			transformOrigin: '0 0',
			pointerEvents: 'none',
		});
		frame.appendChild(iframe);
	}

	_applyFilter() {
		const query = this.search.value.trim().toLowerCase();
		this.cards.forEach(({ card, template, text }) => {
			const matchesCategory = this.category === 'All' || template.category === this.category;
			card.classList.toggle('hidden', !(matchesCategory && (!query || text.includes(query))));
		});
	}
}
