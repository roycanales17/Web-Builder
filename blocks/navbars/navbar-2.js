export default {
	id: 'navbar-2',
	label: 'Navbar — Dark with CTA',
	description: 'Dark bar with links to your pages and a call-to-action',
	category: 'Navigation',
	content: `
		<header class="g--navbar-2">
			<a class="g--navbar-2-brand" href="index.html"><span>◆</span> Nimbus</a>
			<nav class="g--navbar-2-links" data-nav>
				{{nav}}
			</nav>
			<a class="g--navbar-2-cta" href="contact.html">Get started</a>
		</header>
		<style>
			.g--navbar-2 {
				display: flex;
				align-items: center;
				gap: 32px;
				padding: 18px 40px;
				background: #0f172a;
				color: #e2e8f0;
			}

			.g--navbar-2-brand {
				font-weight: 700;
				font-size: 20px;
				color: #fff;
				text-decoration: none;
			}

			.g--navbar-2-brand span {
				color: #38bdf8;
			}

			.g--navbar-2-links {
				display: flex;
				flex-wrap: wrap;
				gap: 8px 24px;
				margin-right: auto;
			}

			.g--navbar-2-links a {
				color: #cbd5e1;
				text-decoration: none;
				font-size: 15px;
			}

			.g--navbar-2-links a:hover,
			.g--navbar-2-links a[aria-current="page"] {
				color: #fff;
			}

			.g--navbar-2-links a[aria-current="page"] {
				font-weight: 600;
			}

			.g--navbar-2-cta {
				padding: 10px 18px;
				border-radius: 8px;
				background: #38bdf8;
				color: #0f172a;
				font-weight: 600;
				text-decoration: none;
			}

			@media (max-width: 767px) {
				.g--navbar-2 {
					flex-wrap: wrap;
					gap: 16px;
					padding: 16px 20px;
				}

				.g--navbar-2-links {
					order: 3;
					width: 100%;
					margin: 0;
				}

				.g--navbar-2-cta {
					margin-left: auto;
				}
			}
		</style>
	`
};
