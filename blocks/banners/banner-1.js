export default {
	id: 'banner-1',
	label: 'Banner 1',
	thumbnail: 'https://via.placeholder.com/150x100?text=Banner+1',
	category: 'Banner',
	content: `
		<section class="grape--banner-hero-1">
			<div class="grape--banner-hero-inner">
				<h1>Build Your Dream Project</h1>
				<p>Start designing with ease and flexibility using our intuitive builder tools.</p>
				<button>Launch Now</button>
			</div>
		</section>

		<style>
			.grape--banner-hero-1 {
				padding: 80px 20px;
				background: linear-gradient(135deg, #e0f7fa, #f0f4f8);
				text-align: center;
				border-radius: 12px;
				box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
			}

			.grape--banner-hero-inner {
				max-width: 720px;
				margin: 0 auto;
			}

			.grape--banner-hero-1 h1 {
				font-size: 2rem;
				margin-bottom: 0.5rem;
				color: #2f3640;
			}

			.grape--banner-hero-1 p {
				font-size: 1rem;
				color: #555;
				margin-bottom: 1.5rem;
			}

			.grape--banner-hero-1 button {
				padding: 12px 24px;
				font-size: 1rem;
				background-color: #1e90ff;
				color: #fff;
				border: none;
				border-radius: 6px;
				cursor: pointer;
				transition: background-color 0.3s ease;
			}

			.grape--banner-hero-1 button:hover {
				background-color: #1c7ed6;
			}

			@media (min-width: 640px) {
				.grape--banner-hero-1 h1 {
					font-size: 2.5rem;
				}

				.grape--banner-hero-1 p {
					font-size: 1.125rem;
				}
			}
		</style>
	`
};
