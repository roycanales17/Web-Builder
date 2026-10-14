export default {
	id: 'gallery-1',
	label: 'Gallery — Photo Grid',
	description: 'Responsive grid of photos',
	category: 'Gallery',
	content: `
		<section class="g--gallery-1">
			<h2>Gallery</h2>
			<div class="g--gallery-1-grid">
				<img src="{{assets}}banners/banner-1.avif" alt="Gallery photo 1" />
				<img src="{{assets}}banners/banner-2.jpg" alt="Gallery photo 2" />
				<img src="{{assets}}banners/banner-3.jpg" alt="Gallery photo 3" />
				<img src="{{assets}}banners/banner-4.avif" alt="Gallery photo 4" />
				<img src="{{assets}}banners/banner-5.jpg" alt="Gallery photo 5" />
				<img src="{{assets}}banners/banner-2.jpg" alt="Gallery photo 6" />
			</div>
		</section>
		<style>
			.g--gallery-1 {
				padding: 80px 24px;
				max-width: 1200px;
				margin: 0 auto;
			}

			.g--gallery-1 h2 {
				margin: 0 0 32px;
				font-size: 34px;
				text-align: center;
				color: #0f172a;
			}

			.g--gallery-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 16px;
			}

			.g--gallery-1-grid img {
				display: block;
				width: 100%;
				aspect-ratio: 1;
				object-fit: cover;
				border-radius: 12px;
			}

			@media (max-width: 767px) {
				.g--gallery-1-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
		</style>
	`
};
