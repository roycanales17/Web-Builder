export default {
	id: 'pricing-1',
	label: 'Pricing — Three Tiers',
	description: 'Three plans with a highlighted favourite',
	category: 'Pricing',
	content: `
		<section class="g--pricing-1" id="pricing">
			<h2>Simple, transparent pricing</h2>
			<p class="g--pricing-1-lead">No hidden fees. Cancel anytime.</p>
			<div class="g--pricing-1-plans">
				<div class="g--pricing-1-plan">
					<h3>Starter</h3>
					<p class="g--pricing-1-price">$9<span>/month</span></p>
					<ul>
						<li>1 website</li>
						<li>5 pages</li>
						<li>Email support</li>
					</ul>
					<a class="g--pricing-1-button" href="#contact">Choose Starter</a>
				</div>
				<div class="g--pricing-1-plan g--pricing-1-featured">
					<p class="g--pricing-1-badge">Most popular</p>
					<h3>Pro</h3>
					<p class="g--pricing-1-price">$29<span>/month</span></p>
					<ul>
						<li>5 websites</li>
						<li>Unlimited pages</li>
						<li>Priority support</li>
					</ul>
					<a class="g--pricing-1-button" href="#contact">Choose Pro</a>
				</div>
				<div class="g--pricing-1-plan">
					<h3>Agency</h3>
					<p class="g--pricing-1-price">$79<span>/month</span></p>
					<ul>
						<li>Unlimited websites</li>
						<li>Client handoff</li>
						<li>Dedicated manager</li>
					</ul>
					<a class="g--pricing-1-button" href="#contact">Choose Agency</a>
				</div>
			</div>
		</section>
		<style>
			.g--pricing-1 {
				padding: 80px 24px;
				text-align: center;
			}

			.g--pricing-1 h2 {
				margin: 0 0 8px;
				font-size: 36px;
				color: #0f172a;
			}

			.g--pricing-1-lead {
				margin: 0 0 48px;
				color: #64748b;
			}

			.g--pricing-1-plans {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 24px;
				max-width: 1000px;
				margin: 0 auto;
				align-items: stretch;
			}

			.g--pricing-1-plan {
				display: flex;
				flex-direction: column;
				padding: 32px;
				border: 1px solid #e2e8f0;
				border-radius: 16px;
				background: #fff;
				text-align: left;
			}

			.g--pricing-1-featured {
				border: 2px solid #2563eb;
				box-shadow: 0 12px 32px rgba(37, 99, 235, .15);
			}

			.g--pricing-1-badge {
				align-self: flex-start;
				margin: 0 0 12px;
				padding: 4px 10px;
				border-radius: 999px;
				background: #eff6ff;
				color: #2563eb;
				font-size: 12px;
				font-weight: 600;
			}

			.g--pricing-1-plan h3 {
				margin: 0;
				font-size: 18px;
				color: #334155;
			}

			.g--pricing-1-price {
				margin: 12px 0 20px;
				font-size: 40px;
				font-weight: 700;
				color: #0f172a;
			}

			.g--pricing-1-price span {
				font-size: 15px;
				font-weight: 400;
				color: #64748b;
			}

			.g--pricing-1-plan ul {
				flex: 1;
				margin: 0 0 24px;
				padding-left: 18px;
				color: #475569;
			}

			.g--pricing-1-plan li {
				padding: 4px 0;
			}

			.g--pricing-1-button {
				display: block;
				padding: 12px;
				border-radius: 10px;
				background: #0f172a;
				color: #fff;
				text-align: center;
				text-decoration: none;
				font-weight: 600;
			}

			.g--pricing-1-featured .g--pricing-1-button {
				background: #2563eb;
			}

			@media (max-width: 900px) {
				.g--pricing-1-plans {
					grid-template-columns: 1fr;
					max-width: 420px;
				}
			}
		</style>
	`
};
