/**
 * Page templates: whole pages built from section templates (blocks/components.js).
 *
 * Shown in the "New page" dialog and under Components → Pages.
 * { id, label, description, name (suggested page name), sections: [section ids],
 *   hideInNav? (keep the page out of generated menus) }
 *
 * All pages share the same navbar and footer, so a site built from them looks
 * consistent. Navbars link to every page automatically; {{page}} in a section
 * becomes the page's name.
 */
export const pageTemplates = [
	{
		id: 'blank',
		label: 'Blank page',
		description: 'Start from an empty canvas',
		name: 'New page',
		sections: [],
	},
	{
		id: 'landing',
		label: 'Landing page',
		description: 'Product homepage: hero, features, pricing, testimonials',
		name: 'Home',
		sections: ['navbar-2', 'banner-6', 'logos-1', 'features-1', 'steps-1', 'stats-1', 'pricing-1', 'testimonials-1', 'faq-1', 'cta-1', 'footer-1'],
	},
	{
		id: 'about',
		label: 'About',
		description: 'Story, timeline, team and numbers',
		name: 'About',
		sections: ['navbar-2', 'page-header-1', 'features-2', 'timeline-1', 'team-1', 'stats-1', 'cta-1', 'footer-1'],
	},
	{
		id: 'services',
		label: 'Services',
		description: 'What you offer and how it works',
		name: 'Services',
		sections: ['navbar-2', 'page-header-1', 'services-1', 'steps-1', 'testimonials-1', 'cta-1', 'footer-1'],
	},
	{
		id: 'pricing',
		label: 'Pricing',
		description: 'Plans, questions and a final call to action',
		name: 'Pricing',
		sections: ['navbar-2', 'page-header-1', 'pricing-1', 'logos-1', 'faq-1', 'cta-1', 'footer-1'],
	},
	{
		id: 'portfolio',
		label: 'Portfolio',
		description: 'Showcase projects and photos',
		name: 'Portfolio',
		sections: ['navbar-2', 'page-header-2', 'portfolio-1', 'gallery-1', 'testimonials-1', 'cta-1', 'footer-1'],
	},
	{
		id: 'blog',
		label: 'Blog',
		description: 'Article list with newsletter signup',
		name: 'Blog',
		sections: ['navbar-2', 'page-header-1', 'blog-1', 'newsletter-1', 'footer-1'],
	},
	{
		id: 'blog-post',
		label: 'Blog post',
		description: 'A single long-form article',
		name: 'Blog post',
		sections: ['navbar-2', 'article-1', 'newsletter-1', 'footer-1'],
	},
	{
		id: 'contact',
		label: 'Contact',
		description: 'Contact details, form and FAQ',
		name: 'Contact',
		sections: ['navbar-2', 'page-header-1', 'contact-info-1', 'contact-1', 'faq-1', 'footer-1'],
	},
	{
		id: 'personal',
		label: 'Personal / Resume',
		description: 'Portfolio homepage for a freelancer',
		name: 'Home',
		sections: ['navbar-1', 'banner-4', 'services-1', 'portfolio-1', 'testimonials-1', 'contact-1', 'footer-2'],
	},
	{
		id: 'not-found',
		label: '404 page',
		description: 'Friendly "page not found" error',
		name: '404',
		hideInNav: true,
		sections: ['navbar-2', 'notfound-1', 'footer-2'],
	},
];

export default pageTemplates;
