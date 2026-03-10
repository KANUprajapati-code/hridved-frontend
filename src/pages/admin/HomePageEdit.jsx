import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { compressImage } from '../../utils/imageCompression';
import { Save, ArrowLeft, Plus, Trash2, Leaf, ShieldCheck, Truck, Award, Heart, History, Users } from 'lucide-react';

const HomePageEdit = () => {
    const [loading, setLoading] = useState(true);
    const [hero, setHero] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '', image: '' });
    const [tradition, setTradition] = useState({ title: '', subtitle: '', image: '' });
    const [testimonials, setTestimonials] = useState({ items: [] });
    const [promise, setPromise] = useState({ title: '', subtitle: '', items: [] });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await api.get('/content');
                if (data.hero) setHero(data.hero);
                if (data.tradition) setTradition(data.tradition);
                if (data.testimonials) setTestimonials(data.testimonials);
                if (data.promise) setPromise(data.promise);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching content", error);
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const uploadHeroImageHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1920 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setHero({ ...hero, image: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Hero image upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const uploadTraditionImageHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1200 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setTradition({ ...tradition, image: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Tradition image upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const saveHero = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/hero', hero);
            alert('Hero section updated!');
        } catch (error) {
            alert('Error updating hero');
        }
    };

    const saveTradition = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/tradition', tradition);
            alert('Tradition section updated!');
        } catch (error) {
            alert('Error updating tradition');
        }
    };

    const saveTestimonials = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/testimonials', testimonials);
            alert('Testimonials updated!');
        } catch (error) {
            alert('Error updating testimonials');
        }
    };

    const savePromise = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/promise', promise);
            alert('Promise section updated!');
        } catch (error) {
            alert('Error updating promise');
        }
    };

    const handleTestimonialChange = (index, field, value) => {
        const newItems = [...(testimonials.items || [])];
        if (!newItems[index]) newItems[index] = {};
        newItems[index][field] = value;
        setTestimonials({ ...testimonials, items: newItems });
    };

    const addTestimonial = () => {
        setTestimonials({
            ...testimonials,
            items: [...(testimonials.items || []), { title: 'Name', description: 'Feedback', link: 'Location/Role' }]
        });
    };

    const removeTestimonial = (index) => {
        const newItems = testimonials.items.filter((_, i) => i !== index);
        setTestimonials({ ...testimonials, items: newItems });
    };

    const handlePromiseChange = (index, field, value) => {
        const newItems = [...(promise.items || [])];
        if (!newItems[index]) newItems[index] = {};
        newItems[index][field] = value;
        setPromise({ ...promise, items: newItems });
    };

    const addPromiseItem = () => {
        setPromise({
            ...promise,
            items: [...(promise.items || []), { title: '', description: '', icon: 'Leaf' }]
        });
    };

    const removePromiseItem = (index) => {
        const newItems = promise.items.filter((_, i) => i !== index);
        setPromise({ ...promise, items: newItems });
    };

    const iconOptions = [
        { name: 'Leaf', icon: <Leaf size={16} /> },
        { name: 'ShieldCheck', icon: <ShieldCheck size={16} /> },
        { name: 'Truck', icon: <Truck size={16} /> },
        { name: 'Users', icon: <Users size={16} /> },
        { name: 'Award', icon: <Award size={16} /> },
        { name: 'Heart', icon: <Heart size={16} /> },
        { name: 'History', icon: <History size={16} /> },
    ];

    if (loading) return <div className="p-8">Loading content...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold font-serif text-primary mb-8">Edit Home Page Content</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Editor */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">Hero Section</h2>
                    <form onSubmit={saveHero} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Title</label>
                            <input
                                type="text"
                                value={hero.title}
                                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Subtitle</label>
                            <textarea
                                value={hero.subtitle}
                                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                className="w-full border p-2 rounded"
                                rows="3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">CTA Text</label>
                                <input
                                    type="text"
                                    value={hero.ctaText}
                                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">CTA Link</label>
                                <input
                                    type="text"
                                    value={hero.ctaLink}
                                    onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Hero Image</label>
                            <input
                                type="text"
                                value={hero.image}
                                onChange={(e) => setHero({ ...hero, image: e.target.value })}
                                className="w-full border p-2 rounded mb-2"
                                placeholder="Image URL or Upload"
                            />
                            <input
                                type="file"
                                id="hero-image-file"
                                className="hidden"
                                onChange={uploadHeroImageHandler}
                            />
                            <label htmlFor="hero-image-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-block text-sm font-bold">
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </label>
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Hero Section
                        </button>
                    </form>
                </div>

                {/* Tradition Editor */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">Tradition Section</h2>
                    <form onSubmit={saveTradition} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Title</label>
                            <input
                                type="text"
                                value={tradition.title}
                                onChange={(e) => setTradition({ ...tradition, title: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Content/Description</label>
                            <textarea
                                value={tradition.subtitle}
                                onChange={(e) => setTradition({ ...tradition, subtitle: e.target.value })}
                                className="w-full border p-2 rounded"
                                rows="5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Image URL</label>
                            <input
                                type="text"
                                value={tradition.image}
                                onChange={(e) => setTradition({ ...tradition, image: e.target.value })}
                                className="w-full border p-2 rounded mb-2"
                            />
                            <input
                                type="file"
                                id="tradition-image-file"
                                className="hidden"
                                onChange={uploadTraditionImageHandler}
                            />
                            <label htmlFor="tradition-image-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-block text-sm font-bold">
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </label>
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Tradition Section
                        </button>
                    </form>
                </div>

                {/* Promise/Why Choose Us Editor */}
                <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary flex justify-between items-center">
                        The Hridved Promise (Why Choose Us)
                        <button type="button" onClick={addPromiseItem} className="bg-secondary text-primary text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                            <Plus size={14} /> Add Promise
                        </button>
                    </h2>
                    <form onSubmit={savePromise} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Main Heading</label>
                                <input
                                    type="text"
                                    value={promise.title}
                                    onChange={(e) => setPromise({ ...promise, title: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    placeholder="e.g., Why Hundreds of Thousands Trust HRIDVED"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Sub-heading</label>
                                <input
                                    type="text"
                                    value={promise.subtitle}
                                    onChange={(e) => setPromise({ ...promise, subtitle: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    placeholder="e.g., The Hridved Way"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {promise.items?.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border relative shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        type="button"
                                        onClick={() => removePromiseItem(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.map(opt => (
                                                <button
                                                    key={opt.name}
                                                    type="button"
                                                    onClick={() => handlePromiseChange(index, 'icon', opt.name)}
                                                    className={`p-1.5 rounded border ${item.icon === opt.name ? 'border-primary bg-primary/10 text-primary' : 'bg-white border-gray-200 text-gray-400'}`}
                                                >
                                                    {opt.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => handlePromiseChange(index, 'title', e.target.value)}
                                            className="w-full border p-2 rounded text-sm font-bold"
                                            placeholder="Promise Title"
                                        />
                                        <textarea
                                            value={item.description || ''}
                                            onChange={(e) => handlePromiseChange(index, 'description', e.target.value)}
                                            className="w-full border p-2 rounded text-sm h-20"
                                            placeholder="Promise Description"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Promise Section
                        </button>
                    </form>
                </div>

                {/* Testimonials Editor */}
                <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-bold text-primary">Testimonials</h2>
                        <button type="button" onClick={addTestimonial} className="bg-secondary text-primary text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                            <Plus size={14} /> Add Testimonial
                        </button>
                    </div>
                    <form onSubmit={saveTestimonials} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            { testimonials.items?.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border relative shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        type="button"
                                        onClick={() => removeTestimonial(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Customer Name</label>
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => handleTestimonialChange(index, 'title', e.target.value)}
                                                className="w-full border p-2 rounded text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Location / Role</label>
                                            <input
                                                type="text"
                                                value={item.link || ''}
                                                onChange={(e) => handleTestimonialChange(index, 'link', e.target.value)}
                                                className="w-full border p-2 rounded text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Feedback</label>
                                            <textarea
                                                value={item.description || ''}
                                                onChange={(e) => handleTestimonialChange(index, 'description', e.target.value)}
                                                className="w-full border p-2 rounded text-sm h-24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Testimonials
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HomePageEdit;
