export default {
	id: 'contact-info-1',
	label: 'Contact — Info Cards',
	description: 'Address, phone, email and opening hours',
	category: 'Contact',
	content: `
		<section class="g--contact-info-1">
			<div>
				<span>📍</span>
				<h3>Visit us</h3>
				<p>123 Market Street<br>San Francisco, CA</p>
			</div>
			<div>
				<span>📞</span>
				<h3>Call us</h3>
				<p><a href="tel:+15550102030">+1 (555) 010-2030</a></p>
			</div>
			<div>
				<span>✉️</span>
				<h3>Email us</h3>
				<p><a href="mailto:hello@example.com">hello@example.com</a></p>
			</div>
			<div>
				<span>🕘</span>
				<h3>Opening hours</h3>
				<p>Mon – Fri<br>9:00 – 18:00</p>
			</div>
		</section>
		<style>
			.g--contact-info-1 {
				display: grid;
				grid-template-columns: repeat(4, minmax(0, 1fr));
				gap: 20px;
				max-width: 1100px;
				margin: 0 auto;
				padding: 64px 24px 0;
			}

			.g--contact-info-1 > div {
				padding: 24px;
				border-radius: 16px;
				background: #f8fafc;
				text-align: center;
			}

			.g--contact-info-1 span {
				font-size: 28px;
			}

			.g--contact-info-1 h3 {
				margin: 8px 0 6px;
				font-size: 17px;
				color: #0f172a;
			}

			.g--contact-info-1 p {
				margin: 0;
				color: #64748b;
			}

			.g--contact-info-1 a {
				color: #2563eb;
				text-decoration: none;
			}

			@media (max-width: 900px) {
				.g--contact-info-1 {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}

			@media (max-width: 480px) {
				.g--contact-info-1 {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
