export default {
	id: 'layout-3-columns',
	label: '3 Columns',
	description: 'Three equal columns, stacked on mobile',
	category: 'Layouts',
	content: `
		<div class="g--layout-3-columns">
			<div class="g--layout-3-columns-col" data-dropzone></div>
			<div class="g--layout-3-columns-col" data-dropzone></div>
			<div class="g--layout-3-columns-col" data-dropzone></div>
		</div>
		<style>
			.g--layout-3-columns {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 24px;
				padding: 24px;
			}

			@media (max-width: 900px) {
				.g--layout-3-columns {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
