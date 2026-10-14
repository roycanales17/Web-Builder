/**
 * Template library shown in the "Components" tab.
 *
 * To add a template, create a file that default-exports
 * { id, label, category, description?, content } and list it below.
 *  - id:        unique id; prefix your CSS classes with `g--<id>` so templates never clash
 *  - content:   HTML, optionally followed by a <style> block
 *  - {{assets}} is replaced with the URL of blocks/resources/ (bundled into exports)
 *  - {{page}} is replaced with the name of the page the template is added to
 *  - {{nav}} becomes links to every page; put it in an element with `data-nav`
 *    to keep that menu in sync when pages are added, renamed or removed
 *  - elements marked with `data-dropzone` accept other blocks dropped inside them
 */
import layoutCol2 from './layouts/col-2.js';
import layoutCol3 from './layouts/col-3.js';
import layoutSidebar from './layouts/sidebar.js';
import navbar1 from './navbars/navbar-1.js';
import navbar2 from './navbars/navbar-2.js';
import banner1 from './banners/banner-1.js';
import banner2 from './banners/banner-2.js';
import banner3 from './banners/banner-3.js';
import banner4 from './banners/banner-4.js';
import banner5 from './banners/banner-5.js';
import banner6 from './banners/banner-6.js';
import pageHeader1 from './headers/page-header-1.js';
import pageHeader2 from './headers/page-header-2.js';
import logos1 from './social/logos-1.js';
import steps1 from './features/steps-1.js';
import services1 from './services/services-1.js';
import timeline1 from './about/timeline-1.js';
import blog1 from './blog/blog-1.js';
import article1 from './blog/article-1.js';
import newsletter1 from './cta/newsletter-1.js';
import portfolio1 from './gallery/portfolio-1.js';
import contactInfo1 from './contact/contact-info-1.js';
import notFound1 from './misc/notfound-1.js';
import features1 from './features/features-1.js';
import features2 from './features/features-2.js';
import stats1 from './stats/stats-1.js';
import pricing1 from './pricing/pricing-1.js';
import testimonials1 from './testimonials/testimonials-1.js';
import team1 from './team/team-1.js';
import gallery1 from './gallery/gallery-1.js';
import faq1 from './faq/faq-1.js';
import cta1 from './cta/cta-1.js';
import contact1 from './contact/contact-1.js';
import footer1 from './footers/footer-1.js';
import footer2 from './footers/footer-2.js';

export const templates = [
	navbar1,
	navbar2,
	banner6,
	banner1,
	banner2,
	banner3,
	banner4,
	banner5,
	pageHeader1,
	pageHeader2,
	logos1,
	features1,
	features2,
	steps1,
	stats1,
	services1,
	pricing1,
	testimonials1,
	team1,
	timeline1,
	portfolio1,
	gallery1,
	blog1,
	article1,
	faq1,
	cta1,
	newsletter1,
	contactInfo1,
	contact1,
	notFound1,
	footer1,
	footer2,
	layoutCol2,
	layoutCol3,
	layoutSidebar,
];

export default templates;
