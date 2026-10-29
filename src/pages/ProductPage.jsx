import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Star, Truck, ShieldCheck, ShoppingCart, Clock, Heart, Zap, 
    MessageCircle, ChevronRight, CheckCircle2, AlertCircle, Share2, 
    Sparkles, RefreshCw, Leaf, Award, Stethoscope, Building2 
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
import AnimatedButton from '../components/AnimatedButton';
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
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const { addToCart } = useCart();
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

            // Fetch related products from the same category
            try {
                const { data: allProductsData } = await api.get('/products');
                const productsList = allProductsData.products || allProductsData || [];
                const filtered = productsList
                    .filter(p => p.category === data.category && p._id !== data._id)
                    .slice(0, 4);
                setRelatedProducts(filtered);
            } catch (err) {
                console.error("Error fetching related products", err);
            }
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product?._id) {
            trackWebsiteEvent('product_view', { productId: product._id });
        }
    }, [product?._id]);

    // Dynamic Pack / Variant calculation based on product data
    const variants = useMemo(() => {
        if (!product) return [];
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            return product.variants;
        }

        const basePrice = Number(product.price) || 0;
        const baseMrp = Number(product.mrp) || basePrice;
        const baseStock = Number(product.countInStock) || 0;
        const idSuffix = (product._id || '').slice(-6).toUpperCase();

        return [
            {
                id: 'single',
                name: 'Standard Pack (Single)',
                shortName: 'Single Pack',
                multiplier: 1,
                price: basePrice,
                mrp: baseMrp,
                sku: `HRV-${idSuffix}-1PK`,
                stock: baseStock,
                badge: null,
                savings: baseMrp > basePrice ? baseMrp - basePrice : 0,
                discountPct: baseMrp > basePrice ? Math.round(((baseMrp - basePrice) / baseMrp) * 100) : 0,
            },
            {
                id: 'twin',
                name: 'Double Value (Pack of 2)',
                shortName: 'Pack of 2',
                multiplier: 2,
                price: Math.round(basePrice * 2 * 0.9), // 10% bundle savings
                mrp: baseMrp * 2,
                sku: `HRV-${idSuffix}-2PK`,
                stock: Math.floor(baseStock / 2),
                badge: 'Save 10%',
                savings: (baseMrp * 2) - Math.round(basePrice * 2 * 0.9),
                discountPct: Math.round((((baseMrp * 2) - Math.round(basePrice * 2 * 0.9)) / (baseMrp * 2)) * 100),
            },
            {
                id: 'triple',
                name: '3-Month Vitality Course (Pack of 3)',
                shortName: 'Pack of 3',
                multiplier: 3,
                price: Math.round(basePrice * 3 * 0.85), // 15% course savings
                mrp: baseMrp * 3,
                sku: `HRV-${idSuffix}-3PK`,
                stock: Math.floor(baseStock / 3),
                badge: 'Best Value • Save 15%',
                savings: (baseMrp * 3) - Math.round(basePrice * 3 * 0.85),
                discountPct: Math.round((((baseMrp * 3) - Math.round(basePrice * 3 * 0.85)) / (baseMrp * 3)) * 100),
            },
        ];
    }, [product]);

    // Active variant object
    const activeVariant = useMemo(() => {
        if (!variants || variants.length === 0) {
            return {
                id: 'single',
                name: 'Standard Pack',
                shortName: 'Standard Pack',
                price: product?.price || 0,
                mrp: product?.mrp || 0,
                sku: `HRV-${(product?._id || '').slice(-6).toUpperCase()}-1PK`,
                stock: product?.countInStock || 0,
                savings: (product?.mrp || 0) > (product?.price || 0) ? (product.mrp - product.price) : 0,
                discountPct: (product?.mrp || 0) > (product?.price || 0) ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0,
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
            selectedVariant: activeVariant.name,
            countInStock: activeVariant.stock,
        };
    };

    // Add To Cart handler
    const handleAddToCart = () => {
        const item = getCartPayload();
        
        // Trigger flying animation
        const cartIcon = document.getElementById('cart-icon-container');
        if (imageRef.current && cartIcon) {
            animateAddToCart(imageRef.current, cartIcon, product.image);
        }

        addToCart(item, qty);
        trackLeadEvent({ actionType: 'add_to_cart', product: item });
        if (addToast) addToast(`Added ${item.name} (x${qty}) to cart!`, 'success');
    };

    // Buy Now handler
    const handleBuyNow = () => {
        const item = getCartPayload();
        addToCart(item, qty);
        trackLeadEvent({ actionType: 'add_to_cart', product: item });
        navigate('/cart');
    };

    // Order on WhatsApp handler
    const handleWhatsAppOrder = () => {
        setIsWhatsAppModalOpen(true);
        trackLeadEvent({ actionType: 'whatsapp_click', product });
    };

    // Vaidya WhatsApp Consultation link
    const handleVaidyaConsult = () => {
        const message = encodeURIComponent(
            `Namaste Hridved Vaidya, I am reviewing "${product.name}" (${activeVariant.name}, ₹${activeVariant.price}). Can you please guide me on its dosage, benefits, and suitability for my health concerns?`
        );
        window.open(`https://wa.me/917990442340?text=${message}`, '_blank', 'noopener,noreferrer');
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
                <p className="text-gray-600 mb-6 max-w-md font-body">The product you are looking for may have been archived or is temporarily out of catalogue.</p>
                <Link to="/shop" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-sm">
                    Return to Apothecary
                </Link>
            </div>
        );
    }

    const isOutOfStock = activeVariant.stock === 0;

    const productBreadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Apothecary', path: '/shop' },
        { name: product.category || 'Ayurvedic Formulations', path: `/shop?category=${encodeURIComponent(product.category || '')}` },
        { name: product.name, path: `/product/${product._id}` }
    ];

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
                                            <span className="font-medium text-gray-700">Lab Tested for Heavy Metals & Purity</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={handleShare}
                                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition cursor-pointer"
                                                title="Share Product"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => toggleWishlist(product)}
                                                className={`p-2 rounded-full hover:bg-gray-100 transition cursor-pointer ${isWishlisted ? 'text-rose-600' : 'text-gray-400 hover:text-rose-500'}`}
                                                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
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
                                    {/* Category & SKU Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <Link 
                                            to={`/shop?category=${encodeURIComponent(product.category)}`}
                                            className="text-xs uppercase font-bold tracking-widest text-secondary hover:underline underline-offset-2"
                                        >
                                            {product.category}
                                        </Link>
                                        <span className="text-[11px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                            SKU: {activeVariant.sku}
                                        </span>
                                    </div>

                                    {/* Product Title */}
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary mb-3 leading-tight tracking-tight">
                                        {product.name}
                                    </h1>

                                    {/* Star Rating & Review Link */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="flex items-center text-secondary">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={16} 
                                                    fill={i < Math.round(product.rating || 5) ? "currentColor" : "none"} 
                                                    className={i < Math.round(product.rating || 5) ? "" : "text-gray-200"} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">
                                            {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                                        </span>
                                        <span className="text-xs text-gray-400 border-l border-gray-300 pl-3">
                                            <button 
                                                onClick={() => {
                                                    setActiveTab('reviews');
                                                    const el = document.getElementById('product-information-tabs');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="hover:text-primary hover:underline cursor-pointer"
                                            >
                                                {product.numReviews || 0} Verified Reviews
                                            </button>
                                        </span>
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
                                                You save ₹{activeVariant.savings} on this formulation
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
                                                    Only {activeVariant.stock} units remaining in copper-vessel batch
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
                                                        {v.badge && (
                                                            <span className="absolute -top-2.5 right-2 bg-secondary text-primary font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                                {v.badge}
                                                            </span>
                                                        )}
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-900 leading-tight">
                                                                {v.shortName}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                                {v.id === 'single' ? 'Trial Course' : v.id === 'twin' ? 'Sustained Relief' : 'Holistic Healing'}
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
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            {/* Tactile Quantity Selector Primitive */}
                                            <div className="flex items-center justify-between sm:justify-start gap-3 bg-[#FDFBF7] p-1.5 rounded-2xl border border-accent/40">
                                                <span className="text-xs font-bold text-gray-700 px-2 sm:hidden">Qty:</span>
                                                <QuantitySelector
                                                    value={qty}
                                                    onChange={setQty}
                                                    min={1}
                                                    max={Math.min(activeVariant.stock || 10, 10)}
                                                    disabled={isOutOfStock}
                                                    size="md"
                                                />
                                            </div>

                                            {/* Add To Cart */}
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock}
                                                className="flex-1 h-12 bg-white text-primary border-2 border-primary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 cursor-pointer"
                                            >
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </button>

                                            {/* Direct Buy Now */}
                                            <button
                                                type="button"
                                                onClick={handleBuyNow}
                                                disabled={isOutOfStock}
                                                className="flex-1 h-12 bg-primary text-white border-2 border-primary rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 cursor-pointer"
                                            >
                                                <Zap size={18} className="text-secondary" />
                                                Buy Now
                                            </button>
                                        </div>

                                        {/* Order on WhatsApp Quick Button */}
                                        <button
                                            type="button"
                                            onClick={handleWhatsAppOrder}
                                            disabled={isOutOfStock}
                                            className="w-full h-11 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#1da851] transition-all shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                                        >
                                            <MessageCircle size={18} />
                                            Order Instantly on WhatsApp (Fast Checkout)
                                        </button>
                                    </div>

                                    {/* Vaidya WhatsApp Consultation Prompt */}
                                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 mb-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Stethoscope size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-primary">Unsure if this fits your Prakriti?</h4>
                                                <p className="text-[11px] text-gray-600">Consult our certified Ayurvedic Vaidya for personalized dosage.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleVaidyaConsult}
                                            className="px-3 py-1.5 bg-primary text-secondary text-xs font-bold rounded-xl hover:bg-primary/90 transition shadow-xs shrink-0 cursor-pointer"
                                        >
                                            Ask Doctor
                                        </button>
                                    </div>

                                    {/* Practitioner / Clinic Bulk Wholesale Banner */}
                                    <div className="bg-[#FDFBF7] border border-accent/40 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
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
                                            className="px-3 py-1.5 bg-white text-primary border border-primary/40 text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition shadow-xs shrink-0 cursor-pointer"
                                        >
                                            Bulk Enquiry
                                        </button>
                                    </div>

                                    {/* Live Pincode Delivery Serviceability Check */}
                                    <div className="mb-6">
                                        <PincodeShippingCheck productPrice={activeVariant.price} />
                                    </div>

                                    {/* Assurance Grid */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-accent/40 text-xs">
                                        <div className="flex items-center gap-2.5 text-gray-700">
                                            <Truck size={17} className="text-secondary shrink-0" />
                                            <span>Free shipping on orders above ₹999</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-gray-700">
                                            <ShieldCheck size={17} className="text-secondary shrink-0" />
                                            <span>Cash on Delivery available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Product Information Tabs */}
                    <div id="product-information-tabs" className="mt-12 bg-white rounded-3xl shadow-sm border border-accent/40 p-6 sm:p-8 lg:p-10">
                        {/* Tab Headers */}
                        <div className="flex border-b border-accent/30 mb-8 overflow-x-auto no-scrollbar gap-2 sm:gap-6">
                            {[
                                { id: 'description', label: 'Formulation Overview' },
                                { id: 'benefits', label: 'Ayurvedic Benefits' },
                                { id: 'usage', label: 'How to Use & Dosage' },
                                { id: 'purity', label: 'Purity & Quality' },
                                { id: 'reviews', label: `Customer Reviews (${product.numReviews || 0})` },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 px-2 sm:px-4 font-bold text-xs sm:text-sm tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer border-b-2 ${
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
                            
                            {/* Overview Tab */}
                            {activeTab === 'description' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-primary mb-3">Authentic Ayurvedic Heritage</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-accent/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                        <div className="flex items-start gap-2.5">
                                            <Leaf className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">100% Shuddha Botanicals</h5>
                                                <p className="text-gray-500 mt-0.5">Crafted solely from authentic whole herbs sourced from native Indian biotopes.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <Clock className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">Classical Extraction</h5>
                                                <p className="text-gray-500 mt-0.5">Slow-simmered according to Samhita Bhavana traditions for peak bio-potency.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <Award className="text-secondary shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h5 className="font-bold text-primary">GMP Manufacturing</h5>
                                                <p className="text-gray-500 mt-0.5">Formulated in certified Ayurvedic facilities with strict standard operating procedures.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Benefits Tab */}
                            {activeTab === 'benefits' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-serif font-bold text-primary">Therapeutic Action & Physiological Balance</h3>
                                    <div className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
                                        {product.benefits ? (
                                            <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-accent/40 mb-4 text-gray-800">
                                                {product.benefits}
                                            </div>
                                        ) : null}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif font-bold text-xs mb-2">01</div>
                                                <h4 className="font-bold text-primary text-sm mb-1">Tridosha Harmony</h4>
                                                <p className="text-xs text-gray-600">Acts holistically to pacify aggravated Vata, Pitta, and Kapha bio-energies.</p>
                                            </div>
                                            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-xs mb-2">02</div>
                                                <h4 className="font-bold text-primary text-sm mb-1">Cellular Rejuvenation (Rasayana)</h4>
                                                <p className="text-xs text-gray-600">Promotes metabolic cellular detox (Ama pachana) and tissue vitality.</p>
                                            </div>
                                            <div className="p-4 rounded-2xl border border-yellow-100 bg-yellow-50/50">
                                                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-serif font-bold text-xs mb-2">03</div>
                                                <h4 className="font-bold text-primary text-sm mb-1">Sustained Daily Ojas</h4>
                                                <p className="text-xs text-gray-600">Nourishes foundational immune resistance without synthetic spikes or crashes.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* How to Use Tab */}
                            {activeTab === 'usage' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-serif font-bold text-primary">Dosage & Anupana (Carrier Vehicle)</h3>
                                    <div className="bg-[#FDFBF7] border border-accent/40 p-5 rounded-2xl flex items-start gap-4">
                                        <Clock className="text-secondary shrink-0 mt-1" size={24} />
                                        <div className="text-sm">
                                            <h4 className="font-bold text-primary text-base mb-1">Recommended Usage</h4>
                                            <p className="text-gray-700 leading-relaxed">
                                                {product.howToUse || "Take 1 to 2 units twice daily with lukewarm water or warm milk after meals, or as recommended by an Ayurvedic physician."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                            <h5 className="font-bold text-primary mb-1">Storage Guidelines</h5>
                                            <p className="text-gray-500">Store in a cool, dry place away from direct sunlight. Keep container tightly sealed after each use. Do not refrigerate.</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                            <h5 className="font-bold text-primary mb-1">Duration of Course</h5>
                                            <p className="text-gray-500">For optimal systemic results, a consistent course of 60 to 90 days is traditionally recommended in classical Ayurvedic practice.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Purity & Guarantees Tab */}
                            {activeTab === 'purity' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-serif font-bold text-primary">The Hridved Purity Standard</h3>
                                    <p className="text-sm text-gray-600">
                                        Every batch of Hridved formulations undergoes triple-tier analytical screening to ensure strict compliance with the Ayurvedic Pharmacopoeia of India (API).
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <ShieldCheck size={28} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-sm">Heavy Metal Tested</h5>
                                            <p className="text-xs text-gray-500 mt-1">Verified safe for Lead, Mercury, Arsenic & Cadmium.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Leaf size={28} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-sm">100% Plant-Derived</h5>
                                            <p className="text-xs text-gray-500 mt-1">Pure botanical extracts in vegetarian capsules.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Award size={28} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-sm">GMP Certified</h5>
                                            <p className="text-xs text-gray-500 mt-1">Manufactured under pharmaceutical clean-room protocols.</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-accent/40 bg-[#FDFBF7] text-center">
                                            <Sparkles size={28} className="text-secondary mx-auto mb-2" />
                                            <h5 className="font-bold text-primary text-sm">0 Synthetic Additives</h5>
                                            <p className="text-xs text-gray-500 mt-1">No artificial colors, parabens, steroids, or fillers.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div>
                                    {/* Ratings Summary Header */}
                                    <div className="bg-[#FDFBF7] border border-accent/40 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="text-center sm:text-left">
                                            <div className="text-4xl sm:text-5xl font-sans font-black text-primary">
                                                {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                                            </div>
                                            <div className="flex text-secondary my-1.5 justify-center sm:justify-start">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={18} 
                                                        fill={i < Math.round(product.rating || 5) ? "currentColor" : "none"} 
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">Based on {product.numReviews || 0} customer experiences</p>
                                        </div>

                                        <div className="text-xs text-gray-600 max-w-sm text-center sm:text-right">
                                            <p className="font-medium">All reviews are submitted by verified patrons who purchased and experienced this classical formulation.</p>
                                        </div>
                                    </div>

                                    {/* Reviews List */}
                                    <div className="space-y-4 mb-10">
                                        {(!product.reviews || product.reviews.length === 0) ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Star size={32} className="text-secondary mx-auto mb-2 opacity-50" />
                                                <h4 className="font-bold text-gray-700 text-sm">Be the first to review this formulation</h4>
                                                <p className="text-xs text-gray-500 mt-1">Share your experience to help fellow seekers in their healing journey.</p>
                                            </div>
                                        ) : (
                                            product.reviews.map((rev) => (
                                                <div key={rev._id} className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FDFBF7]/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-primary text-secondary font-bold text-xs flex items-center justify-center">
                                                                {rev.name ? rev.name.charAt(0).toUpperCase() : 'P'}
                                                            </div>
                                                            <span className="font-bold text-sm text-gray-800">{rev.name}</span>
                                                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                Verified Buyer
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                                                        </span>
                                                    </div>
                                                    <div className="flex text-secondary text-xs mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Write Review Form */}
                                    <div className="pt-8 border-t border-accent/40">
                                        <h3 className="text-lg sm:text-xl font-serif font-bold text-primary mb-4">Write a Customer Review</h3>
                                        {user ? (
                                            <form onSubmit={submitReviewHandler} className="max-w-xl space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Your Rating</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setRating(star)}
                                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${rating >= star ? 'text-secondary' : 'text-gray-300'}`}
                                                            >
                                                                <Star size={26} fill={rating >= star ? "currentColor" : "none"} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                                        Your Experience
                                                    </label>
                                                    <textarea
                                                        id="review-comment"
                                                        rows="3"
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        className="w-full px-4 py-3 bg-[#FDFBF7] border border-accent/40 rounded-xl focus:outline-hidden focus:border-primary text-xs sm:text-sm font-body text-gray-900 transition-colors"
                                                        placeholder="Share how this formulation supported your wellness routine..."
                                                        required
                                                    ></textarea>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={reviewLoading}
                                                    className="px-8 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50 cursor-pointer"
                                                >
                                                    {reviewLoading ? 'Submitting...' : 'Post Review'}
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="p-6 bg-[#FDFBF7] rounded-2xl border border-accent/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div>
                                                    <h5 className="font-bold text-primary text-sm">Have you experienced this formulation?</h5>
                                                    <p className="text-xs text-gray-600 mt-0.5">Please sign in to write an authentic review and share your feedback.</p>
                                                </div>
                                                <button
                                                    onClick={() => openAuthModal({ title: 'Sign In to Review', description: 'Verify your phone number to submit a verified product review.' })}
                                                    className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition shadow-xs cursor-pointer shrink-0"
                                                >
                                                    Sign In to Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
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

                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
