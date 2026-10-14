export default {
	id: 'features-2',
	label: 'About — Image + Text',
	description: 'Photo beside a heading, text and checklist',
	category: 'Features',
	content: `
		<section class="g--features-2" id="about">
			<div class="g--features-2-media">
				<img src="{{assets}}banners/banner-2.jpg" alt="Northern lights over a lake" />
			</div>
			<div class="g--features-2-body">
				<h2>Built by people who care about details</h2>
				<p>We have spent the last ten years helping teams turn ideas into products customers love. Here is what you can expect from us.</p>
				<ul>
					<li>Clear communication from day one</li>
					<li>Design and development under one roof</li>
					<li>Support long after launch</li>
				</ul>
				<a class="g--features-2-link" href="#contact">Work with us →</a>
			</div>
		</section>
		<style>
			.g--features-2 {
				display: grid;
				grid-template-columns: 1fr 1fr;
				align-items: center;
				gap: 56px;
				max-width: 1100px;
				margin: 0 auto;
				padding: 80px 24px;
			}

			.g--features-2-media img {
				display: block;
				width: 100%;
				aspect-ratio: 4 / 3;
				object-fit: cover;
				border-radius: 20px;
			}

			.g--features-2-body h2 {
				margin: 0 0 16px;
				font-size: 34px;
				line-height: 1.2;
				color: #0f172a;
			}

			.g--features-2-body p {
				margin: 0 0 20px;
				color: #475569;
			}

			.g--features-2-body ul {
				margin: 0 0 28px;
				padding: 0;
				list-style: none;
			}

			.g--features-2-body li {
				padding: 6px 0 6px 28px;
				position: relative;
				color: #334155;
			}

			.g--features-2-body li::before {
				content: "✓";
				position: absolute;
				left: 0;
				color: #16a34a;
				font-weight: 700;
			}

			.g--features-2-link {
				color: #2563eb;
				font-weight: 600;
				text-decoration: none;
			}

			@media (max-width: 900px) {
				.g--features-2 {
					grid-template-columns: 1fr;
					gap: 32px;
				}
			}
		</style>
	`
};
