export default {
	id: 'logos-1',
	label: 'Logo Strip — Trusted By',
	description: 'Row of customer names under a short label',
	category: 'Social Proof',
	content: `
		<section class="g--logos-1">
			<p>Trusted by fast-growing teams</p>
			<div class="g--logos-1-row">
				<span>◆ Northwind</span>
				<span>● Brightside</span>
				<span>▲ Kite Studio</span>
				<span>■ Lumen</span>
				<span>✦ Orbit</span>
			</div>
		</section>
		<style>
			.g--logos-1 {
				padding: 48px 24px;
				text-align: center;
				border-bottom: 1px solid #f1f5f9;
			}

			.g--logos-1 p {
				margin: 0 0 24px;
				color: #94a3b8;
				font-size: 14px;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 1px;
			}

			.g--logos-1-row {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
				gap: 24px 56px;
			}

			.g--logos-1-row span {
				font-size: 22px;
				font-weight: 700;
				color: #64748b;
			}
		</style>
	`
};
