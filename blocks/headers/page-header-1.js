export default {
	id: 'page-header-1',
	label: 'Page Header — Title',
	description: 'Inner-page title with breadcrumb (uses the page name)',
	category: 'Page Header',
	content: `
		<section class="g--page-header-1">
			<nav class="g--page-header-1-crumbs" aria-label="Breadcrumb">
				<a href="index.html">Home</a>
				<span aria-hidden="true">/</span>
				<span>{{page}}</span>
			</nav>
			<h1>{{page}}</h1>
			<p>A short sentence that explains what visitors will find on this page.</p>
		</section>
		<style>
			.g--page-header-1 {
				padding: 72px 24px;
				background: #0f172a;
				background-image: radial-gradient(circle at 20% 0%, rgba(56, 189, 248, .25), transparent 50%);
				color: #cbd5e1;
				text-align: center;
			}

			.g--page-header-1-crumbs {
				display: flex;
				justify-content: center;
				gap: 8px;
				margin-bottom: 16px;
				font-size: 14px;
			}

			.g--page-header-1-crumbs a {
				color: #38bdf8;
				text-decoration: none;
			}

			.g--page-header-1 h1 {
				margin: 0 0 12px;
				font-size: 48px;
				line-height: 1.1;
				color: #fff;
			}

			.g--page-header-1 p {
				max-width: 560px;
				margin: 0 auto;
				font-size: 18px;
			}

			@media (max-width: 767px) {
				.g--page-header-1 h1 {
					font-size: 34px;
				}
			}
		</style>
	`
};
