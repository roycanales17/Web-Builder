export default {
	id: 'layout-sidebar',
	label: 'Sidebar + Content',
	description: 'Narrow sidebar next to a wide main column',
	category: 'Layouts',
	content: `
		<div class="g--layout-sidebar">
			<aside class="g--layout-sidebar-aside" data-dropzone></aside>
			<main class="g--layout-sidebar-main" data-dropzone></main>
		</div>
		<style>
			.g--layout-sidebar {
				display: grid;
				grid-template-columns: minmax(200px, 1fr) 3fr;
				gap: 32px;
				padding: 24px;
			}

			@media (max-width: 767px) {
				.g--layout-sidebar {
					grid-template-columns: 1fr;
				}
			}
		</style>
	`
};
