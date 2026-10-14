export default {
	id: 'layout-2-columns',
	label: '2 Columns',
	description: 'Two equal columns, stacked on mobile',
	category: 'Layouts',
	content: `
		<div class="g--layout-2-columns">
			<div class="g--layout-2-columns-col" data-dropzone></div>
			<div class="g--layout-2-columns-col" data-dropzone></div>
		</div>
		<style>
			.g--layout-2-columns {
				display: grid;
				grid-template-columns: repeat(2, minmax(0, 1fr));
				gap: 24px;
				padding: 24px;
			}

			@media (max-width: 767px) {
				.g--layout-2-columns {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
