export default {
	id: 'contact-1',
	label: 'Contact — Form',
	description: 'Contact details next to a message form',
	category: 'Contact',
	content: `
		<section class="g--contact-1" id="contact">
			<div class="g--contact-1-info">
				<h2>Get in touch</h2>
				<p>Have a question or a project in mind? Send us a message and we will reply within one business day.</p>
				<p><strong>Email</strong><br>hello@example.com</p>
				<p><strong>Phone</strong><br>+1 (555) 010-2030</p>
			</div>
			<form class="g--contact-1-form" action="#" method="post">
				<label>Name<input type="text" name="name" placeholder="Your name" /></label>
				<label>Email<input type="email" name="email" placeholder="you@example.com" /></label>
				<label>Message<textarea name="message" rows="5" placeholder="How can we help?"></textarea></label>
				<button type="submit">Send message</button>
			</form>
		</section>
		<style>
			.g--contact-1 {
				display: grid;
				grid-template-columns: 1fr 1.2fr;
				gap: 56px;
				max-width: 1100px;
				margin: 0 auto;
				padding: 80px 24px;
			}

			.g--contact-1-info h2 {
				margin: 0 0 16px;
				font-size: 34px;
				color: #0f172a;
			}

			.g--contact-1-info p {
				color: #475569;
			}

			.g--contact-1-form {
				display: flex;
				flex-direction: column;
				gap: 16px;
				padding: 32px;
				border-radius: 16px;
				background: #f8fafc;
			}

			.g--contact-1-form label {
				display: flex;
				flex-direction: column;
				gap: 6px;
				font-size: 14px;
				font-weight: 600;
				color: #334155;
			}

			.g--contact-1-form input,
			.g--contact-1-form textarea {
				padding: 12px 14px;
				border: 1px solid #cbd5e1;
				border-radius: 8px;
				font: inherit;
				font-weight: 400;
				background: #fff;
			}

			.g--contact-1-form button {
				padding: 14px;
				border: 0;
				border-radius: 8px;
				background: #2563eb;
				color: #fff;
				font: inherit;
				font-weight: 600;
				cursor: pointer;
			}

			@media (max-width: 900px) {
				.g--contact-1 {
					grid-template-columns: 1fr;
					gap: 32px;
				}
			}
		</style>
	`
};
