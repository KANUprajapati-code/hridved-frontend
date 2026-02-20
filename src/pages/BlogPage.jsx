import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Clock, User, ChevronLeft } from 'lucide-react';
import api from '../utils/api';
import { setMetaTagsForPage, createBlogListingStructuredData } from '../utils/seoUtils';

const BlogPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [filter, setFilter] = useState(searchParams.get('category') || 'All');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/blogs/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/blogs?page=${currentPage}&limit=12`;

            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }

            if (filter && filter !== 'All') {
                url += `&category=${encodeURIComponent(filter)}`;
            }

            const { data } = await api.get(url);
            setBlogs(data.blogs);
            setPagination(data.pagination);

            // Set structured data for blog listing
            if (data.blogs.length > 0) {
                createBlogListingStructuredData(data.blogs, data.pagination.currentPage, data.pagination.totalPages);
            }

            // Update URL params
            const params = new URLSearchParams();
            if (filter !== 'All') params.set('category', filter);
            if (searchQuery) params.set('search', searchQuery);
            if (currentPage > 1) params.set('page', currentPage);
            setSearchParams(params);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filter, searchQuery, setSearchParams]);

    useEffect(() => {
        // Set SEO meta tags for blog listing page
        setMetaTagsForPage(
            'AyurVeda Wellness Blog - Expert Insights on Health & Wellness',
            'Discover expert insights on Ayurveda, wellness, yoga, nutrition, and traditional healing. Read our comprehensive blog articles for modern living.',
            'https://via.placeholder.com/1200x630',
            `${window.location.origin}/blogs`
        );
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, filter, searchQuery, fetchBlogs]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (category) => {
        setFilter(category);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilter('All');
        setCurrentPage(1);
    };

    if (loading && !blogs.length) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-primary">AyurVeda Wellness Hub</h1>
                            <p className="text-sm text-gray-500 mt-1">Expert insights on traditional healing for modern living.</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-secondary text-sm"
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => handleCategoryChange('All')}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === 'All'
                                ? 'bg-secondary text-primary font-bold shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary hover:text-primary'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryChange(cat.name)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${filter === cat.name
                                    ? 'bg-secondary text-primary font-bold shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary hover:text-primary'
                                    }`}
                            >
                                {cat.name}
                                {cat.count > 0 && <span className="text-xs">({cat.count})</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* No Results Message */}
                {blogs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">No articles found matching your criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="text-primary font-bold hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Grid Section */}
                {blogs.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {blogs.map((blog) => (
                                <article key={blog._id} className="blog-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group h-full flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary px-2 py-1 rounded text-xs font-bold">
                                            {blog.category}
                                        </span>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                            <Clock size={12} />
                                            <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>{blog.readTime}</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {blog.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                                            {blog.shortDescription}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={blog.authorImage || 'https://via.placeholder.com/150'}
                                                    alt={blog.author}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span className="text-xs font-medium text-gray-600">{blog.author}</span>
                                            </div>
                                            <Link
                                                to={`/blog/${blog.slug}`}
                                                className="text-secondary font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all"
                                            >
                                                Read More <ChevronRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 py-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first, last, current, and adjacent pages
                                        const isVisible =
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - currentPage) <= 1;

                                        if (!isVisible && currentPage > 3 && page === 2) {
                                            return <span key="ellipsis1" className="text-gray-400">...</span>;
                                        }

                                        if (!isVisible && currentPage < pagination.totalPages - 2 && page === pagination.totalPages - 1) {
                                            return <span key="ellipsis2" className="text-gray-400">...</span>;
                                        }

                                        if (!isVisible) return null;

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 rounded-lg transition-all ${currentPage === page
                                                    ? 'bg-primary text-white font-bold'
                                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                <div className="text-sm text-gray-500 ml-4">
                                    Page {currentPage} of {pagination.totalPages} ({pagination.totalBlogs} total)
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Newsletter Section */}
            <div className="bg-primary/5 border-t border-primary/10 mt-16 py-16">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h3 className="text-2xl font-serif font-bold text-primary mb-4">Stay Connected with Ayurveda</h3>
                    <p className="text-gray-600 mb-8">Subscribe for health tips, exclusive offers, and the latest from our experts.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-secondary"
                        />
                        <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
