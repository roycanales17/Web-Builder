export default {
	id: 'blog-1',
	label: 'Blog — Post Cards',
	description: 'Three latest articles with images',
	category: 'Blog',
	content: `
		<section class="g--blog-1">
			<div class="g--blog-1-header">
				<h2>Latest articles</h2>
				<a href="blog.html">View all →</a>
			</div>
			<div class="g--blog-1-grid">
				<article>
					<img src="{{assets}}banners/banner-2.jpg" alt="Northern lights" />
					<p class="g--blog-1-meta">Design · 5 min read</p>
					<h3><a href="blog-post.html">Choosing colors that work on every screen</a></h3>
					<p>A practical guide to building a palette that stays readable in any light.</p>
				</article>
				<article>
					<img src="{{assets}}banners/banner-3.jpg" alt="Desk with documents" />
					<p class="g--blog-1-meta">Business · 7 min read</p>
					<h3><a href="blog-post.html">Writing a homepage that converts</a></h3>
					<p>What to put above the fold, and what to leave out entirely.</p>
				</article>
				<article>
					<img src="{{assets}}banners/banner-1.avif" alt="Product screenshot" />
					<p class="g--blog-1-meta">Product · 4 min read</p>
					<h3><a href="blog-post.html">What's new in version 2.0</a></h3>
					<p>Multi-page sites, responsive styles and a brand new template library.</p>
				</article>
			</div>
		</section>
		<style>
			.g--blog-1 {
				max-width: 1100px;
				margin: 0 auto;
				padding: 80px 24px;
			}

			.g--blog-1-header {
				display: flex;
				justify-content: space-between;
				align-items: baseline;
				gap: 16px;
				margin-bottom: 32px;
			}

			.g--blog-1-header h2 {
				margin: 0;
				font-size: 34px;
				color: #0f172a;
			}

			.g--blog-1-header a {
				color: #2563eb;
				font-weight: 600;
				text-decoration: none;
			}

			.g--blog-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 28px;
			}

			.g--blog-1-grid img {
				display: block;
				width: 100%;
				aspect-ratio: 16 / 10;
				object-fit: cover;
				border-radius: 14px;
			}

			.g--blog-1-meta {
				margin: 16px 0 6px;
				color: #2563eb;
				font-size: 13px;
				font-weight: 600;
			}

			.g--blog-1-grid h3 {
				margin: 0 0 8px;
				font-size: 20px;
				line-height: 1.3;
			}

			.g--blog-1-grid h3 a {
				color: #0f172a;
				text-decoration: none;
			}

			.g--blog-1-grid h3 a:hover {
				color: #2563eb;
			}

			.g--blog-1-grid article > p:last-child {
				margin: 0;
				color: #64748b;
			}

			@media (max-width: 900px) {
				.g--blog-1-grid {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
