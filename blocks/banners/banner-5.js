export default {
	id: 'banner-5',
	label: 'Banner 5',
	thumbnail: '/resources/images/thumbnails/banners/banner-5.png',
	category: 'Banner',
	content: `
	<section class="hero">
	
		<!-- Left: Image -->
		<div class="hero-left">
			<img src="/resources/images/banners/banner-5.png" alt="Wilderness illustration" class="hero-img" />
		</div>
	
		<!-- Right: Text -->
		<div class="hero-content">
			<div class="hero-logo">
				<img src="/resources/images/banners/banner-5-grass.png" alt="Logo" />
				<p>Wilderness Watchers <br>Foundation</p>
			</div>
			<div class="hero-details"> 
				<h1>Annual Report 2030</h1>
				<p>Respecting and<br />Protecting Wildlife</p>
			</div>
			<div class="hero-buttons">
				<a href="#">Read the report</a>
				<a href="#">Learn about us</a>
			</div>
		</div>
	</section>
	
	<style>
	.hero {
		position: relative;
		display: grid;
		padding: 2rem;
		grid-template-columns: 50% 50%;
		background-color: #F7D26A;
		height: 100vh;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}
	
	.hero-left {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.hero-img {
		max-width: 100%;
		max-height: 100%;
		display: block;
		margin: auto;
	}
	
	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 50px;
		gap: 2rem;
	}
	
	.hero-logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 15px;
		font-size: 14px;
	}
	
	.hero-logo p {
		font-size: 1.5rem;
		font-weight: 600;
	}
	
	.hero-logo img {
		width: 65px;
		height: 65px;
		border-radius: 50%;
		border: 2px solid #000;
		box-sizing: border-box;
		padding: .5rem;
	}
	
	.hero-details {
		font-size: 2.6rem;
	}
	
	.hero-details h1,
	.hero-details p {
		margin: 0;
	}
	
	.hero-details h1 {
		font-weight: 500;
		font-size: 2.7rem;
		letter-spacing: 1.2px;
	}
	
	.hero-details p {
		font-weight: 200;
		letter-spacing: 1.5px;
	}
	
	.hero-buttons {
		display: flex;
		flex-direction: row;
		gap: 10px;
		margin-top: 2rem;
		flex-wrap: wrap;
	}
	
	.hero-buttons a {
		text-decoration: none;
		background-color: #000;
		color: #cecece;
		padding: 17px 35px;
		transition: background-color 0.3s;
	}
	
	@media (max-width: 1023px) {
		.hero {
			grid-template-columns: 1fr;
			height: auto;
			padding: 2rem 1.5rem;
			text-align: center;
		}
	
		.hero-content {
			align-items: center;
			padding: 2rem 1rem;
		}
	
		.hero-logo {
			justify-content: center;
			flex-direction: column;
			gap: 10px;
		}
	
		.hero-logo p {
			font-size: 1.3rem;
		}
	
		.hero-details h1 {
			font-size: 2rem;
		}
	
		.hero-details p {
			font-size: 1.2rem;
		}
	
		.hero-buttons {
			justify-content: center;
		}
	}
	
	@media (max-width: 767px) {
		.hero-buttons a {
			width: 100%;
			text-align: center;
			padding: 15px;
		}
	
		.hero-logo img {
			width: 55px;
			height: 55px;
		}
	
		.hero-details {
			font-size: 2rem;
		}
	}
	</style>
	`
};
