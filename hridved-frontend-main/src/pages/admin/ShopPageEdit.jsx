
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { compressImage } from '../../utils/imageCompression';
import { Save, ArrowLeft, Upload } from 'lucide-react';

const ShopPageEdit = () => {
    const [loading, setLoading] = useState(true);
    const [footer, setFooter] = useState({ title: '', subtitle: '', image: '' });
    const [shopPage, setShopPage] = useState({ title: '', description: '', bulkEyebrow: '', bulkTitle: '', bulkDescription: '', bulkButton: '', bulkLink: '', bulkBenefits: [] });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await api.get('/content');
                if (data.shopFooter) setFooter(data.shopFooter);
                if (data.shopPage?.data) setShopPage((current) => ({ ...current, ...data.shopPage.data }));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching shop content", error);
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const uploadImageHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1200 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            const normalizedPath = data.replace(/\\/g, '/');
            setFooter({ ...footer, image: normalizedPath });
            setUploading(false);
        } catch (error) {
            console.error('Image upload failed:', error);
            setUploading(false);
            alert('Upload failed. Try a smaller image.');
        }
    };

    const saveFooter = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/shopFooter', footer);
            alert('Shop footer updated!');
        } catch (error) {
            alert('Error updating shop footer');
        }
    };

    const saveShopPage = async (e) => {
        e.preventDefault();
        try {
            await api.put('/content/shopPage', { data: shopPage });
            alert('Shop page content updated!');
        } catch (error) {
            alert('Error updating shop page content');
        }
    };

    if (loading) return <div className="p-8">Loading shop content...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold font-serif text-primary mb-8">Edit Shop Page Content</h1>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 border-b pb-4 text-primary">"Ayurveda for Every Body" Section</h2>
                    
                    <form onSubmit={saveFooter} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Main Heading</label>
                            <input
                                type="text"
                                value={footer.title}
                                onChange={(e) => setFooter({ ...footer, title: e.target.value })}
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g., Ayurveda for Every Body"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Content Description</label>
                            <textarea
                                value={footer.subtitle}
                                onChange={(e) => setFooter({ ...footer, subtitle: e.target.value })}
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                rows="6"
                                placeholder="Describe the section content..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Section Image</label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-1/2">
                                    <input
                                        type="text"
                                        value={footer.image}
                                        onChange={(e) => setFooter({ ...footer, image: e.target.value })}
                                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all mb-4"
                                        placeholder="Image URL or Upload"
                                    />
                                    <input
                                        type="file"
                                        id="footer-image-file"
                                        className="hidden"
                                        onChange={uploadImageHandler}
                                    />
                                    <label htmlFor="footer-image-file" className="cursor-pointer bg-primary/5 text-primary py-3 px-6 rounded-xl border border-primary/10 hover:bg-primary/10 inline-flex items-center gap-2 font-bold transition-all">
                                        <Upload size={18} />
                                        {uploading ? 'Uploading...' : 'Upload New Image'}
                                    </label>
                                </div>
                                
                                {footer.image && (
                                    <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                                        <img 
                                            src={footer.image} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x225?text=Invalid+Image+URL'}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all font-bold">
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
                    <h2 className="text-xl font-bold mb-6 border-b pb-4 text-primary">Shop intro and bulk orders</h2>
                    <form onSubmit={saveShopPage} className="space-y-5">
                        <label className="block text-sm font-bold text-gray-700">Shop heading<input value={shopPage.title} onChange={(e) => setShopPage({ ...shopPage, title: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" placeholder="All Products" /></label>
                        <label className="block text-sm font-bold text-gray-700">Shop description<textarea rows="3" value={shopPage.description} onChange={(e) => setShopPage({ ...shopPage, description: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" placeholder="Browse by concern, search, or sort…" /></label>
                        <div className="grid md:grid-cols-2 gap-4"><label className="block text-sm font-bold text-gray-700">Bulk section label<input value={shopPage.bulkEyebrow} onChange={(e) => setShopPage({ ...shopPage, bulkEyebrow: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" /></label><label className="block text-sm font-bold text-gray-700">Bulk section heading<input value={shopPage.bulkTitle} onChange={(e) => setShopPage({ ...shopPage, bulkTitle: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" /></label></div>
                        <label className="block text-sm font-bold text-gray-700">Bulk section description<textarea rows="3" value={shopPage.bulkDescription} onChange={(e) => setShopPage({ ...shopPage, bulkDescription: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" /></label>
                        <div className="grid md:grid-cols-2 gap-4"><label className="block text-sm font-bold text-gray-700">Button text<input value={shopPage.bulkButton} onChange={(e) => setShopPage({ ...shopPage, bulkButton: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" /></label><label className="block text-sm font-bold text-gray-700">Button link<input value={shopPage.bulkLink} onChange={(e) => setShopPage({ ...shopPage, bulkLink: e.target.value })} className="mt-2 w-full border p-3 rounded-xl font-normal" placeholder="/contact" /></label></div>
                        <label className="block text-sm font-bold text-gray-700">Bulk order benefits (one per line)<textarea rows="3" value={(shopPage.bulkBenefits || []).join('\n')} onChange={(e) => setShopPage({ ...shopPage, bulkBenefits: e.target.value.split('\n').filter(Boolean) })} className="mt-2 w-full border p-3 rounded-xl font-normal" /></label>
                        <button type="submit" className="bg-primary text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold"><Save size={20} /> Save Shop Content</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShopPageEdit;
