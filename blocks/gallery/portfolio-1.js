export default {
	id: 'portfolio-1',
	label: 'Portfolio — Projects',
	description: 'Project grid with captions on hover',
	category: 'Gallery',
	content: `
		<section class="g--portfolio-1">
			<div class="g--portfolio-1-grid">
				<a href="#" class="g--portfolio-1-item g--portfolio-1-wide">
					<img src="{{assets}}banners/banner-1.avif" alt="App launch website" />
					<span><strong>App launch website</strong>Web design · 2026</span>
				</a>
				<a href="#" class="g--portfolio-1-item">
					<img src="{{assets}}banners/banner-4.avif" alt="Personal brand" />
					<span><strong>Personal brand</strong>Branding · 2025</span>
				</a>
				<a href="#" class="g--portfolio-1-item">
					<img src="{{assets}}banners/banner-5.jpg" alt="Annual report" />
					<span><strong>Annual report</strong>Print · 2025</span>
				</a>
				<a href="#" class="g--portfolio-1-item g--portfolio-1-wide">
					<img src="{{assets}}banners/banner-3.jpg" alt="Law firm rebrand" />
					<span><strong>Law firm rebrand</strong>Strategy · 2024</span>
				</a>
			</div>
		</section>
		<style>
			.g--portfolio-1 {
				max-width: 1200px;
				margin: 0 auto;
				padding: 64px 24px;
			}

			.g--portfolio-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 20px;
			}

			.g--portfolio-1-item {
				position: relative;
				display: block;
				overflow: hidden;
				border-radius: 16px;
				aspect-ratio: 4 / 3;
				color: #fff;
				text-decoration: none;
			}

			.g--portfolio-1-wide {
				grid-column: span 2;
				aspect-ratio: auto;
			}

			.g--portfolio-1-item img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: transform .4s ease;
			}

			.g--portfolio-1-item span {
				position: absolute;
				inset: auto 0 0 0;
				padding: 20px;
				background: linear-gradient(to top, rgba(15, 23, 42, .85), transparent);
				font-size: 14px;
				opacity: 0;
				transform: translateY(10px);
				transition: opacity .3s, transform .3s;
			}

			.g--portfolio-1-item strong {
				display: block;
				font-size: 18px;
			}

			.g--portfolio-1-item:hover img {
				transform: scale(1.05);
			}

			.g--portfolio-1-item:hover span {
				opacity: 1;
				transform: none;
			}

			@media (max-width: 767px) {
				.g--portfolio-1-grid {
					grid-template-columns: 1fr;
				}

				.g--portfolio-1-wide {
					grid-column: auto;
					aspect-ratio: 4 / 3;
				}

				.g--portfolio-1-item span {
					opacity: 1;
					transform: none;
				}
			}
		</style>
	`
};
