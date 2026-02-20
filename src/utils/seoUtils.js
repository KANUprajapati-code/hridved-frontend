/**
 * SEO Utilities for Blog Management
 * Handles meta tags, structured data, and SEO optimizations
 */

/**
 * Set document title and common meta tags
 */
export const setMetaTagsForPage = (title, description, image, url) => {
    document.title = title || 'AyurVeda Wellness Hub - Blog';

    updateOrCreateMetaTag('description', description, 'name');
    updateOrCreateMetaTag('og:title', title, 'property');
    updateOrCreateMetaTag('og:description', description, 'property');
    if (image) updateOrCreateMetaTag('og:image', image, 'property');
    updateOrCreateMetaTag('og:url', url || window.location.href, 'property');
    updateOrCreateMetaTag('og:type', 'website', 'property');

    updateOrCreateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateOrCreateMetaTag('twitter:title', title, 'name');
    updateOrCreateMetaTag('twitter:description', description, 'name');
    if (image) updateOrCreateMetaTag('twitter:image', image, 'name');

    updateOrCreateMetaTag('viewport', 'width=device-width, initial-scale=1.0', 'name');
    updateOrCreateMetaTag('charset', 'UTF-8', 'charset');
};

/**
 * Set meta tags specifically for blog articles
 */
export const setMetaTagsForBlog = (blog) => {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.shortDescription;

    setMetaTagsForPage(title, description, blog.image, url);

    // Article-specific meta tags
    updateOrCreateMetaTag('article:author', blog.author, 'property');
    updateOrCreateMetaTag('article:published_time', blog.publishedAt || blog.createdAt, 'property');
    updateOrCreateMetaTag('article:modified_time', blog.updatedAt, 'property');
    if (blog.category) {
        updateOrCreateMetaTag('article:section', blog.category, 'property');
    }
    if (blog.tags && blog.tags.length > 0) {
        blog.tags.forEach((tag) => {
            updateOrCreateMetaTag('article:tag', tag, 'property');
        });
    }

    // Canonical URL
    updateOrCreateCanonicalURL(url);
};

/**
 * Create JSON-LD Structured Data for Blog Article
 */
export const createBlogArticleStructuredData = (blog) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.shortDescription,
        image: blog.image,
        datePublished: blog.publishedAt || blog.createdAt,
        dateModified: blog.updatedAt,
        author: {
            '@type': 'Person',
            name: blog.author,
            ...(blog.authorImage && { image: blog.authorImage }),
        },
        ...(blog.category && { articleSection: blog.category }),
        keywords: blog.tags ? blog.tags.join(', ') : '',
        articleBody: blog.content,
        url: `${window.location.origin}/blog/${blog.slug}`,
        readingTime: {
            '@type': 'Duration',
            name: blog.readTime,
        },
    };

    setStructuredData(structuredData);
};

/**
 * Create JSON-LD Structured Data for Blog Listing Page
 */
export const createBlogListingStructuredData = (blogs, currentPage, totalPages) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AyurVeda Wellness Blog',
        description: 'Expert insights on traditional healing and wellness',
        url: window.location.href,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: blogs.map((blog, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'BlogPosting',
                    headline: blog.title,
                    description: blog.shortDescription,
                    image: blog.image,
                    url: `${window.location.origin}/blog/${blog.slug}`,
                    datePublished: blog.publishedAt || blog.createdAt,
                    author: {
                        '@type': 'Person',
                        name: blog.author,
                    },
                },
            })),
        },
    };

    setStructuredData(structuredData);
};

/**
 * Create JSON-LD Structured Data for Organization
 */
export const createOrganizationStructuredData = () => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AyurVeda Wellness Hub',
        url: window.location.origin,
        logo: `${window.location.origin}/logo.png`,
        sameAs: [
            'https://www.facebook.com/ayurveda',
            'https://www.twitter.com/ayurveda',
            'https://www.instagram.com/ayurveda',
        ],
    };

    setStructuredData(structuredData);
};

/**
 * Helper: Update or create meta tag
 */
const updateOrCreateMetaTag = (nameOrProperty, content, type = 'name') => {
    const selector = type === 'charset' ? 'meta[charset]' : `meta[${type}="${nameOrProperty}"]`;
    let tag = document.querySelector(selector);

    if (type === 'charset') {
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('charset', 'UTF-8');
            document.head.appendChild(tag);
        }
        return;
    }

    if (tag) {
        tag.setAttribute('content', content);
    } else {
        tag = document.createElement('meta');
        tag.setAttribute(type, nameOrProperty);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
    }
};

/**
 * Helper: Set canonical URL
 */
const updateOrCreateCanonicalURL = (url) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
        link.setAttribute('href', url);
    } else {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', url);
        document.head.appendChild(link);
    }
};

/**
 * Helper: Set structured data (JSON-LD)
 */
const setStructuredData = (data) => {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (script) {
        script.innerHTML = JSON.stringify(data);
    } else {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.innerHTML = JSON.stringify(data);
        document.head.appendChild(script);
    }
};

/**
 * Generate sitemap URLs for blogs
 */
export const generateBlogSitemapUrl = (blog) => {
    return {
        url: `/blog/${blog.slug}`,
        lastmod: blog.updatedAt || blog.createdAt,
        changefreq: 'weekly',
        priority: 0.8,
    };
};

/**
 * Optimize images for SEO
 */
export const optimizeImageForSEO = (imageUrl, altText, title) => {
    return {
        src: imageUrl,
        alt: altText || 'Blog article image',
        title: title || altText,
        loading: 'lazy',
        decoding: 'async',
    };
};

/**
 * Generate breadcrumb structured data
 */
export const createBreadcrumbStructuredData = (items) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    setStructuredData(structuredData);
};

/**
 * Add robots meta tag
 */
export const setRobotsMeta = (follow = true, index = true) => {
    const content = `${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`;
    updateOrCreateMetaTag('robots', content, 'name');
};

export default {
    setMetaTagsForPage,
    setMetaTagsForBlog,
    createBlogArticleStructuredData,
    createBlogListingStructuredData,
    createOrganizationStructuredData,
    generateBlogSitemapUrl,
    optimizeImageForSEO,
    createBreadcrumbStructuredData,
    setRobotsMeta,
};
