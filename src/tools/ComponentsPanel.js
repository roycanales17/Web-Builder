import { BLOCK_MIME } from './DropManager.js';
import { resolveTemplate, projectContext, renderThumbnail, lazyThumbnails, pageSections, SAMPLE_CONTEXT } from './Templates.js';

const CARD_CLASS = 'flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-white hover:border-[#0072F4] transition-colors';
const FRAME_CLASS = 'w-full border border-gray-200 rounded-md overflow-hidden relative group bg-gray-50';

function button(text, title, onClick) {
	const el = document.createElement('button');
	el.type = 'button';
	el.className = 'btn-2 btn-default';
	el.textContent = text;
	el.title = title;
	el.addEventListener('click', onClick);
	return el;
}

function cardText(card, label, description) {
	const title = document.createElement('label');
	title.className = 'text-sm text-black leading-none';
	title.textContent = label;

	const meta = document.createElement('p');
	meta.className = 'text-xs text-neutral-500';
	meta.textContent = description;

	card.append(title, meta);
}

/**
 * Template library with two views:
 *  - Sections: searchable, filterable section templates (drag or add to the page)
 *  - Pages:    whole-page templates (create a new page from one, or append it)
 */
export default class ComponentsPanel {
	constructor(ids, { templates, pageTemplates, drop, project, onNewPage }) {
		this.list = document.getElementById(ids.listId);
		this.pageList = document.getElementById(ids.pageListId);
		this.search = document.getElementById(ids.searchId);
		this.filters = document.getElementById(ids.filtersId);
		this.modes = document.getElementById(ids.modesId);

		this.templates = templates;
		this.pageTemplates = pageTemplates;
		this.drop = drop;
		this.project = project;
		this.onNewPage = onNewPage;
		this.category = 'All';
		this.mode = 'sections';
		this.cards = [];
		this.pageCards = [];

		this.thumbnails = lazyThumbnails(this.list.closest('.overflow-y-auto'), frame => frame.__renderThumbnail());

		this._renderModes();
		this._renderFilters();
		this._renderSectionCards();
		this._renderPageCards();
		this._applyFilter();
		this.search.addEventListener('input', () => this._applyFilter());
	}

	/** Resolve a section template against the project as it is right now. */
	_spec(template) {
		return resolveTemplate(template, projectContext(this.project));
	}

	_renderModes() {
		this.modes.querySelectorAll('[data-mode]').forEach(btn => {
			btn.addEventListener('click', () => {
				this.mode = btn.dataset.mode;
				this.modes.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b === btn));
				this.search.placeholder = this.mode === 'pages' ? 'Search page templates…' : 'Search sections…';
				this._applyFilter();
			});
		});
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

	_renderSectionCards() {
		this.cards = this.templates.map(template => {
			const card = document.createElement('div');
			card.className = CARD_CLASS;

			const frame = document.createElement('div');
			frame.className = `${FRAME_CLASS} h-[150px] cursor-grab`;
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
				e.dataTransfer.setData(BLOCK_MIME, JSON.stringify(this._spec(template)));
			});
			frame.__renderThumbnail = () => renderThumbnail(frame, resolveTemplate(template, SAMPLE_CONTEXT).content);

			card.appendChild(frame);
			cardText(card, template.label, template.description || template.category);

			const actions = document.createElement('div');
			actions.className = 'flex gap-2 mt-1';
			actions.appendChild(button('Add to page', 'Insert after the selected element, or at the end of the page', () => {
				if (this.drop.doc) this.drop.insertAtSelection(this.drop.createBlock(this._spec(template)));
			}));
			card.appendChild(actions);

			this.list.appendChild(card);
			this.thumbnails.observe(frame);

			return { card, template, text: `${template.label} ${template.category} ${template.description || ''}`.toLowerCase() };
		});
	}

	_renderPageCards() {
		this.pageCards = this.pageTemplates.map(pageTemplate => {
			const sections = pageSections(pageTemplate, this.templates);

			const card = document.createElement('div');
			card.className = CARD_CLASS;

			const frame = document.createElement('div');
			frame.className = `${FRAME_CLASS} h-[190px]`;
			const context = { ...SAMPLE_CONTEXT, pageName: pageTemplate.name };
			frame.__renderThumbnail = () => renderThumbnail(
				frame,
				sections.map(t => resolveTemplate(t, context).content).join('\n'),
				190
			);
			if (sections.length) card.appendChild(frame);

			cardText(card, pageTemplate.label, pageTemplate.description || '');

			if (sections.length) {
				const meta = document.createElement('p');
				meta.className = 'text-[11px] text-neutral-400';
				meta.textContent = `${sections.length} sections`;
				card.appendChild(meta);
			}

			const actions = document.createElement('div');
			actions.className = 'flex gap-2 mt-1';
			actions.appendChild(button('New page', 'Create a new page from this template', () => this.onNewPage(pageTemplate)));
			if (sections.length) {
				actions.appendChild(button('Add to this page', 'Append these sections to the current page', () => {
					this.appendPageTemplate(pageTemplate);
				}));
			}
			card.appendChild(actions);

			this.pageList.appendChild(card);
			if (sections.length) this.thumbnails.observe(frame);

			return { card, text: `${pageTemplate.label} ${pageTemplate.description || ''}`.toLowerCase() };
		});
	}

	/** Append every section of a page template to the current page (one undo step). */
	appendPageTemplate(pageTemplate) {
		const context = projectContext(this.project);
		const blocks = pageSections(pageTemplate, this.templates)
			.map(template => this.drop.createBlock(resolveTemplate(template, context)));
		this.drop.appendBlocks(blocks);
	}

	_applyFilter() {
		const query = this.search.value.trim().toLowerCase();
		const pages = this.mode === 'pages';

		this.list.classList.toggle('hidden', pages);
		this.filters.classList.toggle('hidden', pages);
		this.pageList.classList.toggle('hidden', !pages);

		this.cards.forEach(({ card, template, text }) => {
			const matchesCategory = this.category === 'All' || template.category === this.category;
			card.classList.toggle('hidden', !(matchesCategory && (!query || text.includes(query))));
		});
		this.pageCards.forEach(({ card, text }) => {
			card.classList.toggle('hidden', Boolean(query) && !text.includes(query));
		});
	}
}
