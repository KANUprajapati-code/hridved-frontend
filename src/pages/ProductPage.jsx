import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Star, Truck, ShieldCheck, ShoppingCart, Clock, Heart, Zap, 
    ChevronRight, CheckCircle2, AlertCircle, Share2, 
    Sparkles, Leaf, Award, Stethoscope, Building2,
    FileText, HelpCircle, FileCheck, ChevronDown, ChevronUp, Lock,
    Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ToastContext } from '../context/ToastContext';
import ImageZoom from '../components/ImageZoom';
import PincodeShippingCheck from '../components/PincodeShippingCheck';
import QuantitySelector from '../components/QuantitySelector';
import Badge from '../components/Badge';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import { useFlyingElement } from '../hooks/useFlyingElement';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';
import BulkEnquiryModal from '../components/BulkEnquiryModal';
import { trackLeadEvent } from '../utils/tracking';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [qty, setQty] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState('single');
    const [activeTab, setActiveTab] = useState('description');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isAddedState, setIsAddedState] = useState(false);

    const { addToCart, openCartDrawer } = useCart();
    const { user, openAuthModal } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product?._id);
    const { addToast } = useContext(ToastContext) || {};
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);

    // Fetch product details & related items
    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
            setLoading(false);

            // Fetch related products from the same category in background
            try {
                const { data: allProductsData } = await api.get(`/products?category=${encodeURIComponent(data.category || '')}&limit=5`);
                const productsList = allProductsData.products || allProductsData || [];
                const filtered = productsList
                    .filter(p => p._id !== data._id)
                    .slice(0, 4);
                setRelatedProducts(filtered);
            } catch (err) {
                console.debug("Related products fetch skipped", err);
            }
        } catch (error) {
            console.error("Error fetching product", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product?._id) {
            trackWebsiteEvent('view_item', {
                productId: product._id,
                product: product,
                name: product.name,
                price: Number(product.price) || 0,
                category: product.category,
            });
        }
    }, [product?._id]);

    // Dynamic Pack / Variant calculation based on product data
    const variants = useMemo(() => {
        if (!product) return [];
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            return product.variants.map((v) => {
                const vPrice = Number(v.price) || 0;
                const vMrp = Number(v.mrp) || vPrice;
                const vSavings = vMrp > vPrice ? vMrp - vPrice : 0;
                const vDiscountPct = vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0;
                const short = v.id === 'single' ? '1 Pack (15ml)' : v.id === 'twin' ? '2 Pack (2x15ml)' : v.id === 'triple' ? '3 Pack (3x15ml)' : (v.shortName || v.name);
                return {
                    id: v.id,
                    name: v.name,
                    shortName: short,
                    multiplier: v.multiplier || (v.id === 'triple' ? 3 : v.id === 'twin' ? 2 : 1),
                    price: vPrice,
                    mrp: vMrp,
                    sku: v.sku || `${product.sku || 'HRV'}-${v.id}`,
                    stock: v.stock ?? Math.floor((product.countInStock || 100) / (v.multiplier || 1)),
                    badge: `${vDiscountPct}% OFF`,
                    savings: vSavings,
                    discountPct: vDiscountPct,
                };
            });
        }

        const baseMrp = Number(product.mrp) || 999;
        const baseStock = Number(product.countInStock) || 0;
        const idSuffix = (product._id || '').slice(-6).toUpperCase();
        const packLabel = product.packSize ? ` (${product.packSize})` : '';

        // Standard pack calculations:
        // Variant 1: 5% OFF (MRP 999 -> 949)
        const singlePrice = product.price && Number(product.price) < baseMrp ? Number(product.price) : Math.round(baseMrp * 0.95);
        const singleSavings = baseMrp - singlePrice;
        const singleDiscountPct = Math.round((singleSavings / baseMrp) * 100);

        // Variant 2: 10% OFF (MRP 1998 -> 1798)
        const twinMrp = baseMrp * 2;
        const twinPrice = Math.round(twinMrp * 0.90);
        const twinSavings = twinMrp - twinPrice;
        const twinDiscountPct = 10;

        // Variant 3: 15% OFF (MRP 2997 -> 2547)
        const tripleMrp = baseMrp * 3;
        const triplePrice = Math.round(tripleMrp * 0.85);
        const tripleSavings = tripleMrp - triplePrice;
        const tripleDiscountPct = 15;

        return [
            {
                id: 'single',
                name: `Standard Pack${packLabel}`,
                shortName: '1 Pack (15ml)',
                multiplier: 1,
                price: singlePrice,
                mrp: baseMrp,
                sku: product.sku || `HRV-${idSuffix}-1PK`,
                stock: baseStock,
                badge: `${singleDiscountPct}% OFF`,
                savings: singleSavings,
                discountPct: singleDiscountPct,
            },
            {
                id: 'twin',
                name: `Double Value Pack (2x ${product.packSize || '15ml'})`,
                shortName: '2 Pack (2x15ml)',
                multiplier: 2,
                price: twinPrice,
                mrp: twinMrp,
                sku: `${product.sku || `HRV-${idSuffix}`}-2PK`,
                stock: Math.floor(baseStock / 2),
                badge: '10% OFF',
                savings: twinSavings,
                discountPct: twinDiscountPct,
            },
            {
                id: 'triple',
                name: `3-Month Treatment Course (3x ${product.packSize || '15ml'})`,
                shortName: '3 Pack (3x15ml)',
                multiplier: 3,
                price: triplePrice,
                mrp: tripleMrp,
                sku: `${product.sku || `HRV-${idSuffix}`}-3PK`,
                stock: Math.floor(baseStock / 3),
                badge: '15% OFF',
                savings: tripleSavings,
                discountPct: tripleDiscountPct,
            },
        ];
    }, [product]);

    // Active variant object
    const activeVariant = useMemo(() => {
        if (!variants || variants.length === 0) {
            const vPrice = Number(product?.price) || 949;
            const vMrp = Number(product?.mrp) || 999;
            const vSavings = vMrp > vPrice ? vMrp - vPrice : 0;
            const vDiscountPct = vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0;
            return {
                id: 'single',
                name: 'Standard Pack',
                shortName: '1 Pack (15ml)',
                price: vPrice,
                mrp: vMrp,
                sku: product?.sku || `HRV-${(product?._id || '').slice(-6).toUpperCase()}-1PK`,
                stock: product?.countInStock || 0,
                savings: vSavings,
                discountPct: vDiscountPct,
            };
        }
        return variants.find(v => v.id === selectedVariantId) || variants[0];
    }, [variants, selectedVariantId, product]);

    // Clamp quantity if variant stock changes
    const handleVariantChange = (variantId) => {
        setSelectedVariantId(variantId);
        const target = variants.find(v => v.id === variantId);
        if (target && target.stock > 0 && qty > target.stock) {
            setQty(target.stock);
        }
    };

    // Native Share / Copy Link
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            if (addToast) addToast('Product link copied to clipboard!', 'success');
        }
    };

    // Submit Customer Review
    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            if (addToast) addToast('Please select a star rating', 'error');
            return;
        }

        try {
            setReviewLoading(true);
            await api.post(`/products/${id}/reviews`, { rating, comment });
            if (addToast) addToast('Review submitted successfully!', 'success');
            setRating(5);
            setComment('');
            fetchProduct();
        } catch (error) {
            if (addToast) addToast(error.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setReviewLoading(false);
        }
    };

    // Build payload for cart with selected variant consistency
    const getCartPayload = () => {
        const isSingle = activeVariant.id === 'single';
        return {
            ...product,
            name: isSingle ? product.name : `${product.name} (${activeVariant.shortName})`,
            price: activeVariant.price,
            mrp: activeVariant.mrp,
            sku: activeVariant.sku,
            variantId: activeVariant.id,
            selectedVariant: activeVariant.shortName || activeVariant.name,
            countInStock: activeVariant.stock,
        };
    };

    // Add To Cart handler
    const handleAddToCart = () => {
        const item = getCartPayload();
        
        // Trigger flying animation
        const cartIcon = document.getElementById('cart-icon-container');
        if (imageRef.current) {
            animateAddToCart(imageRef.current, cartIcon, product.image);
        }

        setIsAddedState(true);
        setTimeout(() => setIsAddedState(false), 1500);

        addToCart(item, qty);
        trackLeadEvent({ actionType: 'add_to_cart', product: item });
        if (addToast) addToast(`Added ${item.name} (x${qty}) to cart!`, 'success');
        if (openCartDrawer) openCartDrawer();
    };

    // Buy Now handler
    const handleBuyNow = () => {
        const item = getCartPayload();
        addToCart(item, qty);
        trackLeadEvent({ actionType: 'buy_now', product: item });
        navigate('/checkout/address');
    };

    // Vaidya WhatsApp Consultation link
    const handleVaidyaConsult = () => {
        trackWebsiteEvent('whatsapp_click', {
            productId: product?._id,
            name: product?.name,
            price: Number(activeVariant?.price || product?.price) || 0,
        });
        const message = encodeURIComponent(
            `Namaste Hridved Vaidya, I am reviewing "${product.name}" (${activeVariant.name}, ₹${activeVariant.price}). Can you please guide me on its dosage, classical anupana, and suitability for my health concerns?`
        );
        window.open(`https://wa.me/917990934095?text=${message}`, '_blank', 'noopener,noreferrer');
    };

    // Render skeleton placeholder during loading
    if (loading) {
        return (
            <div className="bg-[#FDFBF7] min-h-screen py-10 animate-pulse">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="bg-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="aspect-square bg-gray-200 rounded-2xl w-full"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-9 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-36"></div>
                            <div className="h-10 bg-gray-200 rounded w-48"></div>
                            <div className="h-16 bg-gray-200 rounded w-full"></div>
                            <div className="h-24 bg-gray-200 rounded w-full"></div>
                            <div className="h-12 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-secondary mb-4" />
                <h2 className="text-2xl font-serif font-bold text-primary mb-2">Formulation Not Found</h2>
                <p className="text-gray-600 mb-6 max-w-md font-body">The remedy you are looking for may have been archived or is temporarily out of catalogue.</p>
                <Link to="/shop" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-sm">
                    Return to Apothecary
                </Link>
            </div>
        );
    }

    const isOutOfStock = activeVariant.stock === 0;
    const hasGenuineReviews = Boolean(product.numReviews && product.numReviews > 0);

    const productBreadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Apothecary', path: '/shop' },
        { name: product.category || 'Ayurvedic Formulations', path: `/shop?category=${encodeURIComponent(product.category || '')}` },
        { name: product.name, path: `/product/${product._id}` }
    ];

    // Information tabs configuration
    const tabs = [
        { id: 'description', label: 'Formulation Overview' },
        { id: 'ingredients', label: 'Ingredients & Botanicals' },
        { id: 'usage', label: 'Directions & Safety' },
        { id: 'documents', label: 'Lab Reports & Quality' },
        { id: 'faqs', label: 'Product FAQs' },
    ];

    const manufacturer = product.manufacturerDetails || {
        name: 'HRIDVED HERBALS PRIVATE LIMITED',
        address: 'Vedic Wellness Campus, Gandhinagar, Gujarat - 382010, India',
        ayushLicense: 'GA/AYU/108-A',
        fssaiLicense: '10722031000456',
        countryOfOrigin: 'India',
        customerCare: '+91 79909 34095 | care@hridved.com'
    };

    return (
        <AnimatedPage>
            <SEO 
                title={`${product.name} | Hridved Authentic Ayurveda`}
                description={product.description}
                ogImage={product.image}
                ogType="product"
                product={product}
                breadcrumbs={productBreadcrumbs}
            />

            <div className="bg-[#FDFBF7] min-h-screen pb-16 font-body">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    
                    {/* Breadcrumbs Navigation */}
                    <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap py-1">
                        <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        <Link to="/shop" className="hover:text-primary transition-colors font-medium">Apothecary</Link>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors font-medium text-secondary">
                            {product.category}
                        </Link>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</span>
                    </nav>

                    {/* Main Product Stage */}
                    <div className="bg-white rounded-3xl shadow-sm border border-accent/40 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            
                            {/* Left Column: Image Zoom Gallery */}
                            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-start border-b lg:border-b-0 lg:border-r border-accent/30 bg-[#FDFBF7]/40 relative" ref={imageRef}>
                                <div className="sticky top-24">
                                    <div className="relative">
                                        <ImageZoom
                                            images={
                                                product.images && product.images.length > 0
                                                    ? [product.image, ...product.images]
                                                    : [product.image]
                                            }
                                        />
                                        
                                        {/* Floating Trust Badges on Image */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
                                            {product.isBestseller && (
                                                <Badge variant="gold" size="xs">
                                                    ★ Vaidya Choice
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" size="xs">
                                                100% Shuddha
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Action Utilities (Share & Wishlist) */}
                                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-accent/30 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck size={16} className="text-primary" />
                                            <span className="font-medium text-gray-700">Lab Tested for Heavy Metals (API Compliant)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={handleShare}
                                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition cursor-pointer"
                                                title="Share Product"
                                                aria-label="Share Product"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => toggleWishlist(product)}
                                                className={`p-2 rounded-full hover:bg-gray-100 transition cursor-pointer ${isWishlisted ? 'text-rose-600' : 'text-gray-400 hover:text-rose-500'}`}
                                                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                                                aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                                            >
                                                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Formulation Details & Purchase Stack */}
                            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                <div>
                                    {/* Category, Pack Size & SKU Header */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Link 
                                            to={`/shop?category=${encodeURIComponent(product.category)}`}
                                            className="text-xs uppercase font-bold tracking-widest text-secondary hover:underline underline-offset-2"
                                        >
                                            {product.category}
                                        </Link>

                                        {product.packSize && (
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                                Pack: {product.packSize}
                                            </span>
                                        )}

                                        <span className="text-[11px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 ml-auto">
                                            SKU: {activeVariant.sku || product.sku}
                                        </span>
                                    </div>

                                    {/* Product Title */}
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary mb-3 leading-tight tracking-tight">
                                        {product.name}
                                    </h1>

                                    {/* Classical Ayurveda Trust Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle2 size={12} className="text-emerald-700" />
                                            <span>100% Classical Ayurveda</span>
                                        </span>
                                        <span className="text-[11px] text-gray-500 font-medium">
                                            Lab Tested & AYUSH Certified
                                        </span>
                                    </div>

                                    {/* Child Age Guidance Banner (for Child Care products) */}
                                    {product.childAgeGuidance && (
                                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 sm:p-4 mb-4 text-xs text-amber-900 flex items-start gap-2.5">
                                            <span className="text-lg shrink-0">👶</span>
                                            <div>
                                                <strong className="font-bold text-amber-950 block mb-0.5">Approved Age Guidance & Bal Sanskar Advice:</strong>
                                                <p className="leading-relaxed text-amber-800">{product.childAgeGuidance}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Classical Claim Reference Badge */}
                                    <div className="mb-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDFBF7] rounded-xl border border-accent/40 text-[10px] text-gray-600">
                                            <ShieldCheck size={13} className="text-primary shrink-0" />
                                            <span><strong>Classical Reference:</strong> {product.evidenceReference || 'Ayurvedic Pharmacopoeia of India (API)'}</span>
                                        </div>
                                    </div>

                                    {/* Pricing & Savings Display */}
                                    <div className="bg-[#FDFBF7] border border-accent/40 rounded-2xl p-4 sm:p-5 mb-6">
                                        <div className="flex flex-wrap items-baseline gap-3">
                                            <span className="text-3xl sm:text-4xl font-sans font-black text-primary">
                                                ₹{activeVariant.price}
                                            </span>
                                            {activeVariant.mrp > activeVariant.price && (
                                                <span className="text-lg sm:text-xl text-gray-400 line-through font-medium">
                                                    ₹{activeVariant.mrp}
                                                </span>
                                            )}
                                            {activeVariant.discountPct > 0 && (
                                                <Badge variant="discount" size="sm">
                                                    {activeVariant.discountPct}% OFF
                                                </Badge>
                                            )}
                                        </div>

                                        {activeVariant.savings > 0 && (
                                            <p className="text-xs font-semibold text-emerald-800 mt-2 flex items-center gap-1.5">
                                                <Sparkles size={14} className="text-secondary" />
                                                You save ₹{activeVariant.savings} on this classical formulation
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-accent/30">
                                            <span>Inclusive of all statutory taxes & GST</span>
                                            {isOutOfStock ? (
                                                <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px]">
                                                    Out of Stock • Classical Batch in Preparation
                                                </span>
                                            ) : activeVariant.stock <= 5 ? (
                                                <span className="text-amber-900 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 text-[11px] flex items-center gap-1.5 animate-pulse">
                                                    <Clock size={12} className="text-amber-700" />
                                                    Only {activeVariant.stock} units remaining in fresh batch
                                                </span>
                                            ) : (
                                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 size={13} />
                                                    {activeVariant.stock <= 10 
                                                        ? `Limited Batch: ${activeVariant.stock} left in stock` 
                                                        : 'Fresh Batch In Stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pack Size / Variant Selector */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-primary">
                                                Select Pack Size / Treatment Course:
                                            </label>
                                            <span className="text-xs text-secondary font-medium font-serif">
                                                {activeVariant.name}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            {variants.map((v) => {
                                                const isSelected = v.id === selectedVariantId;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => handleVariantChange(v.id)}
                                                        className={`relative text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                                            isSelected 
                                                                ? 'border-primary bg-primary/5 shadow-xs' 
                                                                : 'border-gray-200 hover:border-accent bg-white'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-start justify-between gap-1 mb-1">
                                                                <span className="text-xs font-bold text-gray-900 leading-tight">
                                                                    {v.shortName}
                                                                </span>
                                                                {v.badge && (
                                                                    <span className="bg-[#fbbf24] text-gray-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                                                                        {v.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                                {v.id === 'single' ? 'Standard Pack' : v.id === 'twin' ? 'Sustained Course' : 'Holistic Healing'}
                                                            </div>
                                                        </div>
                                                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-baseline justify-between">
                                                            <span className="font-bold text-primary text-sm">
                                                                ₹{v.price}
                                                            </span>
                                                            {v.mrp > v.price && (
                                                                <span className="text-[10px] text-gray-400 line-through">
                                                                    ₹{v.mrp}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Short Ayurvedic Description */}
                                    <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
                                        {product.description}
                                    </p>

                                    {/* Quantity & Core Action CTAs */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                            {/* Tactile Quantity Selector */}
                                            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
                                                <span className="text-xs font-bold text-gray-600 sm:hidden">Quantity:</span>
                                                <QuantitySelector
                                                    value={qty}
                                                    onChange={setQty}
                                                    min={1}
                                                    max={Math.min(activeVariant.stock || 10, 10)}
                                                    disabled={isOutOfStock}
                                                    size="md"
                                                />
                                            </div>

                                            {/* Action Buttons: Add To Cart & Buy Now */}
                                            <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-w-0">
                                                {/* Add To Cart */}
                                                <button
                                                    type="button"
                                                    onClick={handleAddToCart}
                                                    disabled={isOutOfStock}
                                                    className={`h-12 flex-1 min-w-0 rounded-2xl font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm px-2 sm:px-4 cursor-pointer text-center ${
                                                        isAddedState
                                                            ? 'bg-emerald-700 text-white border-2 border-emerald-700'
                                                            : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isAddedState ? (
                                                        <>
                                                            <CheckCircle2 size={16} className="text-secondary shrink-0" />
                                                            <span className="truncate">Added! ✓</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={16} className="shrink-0" />
                                                            <span className="truncate">Add to Cart</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Direct Buy Now */}
                                                <button
                                                    type="button"
                                                    onClick={handleBuyNow}
                                                    disabled={isOutOfStock}
                                                    className="h-12 flex-1 min-w-0 bg-gradient-to-r from-secondary to-[#c59e2b] text-primary rounded-2xl font-bold hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-4 cursor-pointer text-center"
                                                >
                                                    <Zap size={16} className="shrink-0 fill-current" />
                                                    <span className="truncate">Buy Now</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vaidya WhatsApp Consultation Prompt */}
                                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Stethoscope size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-primary">Unsure if this fits your Prakriti?</h4>
                                                <p className="text-[11px] text-gray-600">Consult our certified Ayurvedic Vaidya for personalized dosage and anupana guidance.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleVaidyaConsult}
                                            className="w-full sm:w-auto px-4 py-2 bg-primary text-secondary text-xs font-bold rounded-xl hover:bg-primary/90 transition shadow-xs shrink-0 cursor-pointer text-center flex items-center justify-center"
                                        >
                                            <span>Ask Vaidya</span>
                                        </button>
                                    </div>

                                    {/* Live Pincode Delivery Serviceability Check */}
                                    <div className="mb-4">
                                        <PincodeShippingCheck productPrice={activeVariant.price} />
                                    </div>

                                    {/* Shipping & Delivery Summary Block */}
                                    <div className="bg-white border border-accent/40 rounded-2xl p-3.5 sm:p-4 mb-4 space-y-2 text-xs text-gray-600 shadow-2xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                                <Truck size={14} className="text-primary" />
                                                Courier Delivery Timeline:
                                            </span>
                                            <span className="text-emerald-700 font-semibold">3 - 5 Business Days Pan-India</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                            <span>Shipping Policy:</span>
                                            <span className="font-medium text-gray-700">Free courier shipping on orders ₹999+</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                            <span>Packaging Standard:</span>
                                            <span className="font-medium text-gray-700">Tamper-evident glass bottle with safety seal</span>
                                        </div>
                                    </div>

                                    {/* Practitioner / Clinic Bulk Wholesale Banner */}
                                    <div className="bg-[#FDFBF7] border border-accent/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-primary">Clinic & Practitioner Wholesale</h4>
                                                <p className="text-[11px] text-gray-600">Institutional orders & volume rates for registered clinics.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsBulkModalOpen(true)}
                                            className="w-full sm:w-auto px-4 py-2 bg-white text-primary border border-primary/40 text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition shadow-xs shrink-0 cursor-pointer text-center flex items-center justify-center"
                                        >
                                            <span>Bulk Enquiry</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reusable Product Information Tabs (Prompt 07 Spec) */}
                    <div id="product-information-tabs" className="mt-12 bg-white rounded-3xl shadow-sm border border-accent/40 p-6 sm:p-8 lg:p-10">
                        {/* Tab Headers */}
                        <div className="flex border-b border-accent/30 mb-8 overflow-x-auto no-scrollbar gap-2 sm:gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer border-b-2 text-center flex items-center justify-center shrink-0 ${
                                        activeTab === tab.id
                                            ? 'text-primary border-primary'
                                            : 'text-gray-400 border-transparent hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Contents */}
                        <div className="text-gray-700 leading-relaxed font-body">
                            
                            {/* Tab 1: Formulation Overview */}
                            {activeTab === 'description' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-primary mb-3">Authentic Ayurvedic Heritage</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Classical Evidence Box */}
                                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-accent/40 flex items-start gap-3">
                                        <ShieldCheck className="text-primary shrink-0 mt-1" size={20} />
                                        <div className="text-xs">
                                            <h5 className="font-bold text-primary text-sm mb-1">Classical Formulary & Evidence Standard</h5>
                                            <p className="text-gray-600 leading-relaxed">
                                                Formulated according to classical authoritative Samhitas: <em>{product.evidenceReference || 'Ayurvedic Pharmacopoeia of India (API)'}</em>. 
                                                Prepared under non-diagnostic AYUSH wellness guidelines to nourish natural biological balance (Tridosha Samya).
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3 Pillars */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                                        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-gray-100 bg-[#FDFBF7]/50">
                                            <Leaf className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">100% Shuddha Botanicals</h5>
                                                <p className="text-gray-500 mt-0.5">Crafted exclusively from authentic herbs harvested at peak potency from native Indian biotopes.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-gray-100 bg-[#FDFBF7]/50">
                                            <Clock className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">Classical Bhavana Extraction</h5>
                                                <p className="text-gray-500 mt-0.5">Slow-simmered over days according to Samhita protocols for maximum bio-assimilation.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-gray-100 bg-[#FDFBF7]/50">
                                            <Award className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">GMP Manufacturing</h5>
                                                <p className="text-gray-500 mt-0.5">Manufactured in certified Ayurvedic facilities with strict standard operating procedures.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Ingredients & Botanicals */}
                            {activeTab === 'ingredients' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-primary mb-2">Classical Botanical Composition</h3>
                                        <p className="text-xs text-gray-500 mb-4">Complete honest disclosure of pure whole herbs and classical carriers. Zero hidden fillers or synthetic additives.</p>
                                        
                                        <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-accent/40 text-sm leading-relaxed text-gray-800">
                                            <strong className="block text-primary font-bold text-xs uppercase tracking-wider mb-2">Ingredients (Classical Formulation):</strong>
                                            {product.ingredients || "100% Classical whole Ayurvedic herbs and pure cold-pressed oils prepared in strict accordance with classical Samhita guidelines."}
                                        </div>
                                    </div>

                                    {/* Key Herbs Highlight */}
                                    {product.keyIngredients && product.keyIngredients.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Key Herb Profiles:</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {product.keyIngredients.map((herb, index) => (
                                                    <div key={index} className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                                                            <Leaf size={15} />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-800">{herb}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 72-Hour Copper Infusion Standard */}
                                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/15 flex items-start gap-3.5">
                                        <Sparkles className="text-secondary shrink-0 mt-1" size={22} />
                                        <div className="text-xs">
                                            <h5 className="font-bold text-primary text-sm mb-1">72-Hour Copper Vessel Infusion Guarantee</h5>
                                            <p className="text-gray-600 leading-relaxed">
                                                In accordance with ancient Rasa Shastra traditions, Hridved herbal formulations are rested in purified copper vessels (Tamra Patra) for 72 hours. This naturally imparts beneficial micronutrients, supports biological stability, and enhances cellular bio-availability without synthetic preservatives.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Directions & Safety */}
                            {activeTab === 'usage' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-serif font-bold text-primary">Recommended Usage & Safety Guidelines</h3>
                                    
                                    {/* How to Use Box */}
                                    <div className="bg-[#FDFBF7] border border-accent/40 p-5 rounded-2xl flex items-start gap-4">
                                        <Clock className="text-secondary shrink-0 mt-1" size={24} />
                                        <div className="text-sm">
                                            <h4 className="font-bold text-primary text-base mb-1">Dosage & Anupana (Carrier Vehicle)</h4>
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                                {product.howToUse || "Take as recommended on label or as advised by your Ayurvedic physician. For oral formulations, take with lukewarm water, pure A2 cow milk, or raw organic honey as appropriate."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Child age guidance if present */}
                                    {product.childAgeGuidance && (
                                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                                            <strong className="font-bold text-amber-950 block mb-1">Pediatric Guidance:</strong>
                                            <p className="leading-relaxed">{product.childAgeGuidance}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        {/* Precautions */}
                                        <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30">
                                            <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold">
                                                <AlertCircle size={16} />
                                                <h5>Precautions & Contraindications</h5>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">
                                                {product.precautions || "Consult an Ayurvedic physician prior to use if pregnant, lactating, taking prescription medicines, or experiencing acute illness. Do not exceed suggested serving."}
                                            </p>
                                        </div>

                                        {/* Storage */}
                                        <div className="p-5 rounded-2xl border border-gray-100 bg-[#FDFBF7]">
                                            <div className="flex items-center gap-2 mb-2 text-primary font-bold">
                                                <Lock size={16} />
                                                <h5>Storage Instructions</h5>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">
                                                {product.storage || "Store in a cool, dry place away from direct sunlight, moisture, and excessive heat. Keep container tightly sealed after each use. Do not refrigerate."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Lab Reports & Quality */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-primary mb-2">Triple-Tier Quality Screening & NABL Lab Verification</h3>
                                        <p className="text-xs text-gray-500 mb-6">Every production batch is tested in NABL-accredited analytical laboratories to confirm compliance with Ayurvedic Pharmacopoeia of India (API) standards.</p>
                                    </div>

                                    {/* Test Parameters Overview */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <ShieldCheck size={26} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-xs">Heavy Metal Tested</h5>
                                            <p className="text-[11px] text-gray-500 mt-1">Lead, Mercury, Arsenic & Cadmium strictly within API limits.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Leaf size={26} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-xs">Microbial Purity</h5>
                                            <p className="text-[11px] text-gray-500 mt-1">Screened for E. coli, Salmonella, Yeast, and Molds.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Award size={26} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-xs">Aflatoxin & Pesticide Free</h5>
                                            <p className="text-[11px] text-gray-500 mt-1">Zero chemical residues or agricultural contaminants.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Sparkles size={26} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-xs">GMP Clean-Room</h5>
                                            <p className="text-[11px] text-gray-500 mt-1">Formulated in licensed Ayurvedic pharmaceutical facility.</p>
                                        </div>
                                    </div>

                                    {/* Database-Driven Verified Documents */}
                                    {product.verifiedDocuments && product.verifiedDocuments.length > 0 && (
                                        <div className="pt-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Batch Verification Documents:</h4>
                                            <div className="space-y-3">
                                                {product.verifiedDocuments.map((doc, idx) => (
                                                    <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-[#FDFBF7] flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                <FileCheck size={18} />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-800">{doc.title}</h5>
                                                                <p className="text-[11px] text-gray-500 mt-0.5">{doc.docType} • Issued by {doc.labName} {doc.verifiedDate ? `(${doc.verifiedDate})` : ''}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                                                            ✓ Verified Batch
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 5: Product FAQs */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-primary mb-2">Frequently Asked Questions</h3>
                                        <p className="text-xs text-gray-500 mb-6">Expert guidance and classical answers regarding {product.name}.</p>
                                    </div>

                                    {product.faqs && product.faqs.length > 0 ? (
                                        <div className="space-y-3">
                                            {product.faqs.map((faq, idx) => {
                                                const isOpen = openFaqIndex === idx;
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="border border-gray-100 rounded-2xl overflow-hidden bg-[#FDFBF7]"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                                                        >
                                                            <span>{faq.question}</span>
                                                            {isOpen ? (
                                                                <ChevronUp size={16} className="text-secondary shrink-0" />
                                                            ) : (
                                                                <ChevronDown size={16} className="text-gray-400 shrink-0" />
                                                            )}
                                                        </button>
                                                        {isOpen && (
                                                            <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/60 bg-white">
                                                                {faq.answer}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-xs text-gray-500 bg-[#FDFBF7] rounded-2xl border border-accent/40">
                                            <HelpCircle size={28} className="mx-auto mb-2 text-secondary opacity-60" />
                                            <p>Have questions about this formulation? Consult our Ayurvedic Vaidya via WhatsApp.</p>
                                            <button
                                                onClick={handleVaidyaConsult}
                                                className="mt-3 px-4 py-1.5 bg-primary text-secondary font-bold rounded-lg text-xs hover:bg-primary/90 transition"
                                            >
                                                Ask Doctor
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}



                        </div>
                    </div>

                    {/* Related Formulations Carousel */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <ScrollReveal>
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Complementary Formulations</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Recommended synergy items from the {product.category} collection.</p>
                                    </div>
                                    <Link 
                                        to={`/shop?category=${encodeURIComponent(product.category)}`}
                                        className="text-xs uppercase font-bold tracking-wider text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline"
                                    >
                                        Explore Collection
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto w-full">
                                    {relatedProducts.map((p) => (
                                        <ProductCard key={p._id} product={p} />
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>
                    )}

                </div>
            </div>

            {/* WhatsApp Quick Order Modal */}
            <WhatsAppOrderModal 
                product={getCartPayload()} 
                isOpen={isWhatsAppModalOpen} 
                onClose={() => setIsWhatsAppModalOpen(false)} 
            />

            {/* Practitioner & Clinic Bulk Wholesale Modal */}
            <BulkEnquiryModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                initialProductName={product?.name}
            />
        </AnimatedPage>
    );
};

export default ProductPage;
