export default {
	id: 'steps-1',
	label: 'How It Works — Steps',
	description: 'Three numbered steps',
	category: 'Features',
	content: `
		<section class="g--steps-1">
			<h2>How it works</h2>
			<p class="g--steps-1-lead">From idea to a live website in three steps.</p>
			<ol class="g--steps-1-list">
				<li>
					<span class="g--steps-1-number">1</span>
					<h3>Pick a template</h3>
					<p>Start with a full page or mix and match sections.</p>
				</li>
				<li>
					<span class="g--steps-1-number">2</span>
					<h3>Make it yours</h3>
					<p>Edit text, swap images and tune styles for every screen size.</p>
				</li>
				<li>
					<span class="g--steps-1-number">3</span>
					<h3>Publish</h3>
					<p>Download clean HTML and CSS and host it anywhere.</p>
				</li>
			</ol>
		</section>
		<style>
			.g--steps-1 {
				padding: 80px 24px;
				text-align: center;
			}

			.g--steps-1 h2 {
				margin: 0 0 8px;
				font-size: 34px;
				color: #0f172a;
			}

			.g--steps-1-lead {
				margin: 0 0 48px;
				color: #64748b;
			}

			.g--steps-1-list {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 32px;
				max-width: 1000px;
				margin: 0 auto;
				padding: 0;
				list-style: none;
			}

			.g--steps-1-number {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				width: 48px;
				height: 48px;
				margin-bottom: 16px;
				border-radius: 50%;
				background: #2563eb;
				color: #fff;
				font-size: 20px;
				font-weight: 700;
			}

			.g--steps-1-list h3 {
				margin: 0 0 8px;
				font-size: 19px;
				color: #0f172a;
			}

			.g--steps-1-list p {
				margin: 0;
				color: #64748b;
			}

			@media (max-width: 767px) {
				.g--steps-1-list {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
