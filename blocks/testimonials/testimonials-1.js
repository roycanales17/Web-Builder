export default {
	id: 'testimonials-1',
	label: 'Testimonials — Quotes',
	description: 'Three customer quotes with names',
	category: 'Social Proof',
	content: `
		<section class="g--testimonials-1">
			<h2>Loved by teams everywhere</h2>
			<div class="g--testimonials-1-grid">
				<figure>
					<blockquote>“We rebuilt our whole marketing site in a weekend. The results speak for themselves.”</blockquote>
					<figcaption><strong>Maria Lopez</strong><span>Head of Marketing, Brightside</span></figcaption>
				</figure>
				<figure>
					<blockquote>“Finally a tool our designers and developers both enjoy using.”</blockquote>
					<figcaption><strong>James Chen</strong><span>CTO, Northwind</span></figcaption>
				</figure>
				<figure>
					<blockquote>“Clean output, no lock-in. Exactly what we were looking for.”</blockquote>
					<figcaption><strong>Aisha Khan</strong><span>Founder, Studio Kite</span></figcaption>
				</figure>
			</div>
		</section>
		<style>
			.g--testimonials-1 {
				padding: 80px 24px;
				background: #0f172a;
				color: #e2e8f0;
				text-align: center;
			}

			.g--testimonials-1 h2 {
				margin: 0 0 48px;
				font-size: 34px;
				color: #fff;
			}

			.g--testimonials-1-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 24px;
				max-width: 1100px;
				margin: 0 auto;
				text-align: left;
			}

			.g--testimonials-1 figure {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				gap: 24px;
				margin: 0;
				padding: 28px;
				border-radius: 16px;
				background: #1e293b;
			}

			.g--testimonials-1 blockquote {
				margin: 0;
				font-size: 17px;
				line-height: 1.6;
			}

			.g--testimonials-1 figcaption strong {
				display: block;
				color: #fff;
			}

			.g--testimonials-1 figcaption span {
				font-size: 14px;
				color: #94a3b8;
			}

			@media (max-width: 900px) {
				.g--testimonials-1-grid {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
