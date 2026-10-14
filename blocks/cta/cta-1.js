export default {
	id: 'cta-1',
	label: 'Call to Action — Banner',
	description: 'Bold band with heading and two buttons',
	category: 'Call to Action',
	content: `
		<section class="g--cta-1">
			<div class="g--cta-1-inner">
				<h2>Ready to build your next website?</h2>
				<p>Start for free and publish in minutes.</p>
				<div class="g--cta-1-actions">
					<a class="g--cta-1-primary" href="#contact">Get started</a>
					<a class="g--cta-1-secondary" href="#features">Learn more</a>
				</div>
			</div>
		</section>
		<style>
			.g--cta-1 {
				padding: 72px 24px;
				background: linear-gradient(135deg, #2563eb, #7c3aed);
				color: #fff;
				text-align: center;
			}

			.g--cta-1-inner {
				max-width: 720px;
				margin: 0 auto;
			}

			.g--cta-1 h2 {
				margin: 0 0 12px;
				font-size: 36px;
				line-height: 1.2;
			}

			.g--cta-1 p {
				margin: 0 0 32px;
				opacity: .9;
			}

			.g--cta-1-actions {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
				gap: 12px;
			}

			.g--cta-1-actions a {
				padding: 14px 28px;
				border-radius: 10px;
				font-weight: 600;
				text-decoration: none;
			}

			.g--cta-1-primary {
				background: #fff;
				color: #1e3a8a;
			}

			.g--cta-1-secondary {
				border: 1px solid rgba(255, 255, 255, .6);
				color: #fff;
			}
		</style>
	`
};
