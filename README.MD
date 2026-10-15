# Drag-and-Drop Website Builder

A visual, **multi-page** website builder. Drag blocks and pre-built templates onto a live canvas, style them for desktop, tablet and mobile, and export every page as clean HTML with a **generated stylesheet**. The export doesn't depend on the builder's own CSS.

---

## 🚀 Run the application

The UI is compiled into `dist/` (which is not committed), so build it before serving:

```bash
npm install
npm start          # builds dist/ and serves the app on http://localhost:8080
```

Other scripts:

| Command         | What it does                                              |
|-----------------|-----------------------------------------------------------|
| `npm run build` | Build `dist/utilities.css`, `dist/icons.js`, `dist/main.js` |
| `npm run dev`   | Rebuild on every change and live-reload the browser        |

> Opening `index.html` without building first gives an unstyled page with 404s for `dist/*`.

## ✨ Features

- **Blocks**: layouts (Section, Container, Row, Column, Grid), content, media, form controls and CSS-only interactive blocks (Tabs, Accordion, Carousel). Drag them onto the canvas or click to add after the selection.
- **Page templates**: start a new page from Landing, About, Services, Pricing, Portfolio, Blog, Blog post, Contact, Personal/Resume or 404. You can also append one to the page you're on (Components → Pages).
- **Section templates** (Components → Sections): 35 sections. They include navbars, heroes, page headers, features, how-it-works steps, services, stats, pricing, testimonials, logo strip, team, timeline, portfolio, gallery, blog cards, article, FAQ, call to action, newsletter, contact form and info, 404, footers and column layouts. Each one has a live thumbnail, and you can search or filter by category.
- **Drag anything, anywhere**: drag any element, including ones inside a component (a card, a heading, a button), out to the page or into another component. You can also drop blocks into a component's containers.
  - Grabbing an element drags that element. To move a whole component, click it once, then drag it (or use the Structure tab).
  - The selected element has a toolbar with a drag handle, *select parent*, *duplicate* and *delete*.
  - Drop near a container's edge to place the element beside it instead of inside. Left and right edges count when items sit in a row, such as cards in a grid.
  - Elements moved out of a component become blocks of their own and show in the Structure tab. They lose the component's CSS once they're outside it.
  - List items stay in lists, and menus that follow your pages don't accept drops. Text elements never swallow drops.
- **Editor panel**: edit text, links (with a picker for your pages), images (URL or upload), form attributes, ID and classes, and styles.
- **Responsive styles**: choose Desktop, Tablet (≤ 900px) or Mobile (≤ 575px) in the top bar, then edit. Tablet and mobile edits become media-query overrides.
- **Inline editing**: double-click text on the canvas. Click once to select a block, then click again to select an element inside it.
- **Pages**: add (blank or from a template), duplicate, rename or delete pages. The first page is always `index.html`.
- **Menus that follow your pages**: navbar links are generated from your page list and stay in sync when you add, rename or delete pages. The current page is marked with `aria-current="page"`. In page settings, "Show in menus" keeps a page (such as 404) out of menus. To hand-edit a menu, turn off "Links follow your pages" for it in the Editor.
- **Undo/redo** (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z) for each page. **Delete** removes the selection and **Esc** deselects it.
- **Autosave** to your browser's localStorage. Use Import/Export (Components tab) to move a project as `.json`. You can also import an `.html` page.
- **Preview** shows the current page as it will be published, and links between your pages work in it.
- **Code** shows the exact HTML and CSS that will be exported.
- **Publish** downloads `website.zip`:

```
website.zip
├── index.html, about.html, …   one file per page, no editor attributes
├── css/style.css               base styles + template CSS + your site CSS
├── css/<page>.css              generated rules for that page's elements
└── assets/                     images used by templates
```

## 🧩 Adding templates

Create a file in `blocks/<category>/` and list it in `blocks/components.js`:

```js
export default {
	id: 'pricing-2',                 // unique; prefix CSS classes with g--pricing-2
	label: 'Pricing — Two Plans',
	category: 'Pricing',
	description: 'Shown under the thumbnail',
	content: `
		<section class="g--pricing-2"> … <div data-dropzone></div> … </section>
		<style>.g--pricing-2 { … }</style>
	`,
};
```

- `{{assets}}` expands to `blocks/resources/`. Images referenced this way are bundled into the export.
- `{{page}}` becomes the name of the page the section is added to (useful for page titles).
- `{{nav}}` becomes links to every page. Put it inside an element with `data-nav` so the menu stays in sync:
  `<nav class="g--my-navbar-links" data-nav>{{nav}}</nav>`.
- Elements with `data-dropzone` accept other blocks.
- Thumbnails are rendered automatically from the template itself.

## 📄 Adding page templates

Page templates live in `blocks/pages.js`. Each is a list of section ids:

```js
{
	id: 'about',
	label: 'About',
	description: 'Story, timeline, team and numbers',
	name: 'About',                    // suggested page name
	sections: ['navbar-2', 'page-header-1', 'features-2', 'timeline-1', 'team-1', 'cta-1', 'footer-1'],
	hideInNav: false,                 // true keeps the page out of generated menus
}
```

## Project structure

```
src/main.js                  wires the UI together
src/blocks.js                basic blocks (Blocks tab)
src/tools/DropManager.js     canvas: drag & drop, selection, inline editing
src/tools/StyleManager.js    per-element, per-device style store → CSS
src/tools/ProjectManager.js  pages, undo/redo history, autosave
src/tools/Exporter.js        HTML + generated CSS + ZIP export
src/tools/EditorPanel.js     Editor tab
src/tools/StructureViewer.js Structure tab
src/tools/ComponentsPanel.js Components tab (section and page templates)
src/tools/Templates.js       template placeholders, menu syncing, thumbnails
blocks/components.js         section template registry
blocks/pages.js              page templates
```

## Project status: in progress

Expect changes as the project evolves.
