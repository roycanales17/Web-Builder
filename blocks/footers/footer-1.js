export default {
	id: 'footer-1',
	label: 'Footer — Columns',
	description: 'Brand blurb with three link columns',
	category: 'Footer',
	content: `
		<footer class="g--footer-1">
			<div class="g--footer-1-brand">
				<strong>BrandLogo</strong>
				<p>Beautiful websites, built visually and exported as clean code.</p>
			</div>
			<div>
				<h4>Product</h4>
				<a href="#features">Features</a>
				<a href="#pricing">Pricing</a>
				<a href="#faq">FAQ</a>
			</div>
			<div>
				<h4>Company</h4>
				<a href="#about">About</a>
				<a href="#">Careers</a>
				<a href="#contact">Contact</a>
			</div>
			<div>
				<h4>Legal</h4>
				<a href="#">Privacy</a>
				<a href="#">Terms</a>
			</div>
			<p class="g--footer-1-copy">© 2026 BrandLogo. All rights reserved.</p>
		</footer>
		<style>
			.g--footer-1 {
				display: grid;
				grid-template-columns: 2fr 1fr 1fr 1fr;
				gap: 32px;
				padding: 56px 40px 24px;
				background: #0f172a;
				color: #94a3b8;
			}

			.g--footer-1-brand strong {
				font-size: 20px;
				color: #fff;
			}

			.g--footer-1-brand p {
				max-width: 320px;
			}

			.g--footer-1 h4 {
				margin: 0 0 12px;
				color: #fff;
				font-size: 15px;
			}

			.g--footer-1 a {
				display: block;
				padding: 4px 0;
				color: #94a3b8;
				text-decoration: none;
			}

			.g--footer-1 a:hover {
				color: #fff;
			}

			.g--footer-1-copy {
				grid-column: 1 / -1;
				margin: 16px 0 0;
				padding-top: 24px;
				border-top: 1px solid #1e293b;
				font-size: 14px;
			}

			@media (max-width: 767px) {
				.g--footer-1 {
					grid-template-columns: 1fr 1fr;
					padding: 40px 24px 24px;
				}

				.g--footer-1-brand {
					grid-column: 1 / -1;
				}
			}
		</style>
	`
};
