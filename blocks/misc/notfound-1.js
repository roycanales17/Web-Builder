export default {
	id: 'notfound-1',
	label: '404 — Not Found',
	description: 'Friendly error message with a link home',
	category: 'Content',
	content: `
		<section class="g--notfound-1">
			<p class="g--notfound-1-code">404</p>
			<h1>We can't find that page</h1>
			<p>The link may be broken, or the page may have moved.</p>
			<a href="index.html">← Back to the homepage</a>
		</section>
		<style>
			.g--notfound-1 {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				min-height: 60vh;
				padding: 80px 24px;
				text-align: center;
			}

			.g--notfound-1-code {
				margin: 0;
				font-size: 120px;
				font-weight: 800;
				line-height: 1;
				background: linear-gradient(135deg, #2563eb, #7c3aed);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
			}

			.g--notfound-1 h1 {
				margin: 16px 0 8px;
				font-size: 32px;
				color: #0f172a;
			}

			.g--notfound-1 p {
				margin: 0 0 28px;
				color: #64748b;
			}

			.g--notfound-1 a {
				padding: 12px 24px;
				border-radius: 10px;
				background: #0f172a;
				color: #fff;
				font-weight: 600;
				text-decoration: none;
			}
		</style>
	`
};
