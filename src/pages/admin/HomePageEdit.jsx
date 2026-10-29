import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { compressImage } from '../../utils/imageCompression';
import { Save, ArrowLeft, Plus, Trash2, Leaf, ShieldCheck, Truck, Award, Heart, History, Users, CheckCircle, Droplets, Sparkles, Sun, Instagram, Video, Eye, Film, ExternalLink } from 'lucide-react';

const HomePageEdit = () => {
    const [loading, setLoading] = useState(true);
    const [hero, setHero] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '', image: '' });
    const [hero2, setHero2] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '', image: '' });
    const [hero3, setHero3] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '', image: '' });
    const [activeHeroTab, setActiveHeroTab] = useState(1);
    const [videos, setVideos] = useState({ items: [] });
    const [tradition, setTradition] = useState({ title: '', subtitle: '', image: '' });
    const [testimonials, setTestimonials] = useState({ items: [] });
    const [promise, setPromise] = useState({ title: '', subtitle: '', items: [] });
    const [purity, setPurity] = useState({ title: '', subtitle: '', image1: '', image2: '', items: [] });
    const [trustBar, setTrustBar] = useState({ items: [] });
    const [uploading, setUploading] = useState(false);
    const [previewReelIndex, setPreviewReelIndex] = useState(null);

    const sanitizeReelUrl = (input) => {
        if (!input) return '';
        const iframeMatch = input.match(/src=["']([^"']+)["']/);
        if (iframeMatch) {
            input = iframeMatch[1];
        }
        const match = input.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
            return `https://www.instagram.com/reel/${match[1]}/`;
        }
        return input.trim();
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await api.get('/content');
                if (data.hero) setHero(data.hero);
                if (data.hero2) setHero2(data.hero2);
                if (data.hero3) setHero3(data.hero3);
                if (data.tradition) setTradition(data.tradition);
                if (data.testimonials) setTestimonials(data.testimonials);
                if (data.promise) setPromise(data.promise);
                if (data.purity) setPurity(data.purity);
                if (data.trustBar) setTrustBar(data.trustBar);
                if (data.videos) {
                    setVideos(data.videos);
                } else {
                    setVideos({
                        items: [
                            { title: 'GUT AND DIGESTION', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format', link: '', description: 'new' },
                            { title: 'HAIR AND SCALP CARE', image: 'https://images.unsplash.com/photo-1626444341257-58a13e41ae2a?q=80&w=600&auto=format', link: '', description: 'new' },
                            { title: 'MENS VITALITY BOOSTER', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?q=80&w=600&auto=format', link: '', description: '' }
                        ]
                    });
                }
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

    const uploadHero2ImageHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1920 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setHero2({ ...hero2, image: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Hero 2 image upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const uploadHero3ImageHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1920 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setHero3({ ...hero3, image: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Hero 3 image upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const uploadVideoThumbnailHandler = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 800 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            handleVideoChange(index, 'image', normalizedPath);
            setUploading(false);
        } catch (error) {
            console.error('Video thumbnail upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const uploadVideoFileHandler = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        // Vercel serverless request body limit is 4.5MB
        const MAX_PAYLOAD_BYTES = 4.5 * 1024 * 1024;
        if (file.size > MAX_PAYLOAD_BYTES) {
            const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
            alert(
                `Video size is ${sizeInMb}MB. Vercel serverless upload limit is 4.5MB per file.\n\n` +
                `Options:\n` +
                `1. Compress your video below 4.5MB.\n` +
                `2. Or copy and paste the Instagram Reel link or external video URL directly into the link box.`
            );
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);

            const { data } = await api.post('/upload/video', formData);
            const normalizedPath = typeof data === 'string' ? data.replace(/\\/g, '/') : (data.url || data);
            handleVideoChange(index, 'link', normalizedPath);

            // If no custom thumbnail is set yet, auto-generate Cloudinary poster thumbnail
            if (!videos.items[index]?.image && normalizedPath.includes('cloudinary.com')) {
                const autoPoster = normalizedPath.replace(/\.(mp4|mov|webm|mkv|avi)$/i, '.jpg');
                handleVideoChange(index, 'image', autoPoster);
            }

            setUploading(false);
            alert('Video uploaded successfully!');
        } catch (error) {
            console.error('Video upload failed:', error);
            setUploading(false);
            const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Server error';
            alert(`Video upload failed: ${errMsg}\n\nTip: You can also paste an Instagram Reel link or external video URL directly.`);
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

    const uploadPurityImage1Handler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 800 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setPurity({ ...purity, image1: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Purity image 1 upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const uploadPurityImage2Handler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 800 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setPurity({ ...purity, image2: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Purity image 2 upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const saveHero = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/hero', hero);
            alert('Hero Slide 1 updated!');
        } catch (error) {
            alert('Error updating hero Slide 1');
        }
    };

    const saveHero2 = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/hero2', hero2);
            alert('Hero Slide 2 updated!');
        } catch (error) {
            alert('Error updating Hero Slide 2');
        }
    };

    const saveHero3 = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/hero3', hero3);
            alert('Hero Slide 3 updated!');
        } catch (error) {
            alert('Error updating Hero Slide 3');
        }
    };

    const saveVideos = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/videos', videos);
            alert('Videos updated!');
        } catch (error) {
            alert('Error updating videos');
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

    const savePurity = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/purity', purity);
            alert('Purity section updated!');
        } catch (error) {
            alert('Error updating purity');
        }
    };

    const saveTrustBar = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/trustBar', trustBar);
            alert('Trust bar updated!');
        } catch (error) {
            alert('Error updating trust bar');
        }
    };

    const handleVideoChange = (index, field, value) => {
        const newItems = [...(videos.items || [])];
        if (!newItems[index]) newItems[index] = {};
        newItems[index][field] = value;
        setVideos({ ...videos, items: newItems });
    };

    const addVideoItem = () => {
        setVideos({
            ...videos,
            items: [...(videos.items || []), { title: '', image: '', link: '', description: '' }]
        });
    };

    const removeVideoItem = (index) => {
        const newItems = videos.items.filter((_, i) => i !== index);
        setVideos({ ...videos, items: newItems });
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

    const handlePurityChange = (index, field, value) => {
        const newItems = [...(purity.items || [])];
        if (!newItems[index]) newItems[index] = {};
        newItems[index][field] = value;
        setPurity({ ...purity, items: newItems });
    };

    const addPurityItem = () => {
        setPurity({
            ...purity,
            items: [...(purity.items || []), { title: '', description: '', icon: 'CheckCircle' }]
        });
    };

    const removePurityItem = (index) => {
        const newItems = purity.items.filter((_, i) => i !== index);
        setPurity({ ...purity, items: newItems });
    };

    const handleTrustBarChange = (index, field, value) => {
        const newItems = [...(trustBar.items || [])];
        if (!newItems[index]) newItems[index] = {};
        newItems[index][field] = value;
        setTrustBar({ ...trustBar, items: newItems });
    };

    const addTrustBarItem = () => {
        setTrustBar({
            ...trustBar,
            items: [...(trustBar.items || []), { title: 'Label', icon: 'Leaf' }]
        });
    };

    const removeTrustBarItem = (index) => {
        const newItems = trustBar.items.filter((_, i) => i !== index);
        setTrustBar({ ...trustBar, items: newItems });
    };

    const iconOptions = [
        { name: 'Leaf', icon: <Leaf size={16} /> },
        { name: 'ShieldCheck', icon: <ShieldCheck size={16} /> },
        { name: 'Truck', icon: <Truck size={16} /> },
        { name: 'Users', icon: <Users size={16} /> },
        { name: 'Award', icon: <Award size={16} /> },
        { name: 'Heart', icon: <Heart size={16} /> },
        { name: 'History', icon: <History size={16} /> },
        { name: 'CheckCircle', icon: <CheckCircle size={16} /> },
        { name: 'Droplets', icon: <Droplets size={16} /> },
        { name: 'Sparkles', icon: <Sparkles size={16} /> },
        { name: 'Sun', icon: <Sun size={16} /> },
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
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary flex justify-between items-center">
                        Hero Section Carousel
                        <div className="flex gap-1 text-xs">
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setActiveHeroTab(num)}
                                    className={`px-3 py-1 rounded-md font-bold transition-all ${activeHeroTab === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Slide {num}
                                </button>
                            ))}
                        </div>
                    </h2>
                    
                    {activeHeroTab === 1 && (
                        <form onSubmit={saveHero} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Badge / Tag</label>
                                <p className="text-[10px] text-gray-400 italic mb-1">Standard: PREMIUM WELLNESS</p>
                            </div>
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
                                {hero.image && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                                        <img 
                                            src={getImageUrl(hero.image)} 
                                            alt="Hero Preview" 
                                            className="h-32 w-auto rounded border shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                                <Save size={16} /> Save Slide 1 Content
                            </button>
                        </form>
                    )}

                    {activeHeroTab === 2 && (
                        <form onSubmit={saveHero2} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Badge / Tag</label>
                                <p className="text-[10px] text-gray-400 italic mb-1">Standard: DOCTOR CONSULTATION</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={hero2.title}
                                    onChange={(e) => setHero2({ ...hero2, title: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Subtitle</label>
                                <textarea
                                    value={hero2.subtitle}
                                    onChange={(e) => setHero2({ ...hero2, subtitle: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">CTA Text</label>
                                    <input
                                        type="text"
                                        value={hero2.ctaText}
                                        onChange={(e) => setHero2({ ...hero2, ctaText: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">CTA Link</label>
                                    <input
                                        type="text"
                                        value={hero2.ctaLink}
                                        onChange={(e) => setHero2({ ...hero2, ctaLink: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Hero Image</label>
                                <input
                                    type="text"
                                    value={hero2.image}
                                    onChange={(e) => setHero2({ ...hero2, image: e.target.value })}
                                    className="w-full border p-2 rounded mb-2"
                                    placeholder="Image URL or Upload"
                                />
                                <input
                                    type="file"
                                    id="hero2-image-file"
                                    className="hidden"
                                    onChange={uploadHero2ImageHandler}
                                />
                                <label htmlFor="hero2-image-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-block text-sm font-bold">
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                                {hero2.image && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                                        <img 
                                            src={getImageUrl(hero2.image)} 
                                            alt="Hero 2 Preview" 
                                            className="h-32 w-auto rounded border shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                                <Save size={16} /> Save Slide 2 Content
                            </button>
                        </form>
                    )}

                    {activeHeroTab === 3 && (
                        <form onSubmit={saveHero3} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Badge / Tag</label>
                                <p className="text-[10px] text-gray-400 italic mb-1">Standard: 100% PURE & CERTIFIED</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={hero3.title}
                                    onChange={(e) => setHero3({ ...hero3, title: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Subtitle</label>
                                <textarea
                                    value={hero3.subtitle}
                                    onChange={(e) => setHero3({ ...hero3, subtitle: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">CTA Text</label>
                                    <input
                                        type="text"
                                        value={hero3.ctaText}
                                        onChange={(e) => setHero3({ ...hero3, ctaText: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">CTA Link</label>
                                    <input
                                        type="text"
                                        value={hero3.ctaLink}
                                        onChange={(e) => setHero3({ ...hero3, ctaLink: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Hero Image</label>
                                <input
                                    type="text"
                                    value={hero3.image}
                                    onChange={(e) => setHero3({ ...hero3, image: e.target.value })}
                                    className="w-full border p-2 rounded mb-2"
                                    placeholder="Image URL or Upload"
                                />
                                <input
                                    type="file"
                                    id="hero3-image-file"
                                    className="hidden"
                                    onChange={uploadHero3ImageHandler}
                                />
                                <label htmlFor="hero3-image-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-block text-sm font-bold">
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                                {hero3.image && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                                        <img 
                                            src={getImageUrl(hero3.image)} 
                                            alt="Hero 3 Preview" 
                                            className="h-32 w-auto rounded border shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                                <Save size={16} /> Save Slide 3 Content
                            </button>
                        </form>
                    )}
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

                {/* Trust Bar Editor */}
                <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary flex justify-between items-center">
                        Brand Trust Bar (Marquee Features)
                        <button type="button" onClick={addTrustBarItem} className="bg-secondary text-primary text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                            <Plus size={14} /> Add Feature
                        </button>
                    </h2>
                    <form onSubmit={saveTrustBar} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {trustBar.items?.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border relative shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => removeTrustBarItem(index)}
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
                                                    onClick={() => handleTrustBarChange(index, 'icon', opt.name)}
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
                                            onChange={(e) => handleTrustBarChange(index, 'title', e.target.value)}
                                            className="w-full border p-2 rounded text-sm font-bold"
                                            placeholder="Feature Label"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Trust Bar
                        </button>
                    </form>
                </div>

                {/* Purity Process Editor */}
                <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary flex justify-between items-center">
                        The Essence of Purity (Handcrafted Process)
                        <button type="button" onClick={addPurityItem} className="bg-secondary text-primary text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                            <Plus size={14} /> Add Step
                        </button>
                    </h2>
                    <form onSubmit={savePurity} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Section Title</label>
                                <input
                                    type="text"
                                    value={purity.title}
                                    onChange={(e) => setPurity({ ...purity, title: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                    <p className="text-xs text-gray-400 mt-1 italic">Headline: "Handcrafted with [Italic Part]"</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl mb-6">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Purity Image 1 (Left)</label>
                                    <input
                                        type="text"
                                        value={purity.image1 || ''}
                                        onChange={(e) => setPurity({ ...purity, image1: e.target.value })}
                                        className="w-full border p-2 rounded mb-2 text-sm"
                                        placeholder="Image URL or Upload"
                                    />
                                    <input
                                        type="file"
                                        id="purity-image-1"
                                        className="hidden"
                                        onChange={uploadPurityImage1Handler}
                                    />
                                    <label htmlFor="purity-image-1" className="cursor-pointer bg-white py-1.5 px-3 rounded border hover:bg-gray-100 inline-block text-xs font-bold shadow-sm">
                                        {uploading ? 'Uploading...' : 'Upload Image 1'}
                                    </label>
                                    {purity.image1 && (
                                        <div className="mt-2 text-center">
                                            <img src={getImageUrl(purity.image1)} alt="Preview 1" className="h-20 mx-auto rounded border" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Purity Image 2 (Right)</label>
                                    <input
                                        type="text"
                                        value={purity.image2 || ''}
                                        onChange={(e) => setPurity({ ...purity, image2: e.target.value })}
                                        className="w-full border p-2 rounded mb-2 text-sm"
                                        placeholder="Image URL or Upload"
                                    />
                                    <input
                                        type="file"
                                        id="purity-image-2"
                                        className="hidden"
                                        onChange={uploadPurityImage2Handler}
                                    />
                                    <label htmlFor="purity-image-2" className="cursor-pointer bg-white py-1.5 px-3 rounded border hover:bg-gray-100 inline-block text-xs font-bold shadow-sm">
                                        {uploading ? 'Uploading...' : 'Upload Image 2'}
                                    </label>
                                    {purity.image2 && (
                                        <div className="mt-2 text-center">
                                            <img src={getImageUrl(purity.image2)} alt="Preview 2" className="h-20 mx-auto rounded border" />
                                        </div>
                                    )}
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {purity.items?.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border relative shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => removePurityItem(index)}
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
                                                    onClick={() => handlePurityChange(index, 'icon', opt.name)}
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
                                            onChange={(e) => handlePurityChange(index, 'title', e.target.value)}
                                            className="w-full border p-2 rounded text-sm font-bold"
                                            placeholder="Step Title"
                                        />
                                        <textarea
                                            value={item.description || ''}
                                            onChange={(e) => handlePurityChange(index, 'description', e.target.value)}
                                            className="w-full border p-2 rounded text-sm h-20"
                                            placeholder="Step Description"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-90 transition-all">
                            <Save size={16} /> Save Purity Section
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

                {/* Video Reviews & Instagram Reels Editor */}
                <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b pb-3">
                        <div>
                            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                <Instagram size={22} className="text-pink-600" />
                                Shared Journeys (Instagram Reels & Videos)
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Feature Instagram Reels or upload vertical MP4 videos to showcase real customer results on the homepage.
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={addVideoItem} 
                            className="bg-secondary text-primary text-xs px-4 py-2 rounded-md font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
                        >
                            <Plus size={15} /> Add Reel / Video
                        </button>
                    </div>

                    <div className="mb-4 p-3 bg-pink-50/70 border border-pink-200/80 rounded-xl text-xs text-gray-700 flex items-start gap-2.5">
                        <Instagram size={18} className="text-pink-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-pink-900 block font-semibold mb-0.5">How to add Instagram Reels:</strong>
                            Open Instagram → Go to your Reel → Click <strong>Share</strong> → Copy Link → Paste below. We automatically clean tracking IDs and format the embed for you! Or click <strong>Upload Video File</strong> to upload an MP4 directly.
                        </div>
                    </div>

                    <form onSubmit={saveVideos} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {videos.items?.map((item, index) => {
                                const isInsta = item.link && (item.link.includes('instagram.com') || item.link.includes('instagr.am'));
                                const isDirectVideo = item.link && (item.link.endsWith('.mp4') || item.link.endsWith('.mov') || item.link.endsWith('.webm') || item.link.startsWith('/uploads/'));
                                const isYouTube = item.link && (item.link.includes('youtube.com') || item.link.includes('youtu.be'));
                                const isPreviewOpen = previewReelIndex === index;

                                return (
                                    <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 relative shadow-xs hover:shadow-md transition-all">
                                        <button
                                            type="button"
                                            onClick={() => removeVideoItem(index)}
                                            className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                            title="Remove Reel"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Format Indicator Badge */}
                                        <div className="mb-3 pr-8">
                                            {isInsta ? (
                                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#833ab4] via-[#ee2a7b] to-[#fcb045] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                                    <Instagram size={11} /> Instagram Reel
                                                </span>
                                            ) : isDirectVideo ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                                    <Film size={11} /> Direct MP4 Video
                                                </span>
                                            ) : isYouTube ? (
                                                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                                    <Video size={11} /> YouTube Video
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Reel #{index + 1}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {/* Video Title */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reel / Video Title</label>
                                                <input
                                                    type="text"
                                                    value={item.title || ''}
                                                    onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm font-semibold bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
                                                    placeholder="e.g. Hair Growth Journey with Keshraj"
                                                />
                                            </div>

                                            {/* Badge */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Corner Tag (e.g. "NEW", "POPULAR", or blank)</label>
                                                <input
                                                    type="text"
                                                    value={item.description || ''}
                                                    onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-white focus:border-primary outline-hidden"
                                                    placeholder='e.g. new'
                                                />
                                            </div>

                                            {/* Reel Link or File */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                    Instagram Reel Link (or Video URL)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.link || ''}
                                                    onChange={(e) => handleVideoChange(index, 'link', sanitizeReelUrl(e.target.value))}
                                                    className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-white mb-2 font-mono focus:border-primary outline-hidden"
                                                    placeholder="https://www.instagram.com/reel/Cxxxxxx/"
                                                />

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        type="file"
                                                        id={`video-file-${index}`}
                                                        className="hidden"
                                                        accept="video/mp4,video/mov,video/webm"
                                                        onChange={(e) => uploadVideoFileHandler(e, index)}
                                                    />
                                                    <label 
                                                        htmlFor={`video-file-${index}`} 
                                                        className="cursor-pointer bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 inline-flex items-center gap-1 shadow-2xs"
                                                    >
                                                        <Video size={13} className="text-primary" />
                                                        {uploading ? 'Uploading...' : 'Upload Video File (.mp4)'}
                                                    </label>

                                                    {item.link && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewReelIndex(isPreviewOpen ? null : index)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 border transition-all ${
                                                                isPreviewOpen 
                                                                    ? 'bg-primary text-white border-primary' 
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                                            }`}
                                                        >
                                                            <Eye size={13} /> {isPreviewOpen ? 'Hide Preview' : 'Test Preview'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Live Preview Accordion */}
                                            {isPreviewOpen && item.link && (
                                                <div className="p-3 bg-black rounded-xl overflow-hidden shadow-inner text-center">
                                                    <p className="text-[10px] text-gray-400 mb-2 font-mono">Live Player Preview:</p>
                                                    {isInsta ? (
                                                        <iframe
                                                            src={`https://www.instagram.com/reel/${(item.link.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i) || [])[1]}/embed/`}
                                                            className="w-full h-80 rounded-lg border-none"
                                                            title="Instagram Preview"
                                                            scrolling="no"
                                                        />
                                                    ) : isDirectVideo ? (
                                                        <video
                                                            src={getImageUrl(item.link)}
                                                            className="w-full h-64 object-contain mx-auto rounded"
                                                            controls
                                                        />
                                                    ) : (
                                                        <p className="text-xs text-white">Preview available for Instagram & MP4.</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Thumbnail Image upload */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                    Cover Thumbnail Image (Recommended for fast loading)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.image || ''}
                                                    onChange={(e) => handleVideoChange(index, 'image', e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-white mb-2 focus:border-primary outline-hidden"
                                                    placeholder="Thumbnail Image URL"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        id={`video-thumb-file-${index}`}
                                                        className="hidden"
                                                        onChange={(e) => uploadVideoThumbnailHandler(e, index)}
                                                    />
                                                    <label 
                                                        htmlFor={`video-thumb-file-${index}`} 
                                                        className="cursor-pointer bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 inline-block shadow-2xs"
                                                    >
                                                        {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                                                    </label>
                                                    {item.image && (
                                                        <img src={getImageUrl(item.image)} alt="Preview" className="h-10 w-10 object-cover rounded-lg border shadow-2xs" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <button 
                                type="submit" 
                                className="bg-primary text-white hover:bg-secondary hover:text-primary px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <Save size={16} /> Save Reel & Video Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HomePageEdit;
