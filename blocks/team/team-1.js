export default {
	id: 'team-1',
	label: 'Team — Members',
	description: 'Grid of team members with photos and roles',
	category: 'Team',
	content: `
		<section class="g--team-1">
			<h2>Meet the team</h2>
			<p class="g--team-1-lead">The people behind the product.</p>
			<div class="g--team-1-grid">
				<div class="g--team-1-member">
					<img src="{{assets}}extra/person.webp" alt="Alex Rivera" />
					<h3>Alex Rivera</h3>
					<p>Founder &amp; CEO</p>
				</div>
				<div class="g--team-1-member">
					<img src="{{assets}}extra/person.webp" alt="Sam Taylor" />
					<h3>Sam Taylor</h3>
					<p>Lead Designer</p>
				</div>
				<div class="g--team-1-member">
					<img src="{{assets}}extra/person.webp" alt="Jordan Lee" />
					<h3>Jordan Lee</h3>
					<p>Engineering</p>
				</div>
				<div class="g--team-1-member">
					<img src="{{assets}}extra/person.webp" alt="Casey Morgan" />
					<h3>Casey Morgan</h3>
					<p>Customer Success</p>
				</div>
			</div>
		</section>
		<style>
			.g--team-1 {
				padding: 80px 24px;
				text-align: center;
			}

			.g--team-1 h2 {
				margin: 0 0 8px;
				font-size: 34px;
				color: #0f172a;
			}

			.g--team-1-lead {
				margin: 0 0 48px;
				color: #64748b;
			}

			.g--team-1-grid {
				display: grid;
				grid-template-columns: repeat(4, minmax(0, 1fr));
				gap: 32px;
				max-width: 1100px;
				margin: 0 auto;
			}

			.g--team-1-member img {
				width: 140px;
				height: 140px;
				border-radius: 50%;
				object-fit: cover;
				background: #e2e8f0;
			}

			.g--team-1-member h3 {
				margin: 16px 0 4px;
				font-size: 18px;
				color: #0f172a;
			}

			.g--team-1-member p {
				margin: 0;
				color: #64748b;
			}

			@media (max-width: 900px) {
				.g--team-1-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
		</style>
	`
};
