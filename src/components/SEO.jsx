import { Helmet } from 'react-helmet-async';

/**
 * SEO Component to handle all meta tags
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} canonical - Canonical URL
 * @param {string} ogType - Open Graph type (website, product, article)
 * @param {string} ogImage - Social share image
 * @param {object} product - Optional product data for Schema.org
 */
const SEO = ({ 
    title, 
    description, 
    canonical, 
    ogType = 'website', 
    ogImage,
    product 
}) => {
    const siteName = 'Hridved';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Hridved - Ancient Ayurveda, Modern Wellness. Pure formulations handcrafted with wisdom from ancient texts.';
    const metaDescription = description || defaultDescription;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const canonicalUrl = canonical || url;
    const socialImage = ogImage || '/og-image.jpg'; // Path to your default OG image

    // Schema.org Structured Data for Products
    const schemaOrgJSONLD = product ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.image],
        "description": product.description,
        "sku": product._id,
        "brand": {
            "@type": "Brand",
            "name": siteName
        },
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 5,
            "reviewCount": product.numReviews || 1
        }
    } : null;

    return (
        <Helmet>
            {/* Standard meta tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={socialImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={socialImage} />

            {/* Structured Data */}
            {schemaOrgJSONLD && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaOrgJSONLD)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
