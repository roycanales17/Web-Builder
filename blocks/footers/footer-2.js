export default {
	id: 'footer-2',
	label: 'Footer — Simple',
	description: 'One line with copyright and links',
	category: 'Footer',
	content: `
		<footer class="g--footer-2">
			<p>© 2026 BrandLogo</p>
			<nav>
				<a href="#">Privacy</a>
				<a href="#">Terms</a>
				<a href="#contact">Contact</a>
			</nav>
		</footer>
		<style>
			.g--footer-2 {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				align-items: center;
				gap: 16px;
				padding: 24px 40px;
				border-top: 1px solid #e2e8f0;
				color: #64748b;
				font-size: 14px;
			}

			.g--footer-2 p {
				margin: 0;
			}

			.g--footer-2 nav {
				display: flex;
				gap: 20px;
			}

			.g--footer-2 a {
				color: inherit;
				text-decoration: none;
			}

			.g--footer-2 a:hover {
				color: #0f172a;
			}
		</style>
	`
};
