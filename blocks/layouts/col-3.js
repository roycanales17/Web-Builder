export default {
	id: 'layout-3-columns',
	label: '3 Columns (Responsive)',
	thumbnail: '<i class="fas fa-columns" style="font-size: 32px; color: #333; display: block; text-align: center; margin: 0 auto;"></i>',
	content: `
		<div class="grape--layout-3-columns">
			<div>Column 1</div>
			<div>Column 2</div>
			<div>Column 3</div>
		</div>
		<style>
			.grape--layout-3-columns {
				display: flex;
				flex-direction: column;
				gap: 1rem;
			}
			@media (min-width: 640px) {
				.grape--layout-3-columns {
					flex-direction: row;
				}
			}
			.grape--layout-3-columns > div {
				flex: 1;
				padding: 1rem;
				border: 1px dashed #ccc;
				text-align: center;
				background: #f9f9f9;
			}
		</style>
	`,
	category: 'Layouts'
};