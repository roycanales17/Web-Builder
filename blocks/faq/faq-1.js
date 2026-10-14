export default {
	id: 'faq-1',
	label: 'FAQ — Accordion',
	description: 'Expandable questions (no JavaScript needed)',
	category: 'Content',
	content: `
		<section class="g--faq-1" id="faq">
			<h2>Frequently asked questions</h2>
			<details open>
				<summary>Can I export my website?</summary>
				<p>Yes. Every page is exported as clean HTML with a generated stylesheet and its images.</p>
			</details>
			<details>
				<summary>Do I need to know how to code?</summary>
				<p>No. Drag blocks onto the page, then adjust text and styles in the editor panel.</p>
			</details>
			<details>
				<summary>Can I use my own domain?</summary>
				<p>Upload the exported files to any static host and point your domain at it.</p>
			</details>
		</section>
		<style>
			.g--faq-1 {
				max-width: 760px;
				margin: 0 auto;
				padding: 80px 24px;
			}

			.g--faq-1 h2 {
				margin: 0 0 32px;
				font-size: 34px;
				text-align: center;
				color: #0f172a;
			}

			.g--faq-1 details {
				border-bottom: 1px solid #e2e8f0;
				padding: 18px 0;
			}

			.g--faq-1 summary {
				cursor: pointer;
				font-weight: 600;
				font-size: 17px;
				color: #0f172a;
			}

			.g--faq-1 details p {
				margin: 12px 0 0;
				color: #475569;
			}
		</style>
	`
};
