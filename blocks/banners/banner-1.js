export default {
	id: 'banner-1',
	label: 'Banner 1',
	thumbnail: '/resources/images/thumbnails/banners/banner-1.png',
	category: 'Banner',
	content: `
	<section class="g--banner-hero-1">
		<div class="g--banner-hero-1-overlay">
			<div class="g--banner-hero-1-introduction"> 
				<h1>Bring AI-Driven understanding of users to your app</h1>
				<p>Boost your app with a personalized monetization and engagement experience. Delight your users with exactly what they want.</p>
				<button>Get the demo &gt;</button>
			</div>
		</div>
	</section>
	
	<style>
		.g--banner-hero-1 {
			position: relative;
			height: 100vh;
			background-image: url('/resources/images/banners/banner-1.avif');
			background-size: cover;
			background-position: center;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}
		
		.g--banner-hero-1-overlay {
			width: 100%;
			height: 100%;
			background: linear-gradient(
			  to right,
			  rgba(255, 255, 255, 1) 40%,
			  rgba(255, 255, 255, 0.8) 60%,
			  rgba(255, 255, 255, 0) 90%
			);
			display: flex;
			align-items: center;
		}
		
		.g--banner-hero-1-introduction {
			max-width: 800px;
			padding: 80px;
			z-index: 1;
		}
		
		.g--banner-hero-1 h1 {
			font-size: 3.5em;
			font-weight: 600;
			margin: 0 0 20px 0;
		}
		
		.g--banner-hero-1 p {
			font-size: 14px;
			word-spacing: 1px;
			line-height: 1.45;
			margin-bottom: 30px;
		}
		
		.g--banner-hero-1 button {
			padding: 12px 24px;
			font-size: 1em;
			border: none;
			background-color: #1e90ff;
			color: #fff;
			cursor: pointer;
			border-radius: 8px;
			font-weight: 600;
			box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
			transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.1s ease;
		}
		
		.g--banner-hero-1 button:hover {
			background-color: #1c7ed6;
			box-shadow: 0 6px 18px rgba(30, 144, 255, 0.4);
			transform: translateY(-1px);
		}
		
		.g--banner-hero-1 button:focus {
			outline: none;
			box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.4);
		}
		
		
		@media (max-width: 768px) {
			.g--banner-hero-1 {
				height: auto;
				padding-bottom: 40px;
			}
		
			.g--banner-hero-1-overlay {
				flex-direction: column;
				background: linear-gradient(
					to bottom,
					rgba(255, 255, 255, 0.95) 60%,
					rgba(255, 255, 255, 0.8) 80%,
					rgba(255, 255, 255, 0) 100%
				);
			}
		
			.g--banner-hero-1-introduction {
				padding: 40px 20px;
				max-width: 100%;
				text-align: left;
			}
			
			.g--banner-hero-1 h1 {
				font-size: 2em;
			}
			
			.g--banner-hero-1 p {
				font-size: 1em;
			}
		}
	</style>
	`
};
