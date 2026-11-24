import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { compressImage } from '../../utils/imageCompression';
import { Upload, ArrowLeft, Plus, Trash2, Layers, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [mrp, setMrp] = useState(0);
    const [sku, setSku] = useState('');
    const [packSize, setPackSize] = useState('');
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [isBestseller, setIsBestseller] = useState(false);
    const [images, setImages] = useState([]);
    const [benefits, setBenefits] = useState('');
    const [howToUse, setHowToUse] = useState('');
    const [gst, setGst] = useState(0);
    const [weight, setWeight] = useState(0.5);
    const [variants, setVariants] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setName(data.name || '');
                setPrice(data.price || 0);
                setMrp(data.mrp || 0);
                setSku(data.sku || '');
                setPackSize(data.packSize || '');
                setImage(data.image || '');
                setBrand(data.brand || '');
                setCategory(data.category || '');
                setCountInStock(data.countInStock || 0);
                setDescription(data.description || '');
                setBenefits(data.benefits || '');
                setHowToUse(data.howToUse || '');
                setIsBestseller(data.isBestseller || false);
                setImages(data.images || []);
                setGst(data.gst || 0);
                setWeight(data.weight || 0.5);
                setVariants(Array.isArray(data.variants) ? data.variants : []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                if (addToast) addToast('Failed to load product details', 'error');
                setLoading(false);
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id, addToast]);

    // Handle Variant Editing
    const handleVariantChange = (index, field, value) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddVariant = () => {
        const nextMultiplier = variants.length + 1;
        const newId = nextMultiplier === 1 ? 'single' : nextMultiplier === 2 ? 'twin' : nextMultiplier === 3 ? 'triple' : `pack-${nextMultiplier}`;
        const basePrice = Number(price) || 0;
        const baseMrp = Number(mrp) || basePrice || 0;
        const vPrice = basePrice > 0 ? basePrice * nextMultiplier : 0;
        const vMrp = baseMrp > 0 ? baseMrp * nextMultiplier : vPrice;

        setVariants(prev => [
            ...prev,
            {
                id: newId,
                name: `${nextMultiplier} Pack (${packSize || 'Standard'})`,
                sku: `${sku || 'HRV'}-${nextMultiplier}PK`,
                price: vPrice,
                mrp: vMrp,
                stock: Math.floor((Number(countInStock) || 100) / nextMultiplier),
                multiplier: nextMultiplier,
            }
        ]);
    };

    const handleRemoveVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateStandardPacks = () => {
        const basePrice = Number(price) || 0;
        const baseMrp = Number(mrp) || basePrice || 999;
        const baseStock = Number(countInStock) || 0;
        const baseSku = sku || 'HVD-PRD';
        const label = packSize ? ` (${packSize})` : '';

        const standard = [
            {
                id: 'single',
                name: `1 Pack${label}`,
                sku: `${baseSku}-1PK`,
                price: basePrice > 0 ? basePrice : Math.round(baseMrp * 0.95),
                mrp: baseMrp,
                stock: baseStock,
                multiplier: 1,
            },
            {
                id: 'twin',
                name: `2 Pack (2x${packSize || '15ml'})`,
                sku: `${baseSku}-2PK`,
                price: Math.round((baseMrp * 2) * 0.90),
                mrp: baseMrp * 2,
                stock: Math.floor(baseStock / 2),
                multiplier: 2,
            },
            {
                id: 'triple',
                name: `3 Pack (3x${packSize || '15ml'})`,
                sku: `${baseSku}-3PK`,
                price: Math.round((baseMrp * 3) * 0.85),
                mrp: baseMrp * 3,
                stock: Math.floor(baseStock / 3),
                multiplier: 3,
            }
        ];
        setVariants(standard);
        if (addToast) addToast('Generated standard 1-Pack, 2-Pack, and 3-Pack variations!', 'info');
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1600 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            setImage(data);
            setUploading(false);
            if (addToast) addToast('Main image uploaded successfully', 'success');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed. If the image is very large, try a smaller one.');
            setUploading(false);
        }
    };

    const uploadMultipleHandler = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        if (files.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            for (const file of files) {
                const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1200 });
                formData.append('images', compressedFile);
            }

            const { data } = await api.post('/upload/multiple', formData);
            setImages(data);
            setUploading(false);
            if (addToast) addToast('Gallery images uploaded successfully', 'success');
        } catch (error) {
            console.error('Multiple upload failed:', error);
            alert('Multiple images upload failed. Try uploading fewer or smaller images.');
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Format and clean variants
            const cleanVariants = variants.map(v => ({
                id: String(v.id || '').trim().toLowerCase(),
                name: String(v.name || '').trim(),
                sku: String(v.sku || '').trim(),
                price: Number(v.price) || 0,
                mrp: Number(v.mrp) || Number(v.price) || 0,
                stock: Number(v.stock) || 0,
                multiplier: Number(v.multiplier) || 1,
            })).filter(v => v.id && v.name && v.price > 0);

            await api.put(`/products/${id}`, {
                name,
                price: Number(price) || 0,
                mrp: Number(mrp) || Number(price) || 0,
                sku,
                packSize,
                image,
                brand,
                category,
                description,
                countInStock: Number(countInStock) || 0,
                isBestseller,
                images,
                benefits,
                howToUse,
                gst: Number(gst) || 0,
                weight: Number(weight) || 0.5,
                variants: cleanVariants,
            });

            if (addToast) addToast('Product and variations updated successfully!', 'success');
            navigate('/admin/productlist');
        } catch (error) {
            console.error('Update error:', error);
            alert(error.response?.data?.message || 'Error updating product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 font-bold">Loading Product Details...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/admin/productlist" className="text-gray-500 hover:text-primary mb-6 flex items-center gap-2 transition-colors font-bold text-xs uppercase tracking-wider">
                <ArrowLeft size={16} /> Back to Products List
            </Link>

            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Edit Product & Variations</h1>
                        <p className="text-xs text-gray-500 mt-1">Configure formulation details, individual bundle pricing, and pack variations.</p>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-100 self-start sm:self-auto">
                        ID: {id?.slice(-8)}
                    </span>
                </div>

                <form onSubmit={submitHandler} className="space-y-8">
                    {/* General Information Section */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
                            <span>General Information</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Hridved Suvrnaprasan Drop 15ml"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Base SKU</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. HVD-SUV-15ML"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pack Size / Volume</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={packSize}
                                    onChange={(e) => setPackSize(e.target.value)}
                                    placeholder="e.g. 15ml, 100gm, 60 Tablets"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary transition-all bg-white text-sm font-medium"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Brand</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="e.g. Hridved Herbals"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Base Pricing & Stock */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4">Base Pricing & Stock</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-bold text-gray-900"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">MRP (Original ₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-bold text-gray-900"
                                    value={mrp}
                                    onChange={(e) => setMrp(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Count In Stock</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl">
                            <input
                                type="checkbox"
                                id="isBestseller"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                checked={isBestseller}
                                onChange={(e) => setIsBestseller(e.target.checked)}
                            />
                            <label htmlFor="isBestseller" className="text-xs font-bold text-gray-800 cursor-pointer">
                                Mark as Bestseller Formulation (Displays Bestseller ribbon on store)
                            </label>
                        </div>
                    </div>

                    {/* ========================================================
                        ⭐ PRODUCT VARIATIONS & BUNDLE PACKS SECTION
                    ======================================================== */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                                    <Layers size={20} className="text-secondary" />
                                    <span>Product Variations & Bundle Packs</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Configure pack options (e.g. 1 Pack, 2 Pack, 3 Pack) with custom pricing, discounts, and inventory.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleGenerateStandardPacks}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer"
                                    title="Auto-calculate 1-Pack (5%), 2-Pack (10%), and 3-Pack (15%)"
                                >
                                    <Sparkles size={14} className="text-amber-600" />
                                    <span>Auto-Generate 1, 2, 3 Packs</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddVariant}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Add Variation</span>
                                </button>
                            </div>
                        </div>

                        {variants.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                    No custom variations configured for this product.
                                </p>
                                <p className="text-[11px] text-gray-400 max-w-md mx-auto mb-4">
                                    The store will display the base price. Click "Auto-Generate 1, 2, 3 Packs" to automatically create 1-Pack (5% off), 2-Pack (10% off), and 3-Pack (15% off) tiers.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleGenerateStandardPacks}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-primary border border-gray-300 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                >
                                    <Sparkles size={14} className="text-secondary" />
                                    <span>Generate Standard Packs Now</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {variants.map((v, index) => {
                                    const vPrice = Number(v.price) || 0;
                                    const vMrp = Number(v.mrp) || vPrice;
                                    const savings = Math.max(0, vMrp - vPrice);
                                    const discountPct = vMrp > 0 ? Math.round((savings / vMrp) * 100) : 0;

                                    return (
                                        <div key={index} className="p-4 sm:p-5 bg-[#FDFBF7] rounded-2xl border border-accent/40 shadow-xs relative">
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-accent/20">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                                        {v.name || `Variant ${index + 1}`}
                                                    </span>
                                                    {savings > 0 && (
                                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                                                            {discountPct}% OFF (Save ₹{savings})
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Remove this variation"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                                                {/* Variant ID */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        ID / Key
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-bold text-gray-700 bg-white"
                                                        value={v.id || ''}
                                                        onChange={(e) => handleVariantChange(index, 'id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                                        placeholder="single, twin, triple"
                                                    />
                                                </div>

                                                {/* Variant Name */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        Display Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white"
                                                        value={v.name || ''}
                                                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                        placeholder="e.g. 2 Pack (2x15ml)"
                                                    />
                                                </div>

                                                {/* Variant SKU */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        SKU
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white"
                                                        value={v.sku || ''}
                                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                        placeholder="e.g. HRV-2PK"
                                                    />
                                                </div>

                                                {/* Selling Price */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                                                        Price (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-bold text-emerald-800 bg-white"
                                                        value={v.price ?? ''}
                                                        onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                                    />
                                                </div>

                                                {/* MRP */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                                                        MRP (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-bold text-gray-500 bg-white"
                                                        value={v.mrp ?? ''}
                                                        onChange={(e) => handleVariantChange(index, 'mrp', Number(e.target.value))}
                                                    />
                                                </div>

                                                {/* Multiplier / Stock */}
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        Units (Pack)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white"
                                                        value={v.multiplier || 1}
                                                        onChange={(e) => handleVariantChange(index, 'multiplier', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Media & Images */}
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4">Media & Images</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Main Product Image URL</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium mb-2"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    id="image-file"
                                    className="hidden"
                                    onChange={uploadFileHandler}
                                />
                                <label htmlFor="image-file" className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2.5 px-4 rounded-xl border border-gray-200 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                                    <Upload size={15} /> {uploading ? 'Compressing & Uploading...' : 'Upload Primary Image'}
                                </label>
                                {image && (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        <Check size={14} /> Image Attached
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Additional Gallery Images (Max 5)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium mb-2"
                                value={images.join(', ')}
                                onChange={(e) => setImages(e.target.value.split(',').map(url => url.trim()))}
                                placeholder="Comma-separated image URLs"
                            />
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    id="multiple-images-file"
                                    className="hidden"
                                    multiple
                                    onChange={uploadMultipleHandler}
                                />
                                <label htmlFor="multiple-images-file" className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2.5 px-4 rounded-xl border border-gray-200 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                                    <Upload size={15} /> Upload Gallery Images
                                </label>
                                {images.length > 0 && (
                                    <span className="text-xs text-gray-500 font-bold">
                                        {images.length} gallery image(s) uploaded
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Content */}
                    <div className="pt-6 border-t border-gray-200 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Formulation Details</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Therapeutic Benefits</label>
                            <textarea
                                rows="4"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                value={benefits}
                                onChange={(e) => setBenefits(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">How To Use / Dosage</label>
                            <textarea
                                rows="4"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                value={howToUse}
                                onChange={(e) => setHowToUse(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">GST Rate (%)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={gst}
                                    onChange={(e) => setGst(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Shipping Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                        <Link
                            to="/admin/productlist"
                            className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-primary hover:bg-opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? 'Saving Changes...' : 'Save Product & Variations'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditPage;
