export default {
	id: 'newsletter-1',
	label: 'Newsletter — Signup',
	description: 'Email signup with a short pitch',
	category: 'Call to Action',
	content: `
		<section class="g--newsletter-1">
			<div class="g--newsletter-1-box">
				<div>
					<h2>Get new articles in your inbox</h2>
					<p>One email a month. No spam, unsubscribe anytime.</p>
				</div>
				<form class="g--newsletter-1-form" action="#" method="post">
					<input type="email" name="email" placeholder="you@example.com" aria-label="Email address" />
					<button type="submit">Subscribe</button>
				</form>
			</div>
		</section>
		<style>
			.g--newsletter-1 {
				padding: 64px 24px;
			}

			.g--newsletter-1-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-wrap: wrap;
				gap: 24px;
				max-width: 1000px;
				margin: 0 auto;
				padding: 40px;
				border-radius: 20px;
				background: #eff6ff;
			}

			.g--newsletter-1 h2 {
				margin: 0 0 6px;
				font-size: 26px;
				color: #0f172a;
			}

			.g--newsletter-1 p {
				margin: 0;
				color: #475569;
			}

			.g--newsletter-1-form {
				display: flex;
				gap: 8px;
				flex: 1;
				max-width: 420px;
				min-width: 260px;
			}

			.g--newsletter-1-form input {
				flex: 1;
				min-width: 0;
				padding: 12px 14px;
				border: 1px solid #bfdbfe;
				border-radius: 10px;
				font: inherit;
				background: #fff;
			}

			.g--newsletter-1-form button {
				padding: 12px 20px;
				border: 0;
				border-radius: 10px;
				background: #2563eb;
				color: #fff;
				font: inherit;
				font-weight: 600;
				cursor: pointer;
			}

			@media (max-width: 575px) {
				.g--newsletter-1-box {
					padding: 28px 20px;
				}

				.g--newsletter-1-form {
					flex-direction: column;
				}
			}
		</style>
	`
};
