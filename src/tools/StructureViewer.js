export default class StructureViewer
{
	constructor(structureRootId, dropManager) {
		this.dropManager = dropManager;
		this.container = document.getElementById(structureRootId);
		this.skeleton = document.getElementById(`${structureRootId}-skeleton`);

		if (!this.container) {
			console.warn(`StructureViewer: container #${structureRootId} not found`);
		}
	}
}