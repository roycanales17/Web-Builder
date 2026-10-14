/**
 * Basic building blocks shown in the "Blocks" tab.
 *
 * { label, icon, type, content, container?, styles? }
 *  - content:   HTML for the new element
 *  - container: other blocks can be dropped inside it
 *  - styles:    default generated styles per device ({ desktop, tablet, mobile })
 *  - {{uid}} in content is replaced with a unique id on every insert
 */

const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23e2e8f0'/><circle cx='250' cy='160' r='24' fill='%2394a3b8'/><path d='M200 290l80-90 50 55 40-40 80 75z' fill='%2394a3b8'/></svg>";

const UI_TABS_CSS = `<style>
	.ui-tabs { display: flex; flex-wrap: wrap; }
	.ui-tabs > input { position: absolute; opacity: 0; pointer-events: none; }
	.ui-tabs > label { padding: 10px 18px; cursor: pointer; border-bottom: 2px solid transparent; color: #64748b; font-weight: 600; }
	.ui-tabs > input:checked + label { border-color: #2563eb; color: #2563eb; }
	.ui-tabs > .ui-tab-panel { display: none; order: 1; width: 100%; padding: 16px 0; border-top: 1px solid #e2e8f0; }
	.ui-tabs > input:nth-of-type(1):checked ~ .ui-tab-panel:nth-of-type(1),
	.ui-tabs > input:nth-of-type(2):checked ~ .ui-tab-panel:nth-of-type(2),
	.ui-tabs > input:nth-of-type(3):checked ~ .ui-tab-panel:nth-of-type(3) { display: block; }
</style>`;

const UI_ACCORDION_CSS = `<style>
	.ui-accordion > details { border-bottom: 1px solid #e2e8f0; }
	.ui-accordion > details > summary { padding: 14px 0; cursor: pointer; font-weight: 600; }
	.ui-accordion .ui-accordion-body { padding-bottom: 14px; }
</style>`;

const UI_CAROUSEL_CSS = `<style>
	.ui-carousel { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; }
	.ui-carousel > .ui-slide { flex: 0 0 100%; scroll-snap-align: start; min-height: 240px; border-radius: 12px; background: #f1f5f9; }
</style>`;

export default function registerBasicBlocks(blockManager) {
	blockManager.createPanel('layouts', 'Layouts', (block) => {
		block.register({
			label: 'Section', icon: 'fas fa-object-group', type: 'section', container: true,
			content: '<section></section>',
			styles: { desktop: { padding: '64px 24px' }, mobile: { padding: '40px 16px' } },
		});
		block.register({
			label: 'Container', icon: 'fas fa-square-full', type: 'div', container: true,
			content: '<div></div>',
			styles: { desktop: { 'max-width': '1140px', margin: '0 auto', padding: '16px' } },
		});
		block.register({
			label: 'Row', icon: 'fas fa-columns', type: 'div', container: true,
			content: '<div></div>',
			styles: { desktop: { display: 'flex', 'flex-wrap': 'wrap', gap: '16px' }, mobile: { 'flex-direction': 'column' } },
		});
		block.register({
			label: 'Column', icon: 'fas fa-grip-lines-vertical', type: 'div', container: true,
			content: '<div></div>',
			styles: { desktop: { flex: '1 1 0', 'min-width': '0' } },
		});
		block.register({
			label: 'Grid', icon: 'fas fa-th', type: 'div', container: true,
			content: '<div></div>',
			styles: {
				desktop: { display: 'grid', 'grid-template-columns': 'repeat(3, minmax(0, 1fr))', gap: '16px' },
				tablet: { 'grid-template-columns': 'repeat(2, minmax(0, 1fr))' },
				mobile: { 'grid-template-columns': '1fr' },
			},
		});
	});

	blockManager.createPanel('content', 'Content', (block) => {
		block.register({ label: 'Heading', icon: 'fas fa-heading', type: 'h1', content: '<h1>Your heading here</h1>' });
		block.register({ label: 'Subheading', icon: 'fas fa-heading', type: 'h2', content: '<h2>A smaller heading</h2>' });
		block.register({
			label: 'Paragraph', icon: 'fas fa-align-left', type: 'p',
			content: '<p>Write something great here. Double-click this text on the canvas to edit it, or use the Editor panel.</p>',
		});
		block.register({
			label: 'Quote', icon: 'fas fa-quote-left', type: 'blockquote',
			content: '<blockquote>“Simplicity is the ultimate sophistication.”</blockquote>',
			styles: { desktop: { margin: '0', padding: '8px 0 8px 20px', 'border-left': '4px solid #cbd5e1', color: '#475569', 'font-style': 'italic' } },
		});
		block.register({
			label: 'Code', icon: 'fas fa-code', type: 'pre',
			content: "<pre><code>console.log('Hello world');</code></pre>",
			styles: { desktop: { padding: '16px', 'border-radius': '8px', background: '#0f172a', color: '#e2e8f0', overflow: 'auto' } },
		});
		block.register({
			label: 'List', icon: 'fas fa-list-ul', type: 'ul',
			content: '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>',
		});
	});

	blockManager.createPanel('components', 'Components', (block) => {
		block.register({
			label: 'Image', icon: 'fas fa-image', type: 'img',
			content: `<img src="${IMAGE_PLACEHOLDER}" alt="Image description">`,
			styles: { desktop: { display: 'block', 'max-width': '100%', height: 'auto' } },
		});
		block.register({
			label: 'Button', icon: 'fas fa-mouse-pointer', type: 'a',
			content: '<a href="#">Click me</a>',
			styles: {
				desktop: {
					display: 'inline-block', padding: '12px 24px', 'border-radius': '8px', background: '#2563eb',
					color: '#ffffff', 'font-weight': '600', 'text-decoration': 'none',
				},
			},
		});
		block.register({ label: 'Link', icon: 'fas fa-link', type: 'a', content: '<a href="#">A text link</a>' });
		block.register({
			label: 'Icon', icon: 'fas fa-star', type: 'span',
			content: '<span>★</span>',
			styles: { desktop: { display: 'inline-block', 'font-size': '32px', color: '#f59e0b', 'line-height': '1' } },
		});
		block.register({
			label: 'Divider', icon: 'fas fa-minus', type: 'hr',
			content: '<hr>',
			styles: { desktop: { border: '0', 'border-top': '1px solid #e2e8f0', margin: '24px 0' } },
		});
		block.register({
			label: 'Spacer', icon: 'fas fa-arrows-up-down', type: 'div',
			content: '<div aria-hidden="true"></div>',
			styles: { desktop: { height: '48px' } },
		});
	});

	blockManager.createPanel('controls', 'Form Controls', (block) => {
		const field = { padding: '10px 12px', border: '1px solid #cbd5e1', 'border-radius': '6px', font: 'inherit' };
		block.register({
			label: 'Form', icon: 'fas fa-rectangle-list', type: 'form', container: true,
			content: '<form action="#" method="post"></form>',
			styles: { desktop: { display: 'flex', 'flex-direction': 'column', gap: '12px', 'max-width': '480px' } },
		});
		block.register({
			label: 'Input', icon: 'fas fa-i-cursor', type: 'input',
			content: '<input type="text" name="field" placeholder="Type here...">',
			styles: { desktop: field },
		});
		block.register({
			label: 'Textarea', icon: 'fas fa-align-left', type: 'textarea',
			content: '<textarea name="message" rows="4" placeholder="Write here..."></textarea>',
			styles: { desktop: field },
		});
		block.register({
			label: 'Select', icon: 'fas fa-caret-down', type: 'select',
			content: '<select name="choice"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select>',
			styles: { desktop: field },
		});
		block.register({
			label: 'Checkbox', icon: 'fas fa-check-square', type: 'label',
			content: '<label><input type="checkbox" name="agree"> <span>I agree to the terms</span></label>',
			styles: { desktop: { display: 'inline-flex', 'align-items': 'center', gap: '8px' } },
		});
		block.register({
			label: 'Submit', icon: 'fas fa-paper-plane', type: 'button',
			content: '<button type="submit">Send</button>',
			styles: {
				desktop: {
					padding: '12px 24px', border: '0', 'border-radius': '6px', background: '#2563eb',
					color: '#ffffff', font: 'inherit', 'font-weight': '600', cursor: 'pointer',
				},
			},
		});
	});

	blockManager.createPanel('media', 'Media', (block) => {
		block.register({
			label: 'Video', icon: 'fas fa-video', type: 'video',
			content: '<video controls></video>',
			styles: { desktop: { display: 'block', width: '100%', 'aspect-ratio': '16 / 9', background: '#000000' } },
		});
		block.register({ label: 'Audio', icon: 'fas fa-music', type: 'audio', content: '<audio controls></audio>' });
		block.register({
			label: 'Embed', icon: 'fas fa-code', type: 'iframe',
			content: '<iframe title="Embedded content" src="about:blank" loading="lazy"></iframe>',
			styles: { desktop: { display: 'block', width: '100%', 'aspect-ratio': '16 / 9', border: '1px solid #e2e8f0' } },
		});
	});

	blockManager.createPanel('interactive', 'Interactive', (block) => {
		block.register({
			label: 'Tabs', icon: 'fas fa-folder', type: 'div',
			content: `<div class="ui-tabs">
				<input type="radio" name="tabs-{{uid}}" id="tab-{{uid}}-1" checked><label for="tab-{{uid}}-1">Tab one</label>
				<input type="radio" name="tabs-{{uid}}" id="tab-{{uid}}-2"><label for="tab-{{uid}}-2">Tab two</label>
				<input type="radio" name="tabs-{{uid}}" id="tab-{{uid}}-3"><label for="tab-{{uid}}-3">Tab three</label>
				<div class="ui-tab-panel" data-dropzone></div>
				<div class="ui-tab-panel" data-dropzone></div>
				<div class="ui-tab-panel" data-dropzone></div>
			</div>${UI_TABS_CSS}`,
		});
		block.register({
			label: 'Accordion', icon: 'fas fa-bars', type: 'div',
			content: `<div class="ui-accordion">
				<details open><summary>First question</summary><div class="ui-accordion-body" data-dropzone></div></details>
				<details><summary>Second question</summary><div class="ui-accordion-body" data-dropzone></div></details>
				<details><summary>Third question</summary><div class="ui-accordion-body" data-dropzone></div></details>
			</div>${UI_ACCORDION_CSS}`,
		});
		block.register({
			label: 'Carousel', icon: 'fas fa-images', type: 'div',
			content: `<div class="ui-carousel">
				<div class="ui-slide" data-dropzone></div>
				<div class="ui-slide" data-dropzone></div>
				<div class="ui-slide" data-dropzone></div>
			</div>${UI_CAROUSEL_CSS}`,
		});
	});
}
