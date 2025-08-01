import {
	faDesktop,
	faTabletScreenButton,
	faMobileScreenButton,
	faEye,
	faSquare,
	faCode,
	faUpload,
	faDownload,
	faChevronUp,
	faPlus,
	faGear,
	faClipboard,
	faFileImport,
	faFileExport,
	faArrowsAlt,
	faHandPointer,
	faGripLines,
	faGripVertical
} from '@fortawesome/free-solid-svg-icons';

import { library, dom } from '@fortawesome/fontawesome-svg-core';

// Add all icons to the library
library.add(
	faDesktop,
	faTabletScreenButton,
	faMobileScreenButton,
	faEye,
	faSquare,
	faCode,
	faUpload,
	faDownload,
	faChevronUp,
	faPlus,
	faGear,
	faClipboard,
	faFileImport,
	faFileExport,
	faArrowsAlt,
	faHandPointer,
	faGripLines,
	faGripVertical
);

// Convert <i> elements to inline SVGs
dom.watch();
