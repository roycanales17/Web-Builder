export default {
	id: 'article-1',
	label: 'Article — Blog Post',
	description: 'Long-form post with title, cover image and rich text',
	category: 'Blog',
	content: `
		<article class="g--article-1">
			<header>
				<p class="g--article-1-meta"><a href="blog.html">Blog</a> · March 12, 2026 · 6 min read</p>
				<h1>{{page}}</h1>
				<p class="g--article-1-lead">A short summary of the article that makes people want to keep reading.</p>
				<div class="g--article-1-author">
					<img src="{{assets}}extra/person.webp" alt="Alex Rivera" />
					<span><strong>Alex Rivera</strong><br>Founder</span>
				</div>
			</header>
			<img class="g--article-1-cover" src="{{assets}}banners/banner-2.jpg" alt="Northern lights over a lake" />
			<div class="g--article-1-body">
				<p>Start with a strong opening paragraph. Tell readers what problem you are solving and why it matters to them right now.</p>
				<h2>A clear section heading</h2>
				<p>Break long articles into sections. Each section should make one point, supported by an example or two.</p>
				<blockquote>Good writing is clear thinking made visible.</blockquote>
				<p>Lists help readers scan:</p>
				<ul>
					<li>Keep paragraphs short</li>
					<li>Use headings as signposts</li>
					<li>End with a clear next step</li>
				</ul>
				<h2>Wrapping up</h2>
				<p>Summarize the key takeaway and invite readers to get in touch or read another article.</p>
			</div>
		</article>
		<style>
			.g--article-1 {
				max-width: 760px;
				margin: 0 auto;
				padding: 72px 24px;
				color: #334155;
			}

			.g--article-1-meta {
				margin: 0 0 12px;
				color: #64748b;
				font-size: 14px;
			}

			.g--article-1-meta a {
				color: #2563eb;
				text-decoration: none;
				font-weight: 600;
			}

			.g--article-1 h1 {
				margin: 0 0 16px;
				font-size: 44px;
				line-height: 1.15;
				color: #0f172a;
			}

			.g--article-1-lead {
				margin: 0 0 24px;
				font-size: 20px;
				color: #475569;
			}

			.g--article-1-author {
				display: flex;
				align-items: center;
				gap: 12px;
				font-size: 14px;
				line-height: 1.4;
			}

			.g--article-1-author img {
				width: 44px;
				height: 44px;
				border-radius: 50%;
				object-fit: cover;
				background: #e2e8f0;
			}

			.g--article-1-cover {
				display: block;
				width: 100%;
				margin: 40px 0;
				aspect-ratio: 16 / 9;
				object-fit: cover;
				border-radius: 16px;
			}

			.g--article-1-body {
				font-size: 18px;
				line-height: 1.8;
			}

			.g--article-1-body h2 {
				margin: 40px 0 12px;
				font-size: 28px;
				color: #0f172a;
			}

			.g--article-1-body blockquote {
				margin: 32px 0;
				padding-left: 20px;
				border-left: 4px solid #2563eb;
				font-size: 22px;
				font-style: italic;
				color: #0f172a;
			}

			@media (max-width: 767px) {
				.g--article-1 h1 {
					font-size: 32px;
				}

				.g--article-1-body {
					font-size: 17px;
				}
			}
		</style>
	`
};
