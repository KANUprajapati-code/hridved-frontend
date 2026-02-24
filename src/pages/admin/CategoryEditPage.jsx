import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertCircle, Check } from 'lucide-react';
import api from '../../utils/api';
import AnimatedButton from '../../components/AnimatedButton';

const CategoryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchCategory = async () => {
                try {
                    setLoading(true);
                    const { data } = await api.get(`/categories/${id}`);
                    setName(data.name);
                    setSlug(data.slug);
                    setImage(data.image);
                    setDescription(data.description || '');
                } catch (err) {
                    setError('Failed to fetch category details');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchCategory();
        }
    }, [id, isEditMode]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEditMode && name) {
            const generatedSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generatedSlug);
        }
    }, [name, isEditMode]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await api.post('/upload', formData, config);
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            setError('Image upload failed');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const categoryData = { name, slug, image, description };

            if (isEditMode) {
                await api.put(`/categories/${id}`, categoryData);
            } else {
                await api.post('/categories', categoryData);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/categorylist');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin/categorylist" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Categories
            </Link>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary p-8 text-white relative">
                        <h1 className="text-3xl font-display font-bold">
                            {isEditMode ? 'Edit Category' : 'Add New Category'}
                        </h1>
                        <p className="text-white/70 mt-2">
                            {isEditMode ? `Updating ${name}` : 'Create a fresh category for your shop'}
                        </p>
                    </div>

                    <form onSubmit={submitHandler} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-shake">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3">
                                <Check size={20} />
                                <span className="text-sm font-bold">Category saved successfully! Redirecting...</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Skin Care"
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">URL Slug</label>
                                <input
                                    type="text"
                                    placeholder="skin-care"
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-mono italic text-sm"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                            <textarea
                                placeholder="Pure herbal formulations for..."
                                rows="3"
                                className="w-full bg-gray-50 border-gray-100 rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category Image (Square 1:1 recommended)</label>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                                    {image ? (
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                                            <span className="text-[10px] text-gray-400 block">No Image</span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow space-y-4 w-full">
                                    <input
                                        type="text"
                                        placeholder="Image URL or upload below"
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-sm mb-2"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        required
                                    />

                                    <label className="relative flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm">
                                        <Upload size={18} />
                                        <span>{uploading ? 'Processing...' : 'Upload Square Image'}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={uploadFileHandler}
                                        />
                                    </label>
                                    <p className="text-[11px] text-gray-400 italic">Square images (1:1 aspect ratio) look best in the homepage circles.</p>
                                </div>
                            </div>
                        </div>

                        <AnimatedButton
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl hover:shadow-primary/20 transition-all mt-8"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <><Save size={20} /> {isEditMode ? 'Update Category' : 'Create Category'}</>
                            )}
                        </AnimatedButton>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryEditPage;
