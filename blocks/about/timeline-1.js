export default {
	id: 'timeline-1',
	label: 'Timeline — Our Story',
	description: 'Company milestones on a vertical timeline',
	category: 'About',
	content: `
		<section class="g--timeline-1">
			<h2>Our story</h2>
			<ol>
				<li>
					<time>2019</time>
					<h3>Founded in a garage</h3>
					<p>Two friends set out to make building websites feel effortless.</p>
				</li>
				<li>
					<time>2021</time>
					<h3>First 1,000 customers</h3>
					<p>Small businesses around the world launched their sites with us.</p>
				</li>
				<li>
					<time>2023</time>
					<h3>Team of 25</h3>
					<p>We grew into a remote team spanning eight countries.</p>
				</li>
				<li>
					<time>2026</time>
					<h3>Version 2.0</h3>
					<p>Multi-page sites, responsive styling and clean code export.</p>
				</li>
			</ol>
		</section>
		<style>
			.g--timeline-1 {
				max-width: 760px;
				margin: 0 auto;
				padding: 80px 24px;
			}

			.g--timeline-1 h2 {
				margin: 0 0 40px;
				font-size: 34px;
				text-align: center;
				color: #0f172a;
			}

			.g--timeline-1 ol {
				margin: 0;
				padding: 0 0 0 32px;
				list-style: none;
				border-left: 2px solid #e2e8f0;
			}

			.g--timeline-1 li {
				position: relative;
				padding-bottom: 36px;
			}

			.g--timeline-1 li::before {
				content: "";
				position: absolute;
				left: -41px;
				top: 4px;
				width: 16px;
				height: 16px;
				border-radius: 50%;
				background: #2563eb;
				box-shadow: 0 0 0 4px #dbeafe;
			}

			.g--timeline-1 time {
				color: #2563eb;
				font-weight: 700;
			}

			.g--timeline-1 h3 {
				margin: 4px 0;
				font-size: 19px;
				color: #0f172a;
			}

			.g--timeline-1 p {
				margin: 0;
				color: #64748b;
			}
		</style>
	`
};
