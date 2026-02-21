import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X, Eye, EyeOff } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { ToastContext } from '../../context/ToastContext';

const BlogEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form fields
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('General Wellness');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [author, setAuthor] = useState('');
    const [authorImage, setAuthorImage] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [readTime, setReadTime] = useState('5 min read');
    const [status, setStatus] = useState('draft');
    const [isFeatured, setIsFeatured] = useState(false);

    const categories = [
        'Skin Care',
        'Hair Health',
        'Nutrition',
        'Yoga',
        'Stress Management',
        'General Wellness',
        'Ayurveda',
        'Tips & Tricks',
        'Product Guide',
        'Other',
    ];

    const fetchBlog = useCallback(async () => {
        try {
            const { data } = await api.get(`/blogs/${id}`);
            setTitle(data.title);
            setSlug(data.slug);
            setShortDescription(data.shortDescription);
            setContent(data.content);
            setExcerpt(data.excerpt || '');
            setImage(data.image);
            setCategory(data.category);
            setTags(data.tags || []);
            setAuthor(data.author);
            setAuthorImage(data.authorImage || '');
            setMetaTitle(data.metaTitle || '');
            setMetaDescription(data.metaDescription || '');
            setReadTime(data.readTime || '5 min read');
            setStatus(data.status || 'draft');
            setIsFeatured(data.isFeatured || false);
            setLoading(false);
        } catch (error) {
            if (addToast) addToast('Failed to load blog', 'error');
            console.error(error);
            setLoading(false);
        }
    }, [id, addToast]);

    useEffect(() => {
        if (id) {
            fetchBlog();
        } else {
            setLoading(false);
        }
    }, [id, fetchBlog]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Auto-generate slug from title
        const newSlug = newTitle
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        setSlug(newSlug);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const uploadFileHandler = async (e, setFunction) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFunction(data);
            if (addToast) addToast('Image uploaded successfully', 'success');
        } catch (error) {
            if (addToast) addToast('Failed to upload image', 'error');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const submitHandler = async (e, publishNow = false) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !shortDescription.trim() || !content.trim() || !image || !author.trim()) {
            if (addToast) addToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setSaving(true);
            const blogData = {
                title,
                slug,
                shortDescription,
                content,
                excerpt: excerpt || shortDescription.substring(0, 300),
                image,
                category,
                tags,
                author,
                authorImage,
                metaTitle: metaTitle || title.substring(0, 60),
                metaDescription: metaDescription || shortDescription.substring(0, 160),
                readTime,
                status: publishNow ? 'published' : status,
                isFeatured,
            };

            if (id) {
                await api.put(`/blogs/${id}`, blogData);
                if (addToast) addToast('Blog updated successfully', 'success');
            } else {
                const { data } = await api.post('/blogs', blogData);
                if (addToast) addToast('Blog created successfully', 'success');
                navigate(`/admin/blog/${data._id}/edit`);
                return;
            }

            navigate('/admin/bloglist');
        } catch (error) {
            if (addToast) addToast('Failed to save blog', 'error');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading blog...</p>
            </div>
        );
    }

    return (
        <div>
            <Link
                to="/admin/bloglist"
                className="inline-flex items-center text-primary hover:text-opacity-80 mb-6 transition-colors font-bold text-sm"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Blogs
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {id ? 'Edit Blog' : 'Create New Blog'}
                        </h1>
                        {id && <p className="text-sm text-gray-500 mt-1">ID: {id}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submitHandler} className="p-8 space-y-8">
                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Blog Title *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter an engaging blog title"
                                value={title}
                                onChange={handleTitleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                            <input
                                type="text"
                                placeholder="auto-generated-from-title"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from title. Preview: /blog/{slug}</p>
                        </div>
                    </div>

                    {/* Short Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Short Description *
                        </label>
                        <textarea
                            rows="2"
                            placeholder="A compelling summary for blog listings and search results..."
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            maxLength="500"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">{shortDescription.length}/500 characters</p>
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image *</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter image URL or upload"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="image-file"
                                    onChange={(e) => uploadFileHandler(e, setImage)}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="image-file"
                                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-200 border border-gray-300 flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
                                >
                                    <Upload size={18} />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                            </div>
                        </div>
                        {image && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 max-w-sm">
                                <img src={image} alt="Preview" className="w-full h-40 object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Category, Author, Read Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Author Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Ayurveda Expert"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Read Time</label>
                            <input
                                type="text"
                                placeholder="e.g. 5 min read"
                                value={readTime}
                                onChange={(e) => setReadTime(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Author Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Author Image</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter author image URL or upload"
                                    value={authorImage}
                                    onChange={(e) => setAuthorImage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="author-image-file"
                                    onChange={(e) => uploadFileHandler(e, setAuthorImage)}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="author-image-file"
                                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-200 border border-gray-300 flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
                                >
                                    <Upload size={18} />
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </label>
                            </div>
                        </div>
                        {authorImage && (
                            <div className="mt-4 w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                                <img src={authorImage} alt="Author" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Add tags (press Enter or Add)"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors font-medium"
                            >
                                Add
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(index)}
                                            className="hover:text-blue-900"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Blog Content */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Blog Content *</label>
                        <textarea
                            rows="15"
                            placeholder="Write your comprehensive blog content here. You can use line breaks for formatting..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm resize-vertical"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">Plain text format. Use line breaks for paragraphs.</p>
                    </div>

                    {/* SEO Fields */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Optimization</h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                            <input
                                type="text"
                                placeholder="SEO-friendly title (recommended 60 characters max)"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value.substring(0, 60))}
                                maxLength="60"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 characters</p>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                            <textarea
                                rows="2"
                                placeholder="Meta description for search results (recommended 160 characters max)"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value.substring(0, 160))}
                                maxLength="160"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Publishing Options</h3>

                        <div className="space-y-3">
                            <Link to="/admin/bloglist" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors font-medium">
                                <ArrowLeft size={20} /> Back to Blogs
                            </Link>
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary accent-primary"
                                />
                                <span className="font-medium text-gray-700">Featured on blog homepage</span>
                            </label>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <label className="text-sm font-bold text-gray-700 block mb-3">Status</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="draft"
                                            checked={status === 'draft'}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-gray-700">Save as Draft</span>
                                        <EyeOff size={14} className="text-gray-400" />
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="published"
                                            checked={status === 'published'}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-gray-700">Publish (visible to all)</span>
                                        <Eye size={14} className="text-green-500" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                        <Link
                            to="/admin/bloglist"
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save as ' + status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                        {status === 'draft' && (
                            <button
                                type="button"
                                onClick={(e) => submitHandler(e, true)}
                                disabled={saving || uploading}
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/30 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Eye size={20} />
                                {saving ? 'Publishing...' : 'Save & Publish'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEditPage;
