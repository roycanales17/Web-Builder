import { templateComponents } from '../blocks/components.js';

document.addEventListener('DOMContentLoaded', function () {
	const editor = grapesjs.init({
		container: '#gjs',
		height: '100%',
		width: 'auto',
		fromElement: false,
		forceClass: false,
		storageManager: false,
		telemetry: false,
		canvas: {
			styles: [
				'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto&family=Open+Sans&display=swap'
			]
		},
		plugins: [
			'grapesjs-preset-webpage',
			'grapesjs-plugin-forms',
			'grapesjs-component-countdown',
			'grapesjs-plugin-export',
			'grapesjs-custom-code',
			'grapesjs-touch',
			'grapesjs-parser-postcss',
			'grapesjs-tooltip',
			'grapesjs-tui-image-editor',
			'grapesjs-style-bg',
			'grapesjs-code-editor'
		],
		pluginsOpts: {
			'grapesjs-preset-webpage': {}
		}
	});

	// Collapse block categories like Basic, Forms, etc. on load
	editor.on('load', () => {
		const categories = editor.BlockManager.getCategories();
		categories.each(cat => cat.set('open', false));
	});

	// Manually add basic blocks (like gjs-blocks-basic)
	const bm = editor.BlockManager;
	bm.add('basic-div', {
		label: 'Div',
		category: 'Basic',
		content: '<div>Insert text here</div>',
		media: '<i class="fa fa-square fa-lg"></i>'
	});

	bm.add('basic-span', {
		label: 'Span',
		category: 'Basic',
		content: '<span>Editable text</span>',
		media: '<i class="fa fa-i-cursor fa-lg"></i>'
	});

	bm.add('basic-textarea', {
		label: 'Textarea',
		category: 'Basic',
		content: '<textarea>Enter text</textarea>',
		media: '<i class="fa fa-align-left fa-lg"></i>'
	});

	bm.add('basic-header', {
		label: 'Header',
		category: 'Basic',
		content: '<header><h1>Page Header</h1></header>',
		media: '<i class="fa fa-heading fa-lg"></i>'
	});

	bm.add('basic-footer', {
		label: 'Footer',
		category: 'Basic',
		content: '<footer><p>Page Footer</p></footer>',
		media: '<i class="fa fa-shoe-prints fa-lg"></i>'
	});

	bm.add('basic-section', {
		label: 'Section',
		category: 'Basic',
		content: '<section><p>Section content</p></section>',
		media: '<i class="fa fa-border-top fa-lg"></i>'
	});

	bm.add('basic-article', {
		label: 'Article',
		category: 'Basic',
		content: '<article><h2>Article Title</h2><p>Article body...</p></article>',
		media: '<i class="fa fa-file-alt fa-lg"></i>'
	});

	// Template component preview logic
	let selectedComponent = null;

	function renderComponentList(type) {
		const comps = templateComponents[type] || [];
		const container = $('#component-list');
		container.empty();
		selectedComponent = null;

		comps.forEach(comp => {
			const el = $(`
				<div class="component-item" style="border:1px solid #ccc;border-radius:6px;padding:8px;cursor:pointer;text-align:center;">
					<img src="${comp.thumbnail}" alt="${comp.label}" style="width:100%;border-radius:4px;margin-bottom:6px;">
					<div style="font-size:13px;">${comp.label}</div>
				</div>
			`);

			el.on('click', function () {
				$('.component-item').css('border', '1px solid #ccc');
				$(this).css('border', '2px solid #1e90ff');
				selectedComponent = comp;
			});

			container.append(el);
		});
	}

	// Add "Select More Templates" button to panel
	editor.Panels.addButton('views', {
		id: 'select-more-templates',
		className: 'fa fa-upload',
		command(editor) {
			const selected = $('#template-select').val();
			renderComponentList(selected);
			$('#template-modal').show();

			$('#import-template').off('click').one('click', function () {
				if (!selectedComponent) {
					alert('Please select a component');
					return;
				}

				if (!bm.get(selectedComponent.id)) {
					bm.add(selectedComponent.id, {
						id: selectedComponent.id,
						label: selectedComponent.label,
						category: selectedComponent.category || 'Imported Templates',
						content: selectedComponent.content
					});
				}

				// Ensure blocks panel is active only
				editor.Panels.getButton('views', 'open-style')?.set('active', false);
				editor.Panels.getButton('views', 'open-layers')?.set('active', false);
				editor.Panels.getButton('views', 'open-blocks')?.set('active', true);
				editor.runCommand('open-blocks');

				$('#template-modal').hide();
			});
		},
		attributes: { title: 'Select More Templates' }
	});

	$('#close-modal').on('click', function () {
		$('#template-modal').hide();
	});

	$('#template-select').on('change', function () {
		renderComponentList(this.value);
	});
});