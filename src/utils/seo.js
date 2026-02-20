// Set meta tags for SEO
export const setMetaTags = (title, description, keywords, image, url, type = 'website') => {
    // Title
    document.title = `${title} | Sitaram Ayurveda`;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name="twitter:"]');
    existingMetas.forEach(meta => meta.remove());

    // Meta description
    const descMeta = document.createElement('meta');
    descMeta.name = 'description';
    descMeta.content = description;
    document.head.appendChild(descMeta);

    // Keywords
    if (keywords) {
        const keywordsMeta = document.createElement('meta');
        keywordsMeta.name = 'keywords';
        keywordsMeta.content = keywords;
        document.head.appendChild(keywordsMeta);
    }

    // Open Graph tags
    const ogTags = [
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: type },
        { property: 'og:image', content: image || 'https://sitaramayurveda.com/og-image.jpg' },
        { property: 'og:url', content: url || window.location.href },
    ];

    ogTags.forEach(({ property, content }) => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
    });

    // Twitter Card tags
    const twitterTags = [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image || 'https://sitaramayurveda.com/og-image.jpg' },
    ];

    twitterTags.forEach(({ name, content }) => {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
    });
};

// Generate structured data for JSON-LD
export const generateStructuredData = (type, data) => {
    let structuredData = {};

    switch (type) {
        case 'product':
            structuredData = {
                '@context': 'https://schema.org/',
                '@type': 'Product',
                name: data.name,
                description: data.description,
                image: data.image,
                brand: {
                    '@type': 'Brand',
                    name: 'Sitaram Ayurveda',
                },
                offers: {
                    '@type': 'Offer',
                    url: data.url,
                    priceCurrency: 'INR',
                    price: data.price,
                    availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: data.rating || 4,
                    reviewCount: data.reviews || 0,
                },
            };
            break;

        case 'organization':
            structuredData = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Sitaram Ayurveda',
                url: 'https://sitaramayurveda.com',
                logo: 'https://sitaramayurveda.com/logo.png',
                description: 'Authentic Ayurvedic products and wellness solutions',
                sameAs: [
                    'https://facebook.com/sitaramayurveda',
                    'https://instagram.com/sitaramayurveda',
                    'https://twitter.com/sitaramayurveda',
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'Customer Support',
                    telephone: '+91-XXXXXXXXXX',
                    email: 'support@sitaramayurveda.com',
                },
            };
            break;

        case 'breadcrumb':
            structuredData = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: data.items.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    item: item.url,
                })),
            };
            break;

        case 'faq':
            structuredData = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: data.faqs.map(faq => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                    },
                })),
            };
            break;

        default:
            break;
    }

    return structuredData;
};

// Inject JSON-LD script
export const injectStructuredData = (structuredData) => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Create and inject new script
    if (structuredData && Object.keys(structuredData).length > 0) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
};

// SEO helper hook
export const useSEO = (title, description, keywords, image, url, structuredData = null) => {
    setMetaTags(title, description, keywords, image, url);
    if (structuredData) {
        injectStructuredData(structuredData);
    }
};

export default {
    setMetaTags,
    generateStructuredData,
    injectStructuredData,
    useSEO,
};
