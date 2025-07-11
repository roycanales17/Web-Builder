export default {
	id: 'banner-3',
	label: 'Banner 3',
	thumbnail: '/resources/images/thumbnails/banners/banner-3.png',
	category: 'Banner',
	content: `
	<section class="g--banner-hero-3">
		<div class="g--banner-hero-3-overlay">
			<div class="g--banner-hero-3-introduction"> 
				<h1>Top-notch<br>legal services</h1>
				<p>
					We take pride in helping people from all<br>
					walk of life achieve the justice and<br>
					peace they deserve.
				</p>
				<button>Learn More</button>
			</div>
		</div>
	</section>
	<style>
		.g--banner-hero-3 {
			position: relative;
			height: 100vh;
			background-image: url('/resources/images/banners/banner-3.jpg');
			background-size: cover;
			background-position: center;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}
		
		.g--banner-hero-3-overlay {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			background: rgba(16, 31, 61, 0.7);
		}
		
		.g--banner-hero-3-introduction {
			max-width: 800px;
			padding: 120px;
			z-index: 1;
		}
		
		.g--banner-hero-3 h1 {
			line-height: 90px;
			letter-spacing: 1.2px;
			font-size: 5em;
			font-weight: lighter;
			margin: 0 0 20px 0;
			color: #dbbf95;
			color: rgba(219,191,149, 0.9);
			font-family: Times New Roman, Times, serif;
		}
		
		.g--banner-hero-3 p {
			font-size: 1.4em;
			word-spacing: .9px;
			line-height: 1.45;
			margin-bottom: 40px;
			letter-spacing: 1.1px;
			color: #d0d3d5;
		}
		
		.g--banner-hero-3 button {
			padding: 17px 50px;
			font-size: .9em;
			border: none;
			font-weight: bold;
			letter-spacing: 1.2px;
			background-color: #dbbf95;
			color: rgba(18,33,62, .9);
			cursor: pointer;
			text-transform: uppercase;
			transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.1s ease;
		}
		
		@media (max-width: 768px) {
			.g--banner-hero-3 {
				justify-content: center;
				text-align: center;
			}
		
			.g--banner-hero-3-introduction {
				padding: 40px 20px;
			}
		
			.g--banner-hero-3 h1 {
				font-size: 2.4em;
				line-height: 1.2;
			}
		
			.g--banner-hero-3 p {
				font-size: 1em;
				line-height: 1.4;
				margin-bottom: 30px;
			}
		
			.g--banner-hero-3 button {
				padding: 14px 35px;
				font-size: 0.85em;
			}
		}
	</style>
	`
};
