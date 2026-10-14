export default {
	id: 'banner-6',
	label: 'Hero — Centered Product',
	description: 'Centered headline, two buttons and a product mockup',
	category: 'Hero',
	content: `
		<section class="g--banner-hero-6">
			<p class="g--banner-hero-6-badge">New · Version 2.0 is here</p>
			<h1>Build beautiful websites<br>without writing code</h1>
			<p class="g--banner-hero-6-lead">Drag, drop and publish. Every page exports as clean HTML and CSS you fully own.</p>
			<div class="g--banner-hero-6-actions">
				<a class="g--banner-hero-6-primary" href="#pricing">Start for free</a>
				<a class="g--banner-hero-6-secondary" href="#features">See how it works</a>
			</div>
			<div class="g--banner-hero-6-mockup" aria-hidden="true">
				<div class="g--banner-hero-6-bar"><span></span><span></span><span></span></div>
				<div class="g--banner-hero-6-screen">
					<div class="g--banner-hero-6-side"></div>
					<div class="g--banner-hero-6-main">
						<div></div><div></div><div></div>
					</div>
				</div>
			</div>
		</section>
		<style>
			.g--banner-hero-6 {
				padding: 96px 24px 0;
				background: radial-gradient(ellipse at top, #dbeafe 0%, #ffffff 60%);
				text-align: center;
				overflow: hidden;
			}

			.g--banner-hero-6-badge {
				display: inline-block;
				margin: 0 0 24px;
				padding: 6px 14px;
				border-radius: 999px;
				background: #fff;
				border: 1px solid #bfdbfe;
				color: #2563eb;
				font-size: 13px;
				font-weight: 600;
			}

			.g--banner-hero-6 h1 {
				margin: 0 0 20px;
				font-size: 56px;
				line-height: 1.1;
				letter-spacing: -1px;
				color: #0f172a;
			}

			.g--banner-hero-6-lead {
				max-width: 620px;
				margin: 0 auto 36px;
				font-size: 19px;
				color: #475569;
			}

			.g--banner-hero-6-actions {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
				gap: 12px;
				margin-bottom: 64px;
			}

			.g--banner-hero-6-actions a {
				padding: 14px 28px;
				border-radius: 10px;
				font-weight: 600;
				text-decoration: none;
			}

			.g--banner-hero-6-primary {
				background: #2563eb;
				color: #fff;
				box-shadow: 0 8px 20px rgba(37, 99, 235, .3);
			}

			.g--banner-hero-6-secondary {
				background: #fff;
				color: #0f172a;
				border: 1px solid #e2e8f0;
			}

			.g--banner-hero-6-mockup {
				max-width: 960px;
				margin: 0 auto;
				border-radius: 16px 16px 0 0;
				background: #fff;
				border: 1px solid #e2e8f0;
				border-bottom: 0;
				box-shadow: 0 -10px 40px rgba(15, 23, 42, .08);
				overflow: hidden;
			}

			.g--banner-hero-6-bar {
				display: flex;
				gap: 6px;
				padding: 12px 16px;
				border-bottom: 1px solid #e2e8f0;
			}

			.g--banner-hero-6-bar span {
				width: 10px;
				height: 10px;
				border-radius: 50%;
				background: #cbd5e1;
			}

			.g--banner-hero-6-screen {
				display: grid;
				grid-template-columns: 200px 1fr;
				height: 320px;
			}

			.g--banner-hero-6-side {
				background: #f8fafc;
				border-right: 1px solid #e2e8f0;
			}

			.g--banner-hero-6-main {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 16px;
				padding: 24px;
			}

			.g--banner-hero-6-main div {
				border-radius: 10px;
				background: linear-gradient(135deg, #eff6ff, #e0e7ff);
			}

			@media (max-width: 767px) {
				.g--banner-hero-6 {
					padding-top: 64px;
				}

				.g--banner-hero-6 h1 {
					font-size: 36px;
				}

				.g--banner-hero-6-screen {
					grid-template-columns: 1fr;
					height: 200px;
				}

				.g--banner-hero-6-side {
					display: none;
				}
			}
		</style>
	`
};
