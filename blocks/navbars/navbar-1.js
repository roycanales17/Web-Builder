export default {
	id: 'navbar-1',
	label: 'Navbar — Classic',
	description: 'Brand on the left, links on the right',
	category: 'Navigation',
	content: `
		<header class="g--navbar-1">
			<a class="g--navbar-1-brand" href="index.html">BrandLogo</a>
			<nav class="g--navbar-1-links">
				<a href="index.html">Home</a>
				<a href="#about">About</a>
				<a href="#services">Services</a>
				<a href="#contact">Contact</a>
			</nav>
		</header>
		<style>
			.g--navbar-1 {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 16px;
				padding: 16px 24px;
				background: #1e90ff;
				color: #fff;
			}

			.g--navbar-1-brand {
				font-size: 20px;
				font-weight: 700;
				color: inherit;
				text-decoration: none;
			}

			.g--navbar-1-links {
				display: flex;
				flex-wrap: wrap;
				gap: 20px;
			}

			.g--navbar-1-links a {
				color: inherit;
				text-decoration: none;
				opacity: .9;
			}

			.g--navbar-1-links a:hover {
				opacity: 1;
				text-decoration: underline;
			}

			@media (max-width: 575px) {
				.g--navbar-1 {
					flex-direction: column;
				}
			}
		</style>
	`
};
