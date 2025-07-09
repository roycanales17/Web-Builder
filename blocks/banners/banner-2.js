export default {
	id: 'banner-2',
	label: 'Banner 2',
	thumbnail: '/resources/images/thumbnails/banners/banner-2.png',
	category: 'Banner',
	content: `
		<section class="g--banner-hero-2">
			<div class="g--banner-hero-2-overlay"> 
				<div class="g--banner-hero-2-introduction"> 
					<h1>Mesmerizing<br>Colors of Aurora</h1>
					<p>
					  Journey to the edge of wonder and witness the Aurora Borealis,<br>
					  when nature's most dazzling light show awaits to captivate your <br>
					  senses and ignite your imagination.
					</p>
				</div>
				<div class="g--banner-hero-2-features">
					<div class="g--banner-hero-2-lists"> 
						<div class="g--banner-hero-2-feature">
							<div class="g--banner-hero-2-icon">
							✈️
							</div>
							<div class="g--banner-hero-2-text">
								<span class="g--banner-hero-2-title">Flights to Finland</span>
								<span class="g--banner-hero-2-price">$599<span class="g--banner-hero-2-per">/person</span></span>
							</div>
						</div>
						<div class="g--banner-hero-2-feature">
							<div class="g--banner-hero-2-icon">
							✈️
							</div>
							<div class="g--banner-hero-2-text">
								<span class="g--banner-hero-2-title">Accommodations</span>
								<span class="g--banner-hero-2-price">$199<span class="g--banner-hero-2-per">/person</span></span>
							</div>
						</div>
						<div class="g--banner-hero-2-feature">
							<div class="g--banner-hero-2-icon">
							✈️
							</div>
							<div class="g--banner-hero-2-text">
								<span class="g--banner-hero-2-title">Vacation Plan</span>
								<span class="g--banner-hero-2-price">$970<span class="g--banner-hero-2-per">/ 10 days</span></span>
							</div>
						</div>
					</div>
					<button class="g--banner-hero-2-button">Explore</button>
				</div>
			</div>
		</section>
	
		<style>
			.g--banner-hero-2 {
				position: relative;
				height: 100vh;
				background-image: url('/resources/images/banners/banner-2.jpg');
				background-size: cover;
				background-position: center;
				display: flex;
				align-items: center;
				justify-content: flex-start;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
				color: #ffffff;
			}
			.g--banner-hero-2-overlay {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				padding: 120px 80px 80px 80px;
				gap: 7em;
				background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
			}
			.g--banner-hero-2-introduction {
				width: 100%;
				display: flex;
				flex-direction: column;
				gap: 20px;
				z-index: 1;
			}
			.g--banner-hero-2-introduction h1 {
				font-family: Helvetica, sans-serif;
				font-size: 5.5em;
				font-weight: 500;
				line-height: 90px;
			}
			.g--banner-hero-2-introduction p {
				font-weight: lighter;
				font-size: 1.2em;
				word-spacing: 1px;
				line-height: 1.45;
			}
			.g--banner-hero-2-introduction h1,
			.g--banner-hero-2-introduction p {
			  	margin: 0;
			}
			.g--banner-hero-2-features { 
				width: 100%;
				border-top: 2px solid gray;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				padding: 35px 20px 35px 0;
			}
			.g--banner-hero-2-lists {
				display: flex;
				flex-direction: row;
				gap: 1em;
			}
			.g--banner-hero-2-feature {
				display: flex;
				align-items: center;
				gap: 1.2em;
				color: #d1dce6;
				padding: 15px 20px;
				border-radius: 10px;
				font-family: Arial, sans-serif;
				width: fit-content;
			}
			.g--banner-hero-2-icon {
				width: 40px;
				height: 40px;
				border: 2px solid #d1dce6;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
			}
			.g--banner-hero-2-text {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}
			.g--banner-hero-2-title {
				font-size: 14px;
				color: #d1dce6;
				letter-spacing: 1.2px;
			}
			.g--banner-hero-2-price {
				font-size: 18px;
				font-weight: bold;
				color: #ffffff;
			}
			.g--banner-hero-2-per {
				font-weight: normal;
				color: #ffffff;
			}
			.g--banner-hero-2-button {
				background: linear-gradient(
					to right,
					#0f3f2f,   /* dark greenish base */
					#1d6f4f,   /* deeper aurora green */
					#28a675,   /* brighter green highlight */
					#50ffba    /* light minty aurora tint */
				);
				color: white;
				border: none;
				border-radius: 8px;
				cursor: pointer;
				transition: 0.3s ease;
				text-transform: uppercase;
				width: 200px;
				height: 45px;
				letter-spacing: 2px;
			}
			.g--banner-hero-2-button:hover {
				filter: brightness(1.1);
			}
			
			/* Tablet (<= 1024px) */
			@media (max-width: 1024px) {
				.g--banner-hero-2-introduction h1 {
				font-size: 4em;
				line-height: 1.2;
				}
				.g--banner-hero-2-introduction p {
				font-size: 1.1em;
				}
				.g--banner-hero-2-features {
				flex-direction: column;
				align-items: flex-start;
				gap: 20px;
				padding: 30px 0;
				}
				.g--banner-hero-2-lists {
				flex-direction: column;
				width: 100%;
				gap: 15px;
				}
				.g--banner-hero-2-feature {
				width: 100%;
				}
				.g--banner-hero-2-button {
				width: 100%;
				}
			}
			
			/* Mobile (<= 768px) */
			@media (max-width: 768px) {
				.g--banner-hero-2-overlay {
					padding: 100px 20px 40px 20px;
					gap: 4em;
				}
				.g--banner-hero-2-introduction h1 {
					font-size: 2.8em;
				}
				.g--banner-hero-2-introduction p {
					font-size: 1em;
				}
				.g--banner-hero-2-lists {
					gap: 12px;
				}
				.g--banner-hero-2-icon {
					width: 35px;
					height: 35px;
					font-size: 16px;
				}
				.g--banner-hero-2-title {
					font-size: 13px;
				}
				.g--banner-hero-2-price {
					font-size: 16px;
				}
				.g--banner-hero-2-button {
					height: 42px;
					font-size: 14px;
					letter-spacing: 1px;
				}
			}
		</style>
	`
};
