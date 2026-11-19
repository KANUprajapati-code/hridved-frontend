import { useState } from 'react';
import { X, Star, Heart, Zap, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductImage from './ProductImage';
import { trackLeadEvent } from '../utils/tracking';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, openAuthModal } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const isWishlisted = isInWishlist(product?._id);

    const availableVariants = (product?.variants && Array.isArray(product.variants) && product.variants.length > 0)
        ? product.variants
        : (product?._id === '69999d3f601a51e1407f45cc' || product?.name?.toLowerCase().includes('suvrnaprasan drop 15ml'))
            ? [
                { id: 'single', name: '1 Pack (15ml)', shortName: '1 Pack', price: 949, mrp: 999, stock: 91, multiplier: 1 },
                { id: 'twin', name: '2 Pack (2x15ml)', shortName: '2 Pack', price: 1798, mrp: 1998, stock: 45, multiplier: 2 },
                { id: 'triple', name: '3 Pack (3x15ml)', shortName: '3 Pack', price: 2547, mrp: 2997, stock: 30, multiplier: 3 }
            ]
            : null;

    const [selectedVariantId, setSelectedVariantId] = useState(
        availableVariants ? availableVariants[0].id : 'single'
    );

    const activeVariant = availableVariants
        ? (availableVariants.find(v => v.id === selectedVariantId) || availableVariants[0])
        : null;

    const currentPrice = activeVariant ? Number(activeVariant.price) : Number(product?.price || 0);
    const currentMrp = activeVariant ? Number(activeVariant.mrp) : Number(product?.mrp || product?.originalPrice || currentPrice);

    if (!isOpen || !product) return null;

    const getItemForCart = () => {
        if (!activeVariant) return product;
        return {
            ...product,
            name: activeVariant.id === 'single' ? product.name : `${product.name} (${activeVariant.shortName || activeVariant.name})`,
            price: currentPrice,
            mrp: currentMrp,
            sku: activeVariant.sku || product.sku,
            selectedVariant: activeVariant.name,
            countInStock: activeVariant.stock ?? product.countInStock,
        };
    };

    const handleBuyNow = () => {
        const item = getItemForCart();
        addToCart(item, quantity);
        trackLeadEvent({ actionType: 'buy_now', product: item });
        onClose();
        navigate('/checkout/address');
    };

    const handleAddToCart = () => {
        const item = getItemForCart();
        if (!user) {
            openAuthModal({
                title: 'Login to Add to Cart',
                description: `Please verify your phone to add ${item.name} to cart`,
                onSuccess: () => {
                    addToCart(item, quantity);
                    trackLeadEvent({ actionType: 'add_to_cart', product: item });
                },
            });
            return;
        }
        addToCart(item, quantity);
        trackLeadEvent({ actionType: 'add_to_cart', product: item });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Quick View</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image */}
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                            <div className="max-w-xs max-h-80 w-full">
                                <ProductImage
                                    src={product.image}
                                    alt={product.name}
                                    className="rounded"
                                    width={300}
                                    height={320}
                                    objectFit="contain"
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col">
                            {/* Title and Category */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                                    {product.category}
                                </p>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < (product.rating || 0) ? "currentColor" : "none"}
                                            className={i < (product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {product.rating} ({product.numReviews || 0} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-gray-900 font-sans">
                                        ₹{currentPrice}
                                    </span>
                                    {currentMrp > currentPrice && (
                                        <span className="text-lg text-gray-400 line-through font-medium">
                                            ₹{currentMrp}
                                        </span>
                                    )}
                                    {currentMrp > currentPrice && (
                                        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                            {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Variant Selection Pills */}
                            {availableVariants && availableVariants.length > 1 && (
                                <div className="mb-4">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                                        Select Pack:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableVariants.map((v) => {
                                            const isSel = (activeVariant?.id || availableVariants[0].id) === v.id;
                                            const vPrice = Number(v.price);
                                            const vMrp = Number(v.mrp || vPrice);
                                            const vDiscount = vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0;
                                            const pillLabel = v.id === 'single' ? '1 Pack' : v.id === 'twin' ? '2 Pack' : v.id === 'triple' ? '3 Pack' : (v.shortName || v.name);
                                            return (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    onClick={() => setSelectedVariantId(v.id)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${
                                                        isSel
                                                            ? 'bg-primary text-white border-primary shadow-xs'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span>{pillLabel}</span>
                                                    {vDiscount > 0 && (
                                                        <span className={`text-[10px] ${isSel ? 'text-secondary font-black' : 'text-emerald-700 font-bold'}`}>
                                                            ({vDiscount}% OFF)
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="mb-6">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                                    product.countInStock > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {product.countInStock > 0
                                        ? `${product.countInStock} in stock`
                                        : 'Out of stock'}
                                </div>
                            </div>

                            {/* Quantity and Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            −
                                        </button>
                                        <span className="px-4 py-2 border-l border-r border-gray-300">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            disabled={quantity >= product.countInStock}
                                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toggleWishlist(product)}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            isWishlisted
                                                ? 'bg-red-100 border-red-300 text-red-600'
                                                : 'border-gray-300 text-gray-600 hover:border-red-300'
                                        }`}
                                        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                                    >
                                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.countInStock === 0}
                                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                                    >
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.countInStock === 0}
                                        className="w-full bg-gradient-to-r from-secondary to-[#c59e2b] text-primary py-3 rounded-lg font-bold hover:brightness-105 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                                    >
                                        <Zap size={16} className="fill-current" />
                                        Buy Now
                                    </button>
                                </div>

                                <Link
                                    to={`/product/${product._id}`}
                                    onClick={onClose}
                                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block"
                                >
                                    View Full Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
