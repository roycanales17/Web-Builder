export default {
	id: 'features-1',
	label: 'Features — Cards',
	description: 'Section title with three feature cards',
	category: 'Features',
	content: `
		<section class="g--features-1" id="features">
			<div class="g--features-1-header">
				<p class="g--features-1-eyebrow">Why choose us</p>
				<h2>Everything you need to launch faster</h2>
				<p>Simple tools that work together, so you can focus on what matters.</p>
			</div>
			<div class="g--features-1-grid">
				<div class="g--features-1-card">
					<div class="g--features-1-icon">⚡</div>
					<h3>Lightning fast</h3>
					<p>Pages load in a blink thanks to clean, lightweight markup.</p>
				</div>
				<div class="g--features-1-card">
					<div class="g--features-1-icon">🎨</div>
					<h3>Fully customizable</h3>
					<p>Tweak colors, spacing and typography for every screen size.</p>
				</div>
				<div class="g--features-1-card">
					<div class="g--features-1-icon">🔒</div>
					<h3>Secure by default</h3>
					<p>Static pages with no server to hack and nothing to patch.</p>
				</div>
			</div>
		</section>
		<style>
			.g--features-1 {
				padding: 80px 24px;
				background: #f8fafc;
			}

			.g--features-1-header {
				max-width: 640px;
				margin: 0 auto 48px;
				text-align: center;
			}

			.g--features-1-eyebrow {
				margin: 0 0 8px;
				color: #2563eb;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 1px;
				font-size: 13px;
			}

			.g--features-1-header h2 {
				margin: 0 0 12px;
				font-size: 36px;
				line-height: 1.2;
				color: #0f172a;
			}

			.g--features-1-header p {
				margin: 0;
				color: #64748b;
			}

			.g--features-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 24px;
				max-width: 1100px;
				margin: 0 auto;
			}

			.g--features-1-card {
				padding: 32px;
				border-radius: 16px;
				background: #fff;
				box-shadow: 0 1px 3px rgba(15, 23, 42, .08);
			}

			.g--features-1-icon {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 48px;
				height: 48px;
				margin-bottom: 16px;
				border-radius: 12px;
				background: #eff6ff;
				font-size: 24px;
			}

			.g--features-1-card h3 {
				margin: 0 0 8px;
				font-size: 18px;
				color: #0f172a;
			}

			.g--features-1-card p {
				margin: 0;
				color: #64748b;
			}

			@media (max-width: 900px) {
				.g--features-1-grid {
					grid-template-columns: 1fr;
				}

				.g--features-1-header h2 {
					font-size: 28px;
				}
			}
		</style>
	`
};
