export default {
	id: 'services-1',
	label: 'Services — Grid',
	description: 'Six services with icons and links',
	category: 'Services',
	content: `
		<section class="g--services-1" id="services">
			<div class="g--services-1-header">
				<h2>What we do</h2>
				<p>End-to-end services to take your brand from first sketch to launch day.</p>
			</div>
			<div class="g--services-1-grid">
				<article>
					<span>🧭</span>
					<h3>Strategy</h3>
					<p>Research, positioning and a clear plan before a single pixel is drawn.</p>
					<a href="contact.html">Learn more →</a>
				</article>
				<article>
					<span>✏️</span>
					<h3>Brand design</h3>
					<p>Logos, color systems and typography that make you recognizable.</p>
					<a href="contact.html">Learn more →</a>
				</article>
				<article>
					<span>💻</span>
					<h3>Web design</h3>
					<p>Responsive websites that look sharp on every screen.</p>
					<a href="contact.html">Learn more →</a>
				</article>
				<article>
					<span>📈</span>
					<h3>Marketing</h3>
					<p>Campaigns and content that bring the right visitors to your door.</p>
					<a href="contact.html">Learn more →</a>
				</article>
				<article>
					<span>📸</span>
					<h3>Photography</h3>
					<p>Product and team photos that tell your story honestly.</p>
					<a href="contact.html">Learn more →</a>
				</article>
				<article>
					<span>🛠️</span>
					<h3>Support</h3>
					<p>Updates, fixes and improvements long after launch.</p>
					<a href="contact.html">Learn more →</a>
				</article>
			</div>
		</section>
		<style>
			.g--services-1 {
				padding: 80px 24px;
			}

			.g--services-1-header {
				max-width: 640px;
				margin: 0 auto 48px;
				text-align: center;
			}

			.g--services-1-header h2 {
				margin: 0 0 8px;
				font-size: 34px;
				color: #0f172a;
			}

			.g--services-1-header p {
				margin: 0;
				color: #64748b;
			}

			.g--services-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 24px;
				max-width: 1100px;
				margin: 0 auto;
			}

			.g--services-1-grid article {
				padding: 28px;
				border: 1px solid #e2e8f0;
				border-radius: 16px;
				transition: border-color .2s, box-shadow .2s;
			}

			.g--services-1-grid article:hover {
				border-color: #93c5fd;
				box-shadow: 0 10px 30px rgba(37, 99, 235, .08);
			}

			.g--services-1-grid span {
				font-size: 28px;
			}

			.g--services-1-grid h3 {
				margin: 12px 0 8px;
				font-size: 19px;
				color: #0f172a;
			}

			.g--services-1-grid p {
				margin: 0 0 16px;
				color: #64748b;
			}

			.g--services-1-grid a {
				color: #2563eb;
				font-weight: 600;
				text-decoration: none;
			}

			@media (max-width: 900px) {
				.g--services-1-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}

			@media (max-width: 575px) {
				.g--services-1-grid {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
