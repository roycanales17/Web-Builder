import {renderStyle} from './editors/style.js';

export default class ElementPropertiesEditor
{
	static tab = ['styles', 'attributes', 'interactions'];

	constructor(element, root) {
		this.element = element;
		this.root = document.getElementById(root);
		this.editors = ElementPropertiesEditor.tab;
		this.buffer = JSON.parse(this.element.getAttribute('data-buffer'));

		this.build();
		this.toggleEditorTypeContent('styles');
		this.eventSettingHandler();
	}

	setting() {
		return {
			'styles': {
				html: () => {
					const selectors = this.getSelectors().map(
						selector => `<div class="editor-selector">${selector}</div>`
					).join('');

					return `
						<div class="editor-selectors">
							<div class="editor-selector">Inline Style</div>
							${selectors}
						</div>
						<div class="style-manager editors display-none"> 
							<div class="editor-head">
								<label></label>
								<button>
									Go Back
								</button>
							</div>
							<hr />
							<div class="editor-fields-content">
								
							</div>
						</div>
					`;
				},
				events: () =>
				{
					const selectors = this.root.querySelector('.editor-selectors');
					const manager = this.root.querySelector('.style-manager');
					const header = this.root.querySelector('.style-manager .editor-head');
					const goBack = header.querySelector('button');

					const toggle = (show) => {
						if (show) {
							selectors.classList.add('display-none');
							manager.classList.remove('display-none');
						} else {
							// Reset Content
							manager.querySelector('.editor-fields-content').innerHTML = '';

							selectors.classList.remove('display-none');
							manager.classList.add('display-none');
						}
					};

					const render = (identifier, callback) => {
						manager.querySelector('.editor-fields-content').innerHTML += `<div data-editor-field="${identifier}"></div>`;
						if (typeof callback === 'function') {
							callback(manager.querySelector('.editor-fields-content').querySelector(`[data-editor-field="${identifier}"]`));
						}
					};

					// Go Back
					goBack.addEventListener('click', e => toggle(false));

					// Open CSS Editor
					selectors.querySelectorAll('.editor-selector').forEach(selector => {
						selector.addEventListener('click', (e) => {
							e.preventDefault();
							header.querySelector('label').innerHTML = `${this.buffer.label} <span>&lt;${this.buffer.type}&gt;</span>`;

							toggle(true);
							renderStyle(this.element, render, toggle);
						});
					});
				}
			},
			'attributes': {
				html: () => {
					return '<div>Attributes Content</div>';
				},
				events: () => {
					console.log('Attributes event initialized');
				}
			},
			'interactions': {
				html: () => {
					return '<div>Interactions Content</div>';
				},
				events: () => {
					console.log('Interactions event initialized');
				}
			}
		};
	}

	load(renderType, isEvent = false) {
		const renders = this.setting(renderType);
		const section = renders[renderType];

		if (!section) return;

		if (isEvent) {
			section.events?.();
		} else {
			const html = section.html?.();
			const container = this.root.querySelector(`[data-editor-content="${renderType}"]`);
			if (container) container.innerHTML = html;
		}
	}

	build() {

		// Generate buttons
		const buttons = this.editors.map(
			tab => `<button data-editor-tab="${tab}">${this.capitalize(tab)}</button>`
		).join('');

		// Generate tab content divs
		const contents = this.editors.map(
			tab => `<div data-editor-content="${tab}"></div>`
		).join('');

		// Final HTML
		this.root.innerHTML = `
			<div class="editor-content">
				<div class="editor-type">
					${buttons}
				</div>
				<div id="editor-type-content">
					${contents}
				</div>
			</div>
		`;
	}

	toggleEditorTypeContent(target) {
		for (let i = 0; i < this.editors.length; i++) {
			const type = this.editors[i];
			const elem = this.root.querySelector(`div[data-editor-content="${type}"]`);
			const btn = this.root.querySelector(`button[data-editor-tab="${type}"]`);

			if (target === type) {
				btn.classList.add('active')
				elem.classList.remove('display-none');
			} else {
				btn.classList.remove('active')
				elem.classList.add('display-none');
			}
		}

		this.load(target);
		this.load(target, true);
	}

	eventSettingHandler() {

		// Main tab
		for (let i = 0; i < this.editors.length; i++) {
			const type = this.editors[i];
			const btn = this.root.querySelector(`button[data-editor-tab="${type}"]`);

			btn.addEventListener('click', e => {
				e.preventDefault();
				const editor = e.target.getAttribute('data-editor-tab');
				this.toggleEditorTypeContent(editor);
			});
		}
	}

	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	getSelectors() {
		const selectors = [];
		if (this.element.id) {
			selectors.push(`#${this.element.id}`);
		}

		this.element.classList.forEach(cls => {
			selectors.push(`.${cls}`);
		});

		return selectors;
	}

}