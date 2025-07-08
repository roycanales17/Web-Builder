export default {
	id: 'layout-2-columns',
	label: '2 Columns (Responsive)',
	category: 'Layouts',
	thumbnail: '<i class="fas fa-columns" style="font-size: 32px; color: #333; display: block; text-align: center; margin: 0 auto;"></i>',
	content: `
		<div class="grape---layout-2-columns">
			<div class="grape--col">Column 1</div>
			<div class="grape--col">Column 2</div>
		</div>

		<style>
			.grape---layout-2-columns {
				display: flex;
				flex-direction: column;
				gap: 1rem;
			}

			.grape---layout-2-columns .grape--col {
				padding: 1rem;
				text-align: center;
				background-color: #f9f9f9;
				border: 1px dashed #ccc;
			}

			@media (min-width: 640px) {
				.grape---layout-2-columns {
					flex-direction: row;
				}
				.grape---layout-2-columns .grape--col {
					width: 50%;
				}
			}
		</style>
	`
};
