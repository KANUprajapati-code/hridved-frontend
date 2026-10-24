import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Clock, User, Eye, Calendar } from 'lucide-react';
import api from '../utils/api';
import { setMetaTagsForBlog, createBlogArticleStructuredData } from '../utils/seoUtils';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/blogs/${slug}`);
                setBlog(data);

                // Set SEO meta tags and structured data
                setMetaTagsForBlog(data);
                createBlogArticleStructuredData(data);

                // Fetch related blogs
                const { data: related } = await api.get(`/blogs/${data._id}/related?limit=3`);
                setRelatedBlogs(related);
            } catch (error) {
                console.error('Error fetching blog:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    const handleShare = (platform) => {
        const url = window.location.href;
        const title = encodeURIComponent(blog?.title || 'Check out this article');
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, 'share', 'width=600,height=400');
        setShowShareMenu(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading blog...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog not found</h1>
                <Link to="/blogs" className="text-primary font-bold hover:underline">
                    Back to blogs
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <Link to="/blogs" className="inline-flex items-center text-primary hover:text-opacity-80 mb-6 transition-colors font-bold text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Articles
                    </Link>
                </div>

                {/* Featured Image */}
                <div className="w-full h-96 overflow-hidden">
                    <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 items-center mb-4 text-sm text-gray-500">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs uppercase">
                                {blog.category}
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {blog.readTime}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {blog.views || 0} views
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Author Info & Share */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-gray-100">
                            <div className="flex items-center gap-4">
                                <img
                                    src={blog.authorImage || 'https://via.placeholder.com/150'}
                                    alt={blog.author}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-gray-900 flex items-center gap-1">
                                        <User size={14} />
                                        {blog.author}
                                    </p>
                                    <p className="text-xs text-gray-500">Expert Author</p>
                                </div>
                            </div>

                            {/* Share Buttons */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    <Share2 size={16} /> Share
                                </button>

                                {showShareMenu && (
                                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <Facebook size={18} className="text-blue-600" />
                                            <span className="text-sm font-medium">Share on Facebook</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <Twitter size={18} className="text-blue-400" />
                                            <span className="text-sm font-medium">Share on Twitter</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <Linkedin size={18} className="text-blue-700" />
                                            <span className="text-sm font-medium">Share on LinkedIn</span>
                                        </button>
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <Copy size={18} className="text-gray-600" />
                                            <span className="text-sm font-medium">
                                                {copySuccess ? 'Copied!' : 'Copy Link'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="prose prose-lg max-w-none mt-8 mb-8">
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                {blog.content}
                            </div>
                        </div>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                                {blog.tags.map((tag, index) => (
                                    <Link
                                        key={index}
                                        to={`/blogs?search=${encodeURIComponent(tag)}`}
                                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </article>

                {/* Related Articles Section */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map((relatedBlog) => (
                                <article
                                    key={relatedBlog._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={relatedBlog.image}
                                            alt={relatedBlog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary px-2 py-1 rounded text-xs font-bold">
                                            {relatedBlog.category}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {relatedBlog.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {relatedBlog.shortDescription}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">
                                                {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <Link
                                                to={`/blog/${relatedBlog.slug || relatedBlog._id}`}
                                                className="text-secondary font-bold text-xs hover:gap-2 transition-all"
                                            >
                                                Read
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetailPage;
