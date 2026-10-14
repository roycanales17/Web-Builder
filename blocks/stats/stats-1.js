export default {
	id: 'stats-1',
	label: 'Stats — Numbers Row',
	description: 'Four key numbers with labels',
	category: 'Features',
	content: `
		<section class="g--stats-1">
			<div><strong>12k+</strong><span>Happy customers</span></div>
			<div><strong>98%</strong><span>Satisfaction rate</span></div>
			<div><strong>24/7</strong><span>Support</span></div>
			<div><strong>50+</strong><span>Countries</span></div>
		</section>
		<style>
			.g--stats-1 {
				display: grid;
				grid-template-columns: repeat(4, minmax(0, 1fr));
				gap: 24px;
				padding: 56px 24px;
				background: #2563eb;
				color: #dbeafe;
				text-align: center;
			}

			.g--stats-1 strong {
				display: block;
				font-size: 40px;
				line-height: 1.1;
				color: #fff;
			}

			@media (max-width: 767px) {
				.g--stats-1 {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
		</style>
	`
};
