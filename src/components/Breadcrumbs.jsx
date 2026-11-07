import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Breadcrumbs Component (Prompt 05 Deliverable)
 * 
 * Features:
 * - WCAG 2.2 AA compliant semantic <nav aria-label="Breadcrumb">
 * - Structured JSON-LD BreadcrumbList schema dynamically injected into head
 * - Adheres strictly to brand color tokens (Primary #053807, Secondary #D4AF37)
 * - Mobile responsive with horizontal scroll / wrapping
 */
const Breadcrumbs = ({ items = [] }) => {
    // Generate JSON-LD BreadcrumbList for SEO
    useEffect(() => {
        if (!items || items.length === 0) return;

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': typeof window !== 'undefined' ? window.location.origin : 'https://www.hridved.in'
                },
                ...items.map((item, index) => ({
                    '@type': 'ListItem',
                    'position': index + 2,
                    'name': item.label,
                    ...(item.path ? { 'item': `${typeof window !== 'undefined' ? window.location.origin : 'https://www.hridved.in'}${item.path}` } : {})
                }))
            ]
        };

        let script = document.getElementById('json-ld-breadcrumbs');
        if (!script) {
            script = document.createElement('script');
            script.id = 'json-ld-breadcrumbs';
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);

        return () => {
            const el = document.getElementById('json-ld-breadcrumbs');
            if (el) el.remove();
        };
    }, [items]);

    return (
        <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-0">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs text-gray-500 font-medium">
                <li className="flex items-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded"
                        aria-label="Home"
                    >
                        <Home size={13} className="text-secondary" />
                        <span className="sr-only sm:not-sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="flex items-center gap-1.5">
                            <ChevronRight size={12} className="text-gray-400 shrink-0" aria-hidden="true" />
                            {isLast || !item.path ? (
                                <span 
                                    className="font-bold text-primary truncate max-w-[200px] sm:max-w-xs" 
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link 
                                    to={item.path} 
                                    className="text-gray-600 hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-xs focus:outline-none focus:ring-1 focus:ring-primary rounded"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;

