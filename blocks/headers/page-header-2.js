export default {
	id: 'page-header-2',
	label: 'Page Header — Photo',
	description: 'Page title over a background photo (uses the page name)',
	category: 'Page Header',
	content: `
		<section class="g--page-header-2">
			<div class="g--page-header-2-inner">
				<h1>{{page}}</h1>
				<p>Introduce this page in one or two short sentences.</p>
			</div>
		</section>
		<style>
			.g--page-header-2 {
				display: flex;
				align-items: flex-end;
				min-height: 340px;
				padding: 48px 40px;
				background: linear-gradient(to top, rgba(15, 23, 42, .85), rgba(15, 23, 42, .2)), url('{{assets}}banners/banner-2.jpg') center / cover;
				color: #e2e8f0;
			}

			.g--page-header-2-inner {
				max-width: 1100px;
				width: 100%;
				margin: 0 auto;
			}

			.g--page-header-2 h1 {
				margin: 0 0 8px;
				font-size: 52px;
				line-height: 1.1;
				color: #fff;
			}

			.g--page-header-2 p {
				margin: 0;
				font-size: 18px;
			}

			@media (max-width: 767px) {
				.g--page-header-2 {
					min-height: 260px;
					padding: 32px 20px;
				}

				.g--page-header-2 h1 {
					font-size: 36px;
				}
			}
		</style>
	`
};
