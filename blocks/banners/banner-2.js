export default {
	id: 'banner-2',
	label: 'Banner 2',
	media: '<i class="fas fa-image" style="font-size:24px;color:#2ecc71;"></i>',
	category: 'Banner',
	content: `
		<section class="grape--banner-hero-2">
			<div class="grape--banner-hero-content">
				<div class="grape--banner-hero-text">
					<h2>Design Without Limits</h2>
					<p>Unleash creativity with powerful features built for flexibility and speed.</p>
					<button>Explore Features</button>
				</div>
				<div class="grape--banner-hero-image">
					<img src="https://via.placeholder.com/400x250?text=Design+Preview" alt="Preview">
				</div>
			</div>
		</section>

		<style>
			.grape--banner-hero-2 {
				padding: 60px 20px;
				background-color: #fdfdfd;
				border-radius: 12px;
				box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
			}

			.grape--banner-hero-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				max-width: 960px;
				margin: 0 auto;
			}

			.grape--banner-hero-text {
				flex: 1;
				margin-bottom: 24px;
			}

			.grape--banner-hero-text h2 {
				font-size: 2rem;
				margin-bottom: 0.5rem;
				color: #2f3640;
			}

			.grape--banner-hero-text p {
				color: #666;
				margin-bottom: 1rem;
			}

			.grape--banner-hero-text button {
				background-color: #2ecc71;
				color: #fff;
				padding: 10px 20px;
				border: none;
				border-radius: 6px;
				cursor: pointer;
				font-size: 1rem;
				transition: background-color 0.3s ease;
			}

			.grape--banner-hero-text button:hover {
				background-color: #27ae60;
			}

			.grape--banner-hero-image img {
				width: 100%;
				max-width: 400px;
				border-radius: 8px;
			}

			@media (min-width: 768px) {
				.grape--banner-hero-content {
					flex-direction: row;
					text-align: left;
				}

				.grape--banner-hero-text {
					margin-bottom: 0;
					margin-right: 32px;
				}
			}
		</style>
	`
};
