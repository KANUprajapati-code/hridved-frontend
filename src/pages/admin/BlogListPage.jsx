import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { ToastContext } from '../../context/ToastContext';

const BlogListPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToast } = useContext(ToastContext) || {};

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/blogs/admin/all?page=${currentPage}&limit=15`;

            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }

            if (statusFilter) {
                url += `&status=${statusFilter}`;
            }

            const { data } = await api.get(url);
            setBlogs(data.blogs);
            setPagination(data.pagination);
        } catch (err) {
            if (addToast) addToast('Failed to load blogs', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter, addToast]);

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, searchQuery, statusFilter, fetchBlogs]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            await api.put(`/blogs/${id}/toggle-status`);
            if (addToast) addToast(
                `Blog ${currentStatus === 'published' ? 'unpublished' : 'published'} successfully`,
                'success'
            );
            fetchBlogs();
        } catch (err) {
            if (addToast) addToast('Failed to update blog status', 'error');
            console.error(err);
        }
    };

    const deleteHandler = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await api.delete(`/blogs/${id}`);
                if (addToast) addToast('Blog deleted successfully', 'success');
                setBlogs(blogs.filter((blog) => blog._id !== id));
            } catch (err) {
                if (addToast) addToast('Failed to delete blog', 'error');
                console.error(err);
            }
        }
    };

    const createBlogHandler = async () => {
        try {
            const { data } = await api.post('/blogs', {
                title: 'Untitled Blog',
                shortDescription: 'Click to edit...',
                content: 'Start writing your blog content...',
                image: 'https://via.placeholder.com/800x400',
                category: 'General Wellness',
                author: 'Admin',
            });
            window.location.href = `/admin/blog/${data._id}/edit`;
        } catch (err) {
            if (addToast) addToast('Failed to create blog', 'error');
            console.error(err);
        }
    };

    if (loading && !blogs.length) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading blogs...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Blog Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and publish your blog articles</p>
                </div>
                <button
                    onClick={createBlogHandler}
                    className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors font-semibold whitespace-nowrap"
                >
                    <Plus size={20} /> Create Blog
                </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <input
                        type="text"
                        placeholder="Search by title, category, or author..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>

                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700">Blog Title</th>
                                <th className="p-4 font-semibold text-gray-700 hidden sm:table-cell">Category</th>
                                <th className="p-4 font-semibold text-gray-700 hidden md:table-cell">Author</th>
                                <th className="p-4 font-semibold text-gray-700">Status</th>
                                <th className="p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No blogs found. Create your first blog to get started!
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                                        {/* Title */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={blog.image}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate" title={blog.title}>
                                                        {blog.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(blog.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="p-4 hidden sm:table-cell">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {blog.category}
                                            </span>
                                        </td>

                                        {/* Author */}
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={blog.authorImage || 'https://via.placeholder.com/32'}
                                                    alt={blog.author}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span className="text-sm text-gray-600">{blog.author}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${blog.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {blog.status === 'published' ? (
                                                    <>
                                                        <Eye size={12} />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff size={12} />
                                                        Draft
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(blog._id, blog.status)}
                                                    className={`p-2 rounded-lg transition-colors ${blog.status === 'published'
                                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                                >
                                                    {blog.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <Link
                                                    to={`/admin/blog/${blog._id}/edit`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => deleteHandler(blog._id, blog.title)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalBlogs} total)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogListPage;
