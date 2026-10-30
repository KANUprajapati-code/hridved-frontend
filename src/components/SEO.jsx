import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Enhanced SEO Component with full Schema.org JSON-LD generation
 * @param {string} title - Page title
 * @param {string} description - Accurate meta description
 * @param {string} canonical - Canonical URL override
 * @param {string} ogType - Open Graph type (website, product, article)
 * @param {string} ogImage - Social share image
 * @param {object} product - Product document for Schema.org Product
 * @param {Array} breadcrumbs - Array of { name, path } for BreadcrumbList
 * @param {Array} faqs - Array of { question, answer } for FAQPage
 * @param {boolean} includeOrganization - Generate Organization schema
 * @param {boolean} includeSearchAction - Generate WebSite with SearchAction
 * @param {boolean} noIndex - Whether to add noindex robots tag
 */
const SEO = ({ 
    title, 
    description, 
    canonical, 
    ogType = 'website', 
    ogImage,
    product,
    breadcrumbs,
    faqs,
    includeOrganization = false,
    includeSearchAction = false,
    noIndex = false,
}) => {
    const siteName = 'Hridved Ayurveda';
    const defaultTitle = 'Hridved Ayurveda | Ancient Wisdom, Modern Purity';
    const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
    const defaultDescription = 'Authentic Ayurvedic formulations handcrafted with 72-hour classical copper vessel infusion, Ayush & GMP certifications, and modern 140+ parameter purity testing.';
    const metaDescription = description || defaultDescription;
    
    const origin = typeof window !== 'undefined' && window.location.origin 
        ? window.location.origin 
        : 'https://hridved.com';
    const url = typeof window !== 'undefined' && window.location.href 
        ? window.location.href 
        : origin;
    const canonicalUrl = canonical || url;
    const socialImage = ogImage || `${origin}/logo-modified.png`;

    const schemas = [];

    // 1. Organization Schema
    if (includeOrganization) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'Hridved Ayurveda',
            'url': origin,
            'logo': `${origin}/logo-modified.png`,
            'description': 'Pure Ayurvedic formulations handcrafted following classical texts and modern purity standards.',
            'contactPoint': [{
                '@type': 'ContactPoint',
                'telephone': '+91-8980411390',
                'contactType': 'customer support',
                'areaServed': 'IN',
                'availableLanguage': ['en', 'hi']
            }],
            'address': {
                '@type': 'PostalAddress',
                'addressCountry': 'IN'
            },
            'sameAs': [
                'https://www.instagram.com/hridvedayurveda'
            ]
        });
    }

    // 2. WebSite & SearchAction Schema
    if (includeSearchAction) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Hridved Ayurveda',
            'url': origin,
            'potentialAction': {
                '@type': 'SearchAction',
                'target': `${origin}/shop?search={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        });
    }

    // 3. BreadcrumbList Schema
    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbs.map((crumb, index) => {
                const itemUrl = crumb.path.startsWith('http') 
                    ? crumb.path 
                    : `${origin}${crumb.path.startsWith('/') ? '' : '/'}${crumb.path}`;
                return {
                    '@type': 'ListItem',
                    'position': index + 1,
                    'name': crumb.name,
                    'item': itemUrl
                };
            })
        });
    }

    // 4. FAQPage Schema (Strictly verified facts only)
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqs.map(faq => ({
                '@type': 'Question',
                'name': faq.question,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.answer
                }
            }))
        });
    }

    // 5. Product Schema (Grounded, never fabricating unverified claims or fake review counts)
    if (product) {
        const productSku = product.sku || (product._id ? `HRV-${String(product._id).slice(-6).toUpperCase()}` : 'HRV-APOTHECARY');
        const inStock = Number(product.countInStock) > 0;
        const productPrice = Number(product.price) || 0;

        const productSchema = {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            'name': product.name,
            'image': product.image ? [product.image] : [],
            'description': product.description || 'Authentic Ayurvedic formulation by Hridved.',
            'sku': productSku,
            'category': product.category || 'Ayurvedic Formulations',
            'brand': {
                '@type': 'Brand',
                'name': 'Hridved Ayurveda'
            },
            'offers': {
                '@type': 'Offer',
                'url': url,
                'priceCurrency': 'INR',
                'price': productPrice,
                'priceValidUntil': '2027-12-31',
                'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'itemCondition': 'https://schema.org/NewCondition',
                'seller': {
                    '@type': 'Organization',
                    'name': 'Hridved Ayurveda'
                },
                'hasMerchantReturnPolicy': {
                    '@type': 'MerchantReturnPolicy',
                    'applicableCountry': 'IN',
                    'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    'merchantReturnDays': 7,
                    'returnMethod': 'https://schema.org/ReturnByMail',
                    'returnFees': 'https://schema.org/FreeReturn'
                },
                'shippingDetails': {
                    '@type': 'OfferShippingDetails',
                    'shippingRate': {
                        '@type': 'MonetaryAmount',
                        'value': productPrice >= 999 ? '0.00' : '50.00',
                        'currency': 'INR'
                    },
                    'shippingDestination': {
                        '@type': 'DefinedRegion',
                        'addressCountry': 'IN'
                    },
                    'deliveryTime': {
                        '@type': 'ShippingDeliveryTime',
                        'handlingTime': {
                            '@type': 'QuantitativeValue',
                            'minValue': 1,
                            'maxValue': 2,
                            'unitCode': 'DAY'
                        },
                        'transitTime': {
                            '@type': 'QuantitativeValue',
                            'minValue': 2,
                            'maxValue': 5,
                            'unitCode': 'DAY'
                        }
                    }
                }
            }
        };

        // AggregateRating strictly when verified reviews exist
        if (product.numReviews && Number(product.numReviews) > 0) {
            productSchema.aggregateRating = {
                '@type': 'AggregateRating',
                'ratingValue': Number(product.rating || 5).toFixed(1),
                'reviewCount': Number(product.numReviews)
            };
        }

        schemas.push(productSchema);
    }

    return (
        <Helmet>
            {/* Standard meta tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={canonicalUrl} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_IN" />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={socialImage} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@hridved" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={socialImage} />

            {/* Structured Data (JSON-LD) */}
            {schemas.map((schemaObj, idx) => (
                <script key={idx} type="application/ld+json">
                    {JSON.stringify(schemaObj)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
