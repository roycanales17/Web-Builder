import {
	faDesktop,
	faTabletScreenButton,
	faMobileScreenButton,
	faEye,
	faSquare,
	faCode,
	faUpload,
	faChevronUp,
	faPlus,
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
	faChevronUp,
	faPlus
);

// Convert <i> elements to inline SVGs
dom.watch();
