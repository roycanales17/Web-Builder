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
- **Templates** (Components tab): navbars, heroes, features, pricing, testimonials, team, gallery, FAQ, call to action, contact form, footers and column layouts. Each one has a live thumbnail, and you can search or filter by category.
- **Nesting**: containers and template columns accept blocks. Text elements never swallow drops.
- **Editor panel**: edit text, links (with a picker for your pages), images (URL or upload), form attributes, ID and classes, and styles.
- **Responsive styles**: choose Desktop, Tablet (≤ 900px) or Mobile (≤ 575px) in the top bar, then edit. Tablet and mobile edits become media-query overrides.
- **Inline editing**: double-click text on the canvas. Click once to select a block, then click again to select an element inside it.
- **Pages**: add, duplicate, rename or delete pages. The first page is always `index.html`.
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
- Elements with `data-dropzone` accept other blocks.
- Thumbnails are rendered automatically from the template itself.

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
src/tools/ComponentsPanel.js Components tab (template library)
blocks/                      section templates and their images
```

## Project status: in progress

Expect changes as the project evolves.
