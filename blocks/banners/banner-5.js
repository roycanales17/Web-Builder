export default {
	id: 'banner-5',
	label: 'Banner 5',
	thumbnail: '/resources/images/thumbnails/banners/banner-5.png',
	category: 'Banner',
	content: `
	<section class="g--banner-hero-3">
	
		<!-- Left: Image -->
		<div class="g--banner-hero-3-left">
			<img src="/resources/images/banners/banner-5.png" alt="Wilderness illustration" class="g--banner-hero-3-img" />
		</div>
	
		<!-- Right: Text -->
		<div class="g--banner-hero-3-content">
			<div class="g--banner-hero-3-logo">
				<img src="/resources/images/banners/banner-5-grass.png" alt="Logo" />
				<p>Wilderness Watchers <br>Foundation</p>
			</div>
			<div class="g--banner-hero-3-details"> 
				<h1>Annual Report 2030</h1>
				<p>Respecting and<br />Protecting Wildlife</p>
			</div>
			<div class="g--banner-hero-3-buttons">
				<a href="#">Read the report</a>
				<a href="#">Learn about us</a>
			</div>
		</div>
	</section>
	
	<style>
		.g--banner-hero-3 {
			position: relative;
			display: grid;
			padding: 2rem;
			grid-template-columns: 50% 50%;
			background-color: #F7D26A;
			height: 100vh;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}
		
		.g--banner-hero-3-left {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		.g--banner-hero-3-img {
			max-width: 100%;
			max-height: 100%;
			display: block;
			margin: auto;
		}
		
		.g--banner-hero-3-content {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: center;
			padding: 0 50px;
			gap: 2rem;
		}
		
		.g--banner-hero-3-logo {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 15px;
			font-size: 14px;
		}
		
		.g--banner-hero-3-logo p {
			font-size: 1.5rem;
			font-weight: 600;
		}
		
		.g--banner-hero-3-logo img {
			width: 65px;
			height: 65px;
			border-radius: 50%;
			border: 2px solid #000;
			box-sizing: border-box;
			padding: .5rem;
		}
		
		.g--banner-hero-3-details {
			font-size: 2.6rem;
		}
		
		.g--banner-hero-3-details h1,
		.g--banner-hero-3-details p {
			margin: 0;
		}
		
		.g--banner-hero-3-details h1 {
			font-weight: 500;
			font-size: 2.7rem;
			letter-spacing: 1.2px;
		}
		
		.g--banner-hero-3-details p {
			font-weight: 200;
			letter-spacing: 1.5px;
		}
		
		.g--banner-hero-3-buttons {
			display: flex;
			flex-direction: row;
			gap: 10px;
			margin-top: 2rem;
			flex-wrap: wrap;
		}
		
		.g--banner-hero-3-buttons a {
			text-decoration: none;
			background-color: #000;
			color: #cecece;
			padding: 17px 35px;
			transition: background-color 0.3s;
		}
		
		@media (max-width: 1023px) {
			.g--banner-hero-3 {
				grid-template-columns: 1fr;
				height: auto;
				padding: 2rem 1.5rem;
				text-align: center;
			}
		
			.g--banner-hero-3-content {
				align-items: center;
				padding: 2rem 1rem;
			}
		
			.g--banner-hero-3-logo {
				justify-content: center;
				flex-direction: column;
				gap: 10px;
			}
		
			.g--banner-hero-3-logo p {
				font-size: 1.3rem;
			}
		
			.g--banner-hero-3-details h1 {
				font-size: 2rem;
			}
		
			.g--banner-hero-3-details p {
				font-size: 1.2rem;
			}
		
			.g--banner-hero-3-buttons {
				justify-content: center;
			}
		}
		
		@media (max-width: 767px) {
			.g--banner-hero-3-buttons a {
				width: 100%;
				text-align: center;
				padding: 15px;
			}
		
			.g--banner-hero-3-logo img {
				width: 55px;
				height: 55px;
			}
		
			.g--banner-hero-3-details {
				font-size: 2rem;
			}
		}
	</style>
	`
};
