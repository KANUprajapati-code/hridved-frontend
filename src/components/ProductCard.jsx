import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, ShoppingCart, Zap, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useRef, useState } from 'react';
import ProductImage from './ProductImage';
import { useFlyingElement } from '../hooks/useFlyingElement';
import { trackLeadEvent } from '../utils/tracking';

/**
 * ProductCard Component (Prompt 06 Deliverable)
 * 
 * Strict PRD Requirements:
 * - Approved image with aspect ratio preserved
 * - Product name & pack size
 * - Actual price & valid MRP/discount percentage
 * - Stock indicator (Sold Out, Low Stock, In Stock)
 * - Real rating only (no fabricated ratings when reviews = 0)
 * - Badges: Bestseller, Classical Ayurveda, Low Stock
 * - Add to Cart / Quick Add with tactile feedback & animation
 * - WCAG 2.2 AA keyboard accessible (focus rings, aria-labels)
 */
const ProductCard = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, openAuthModal } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product._id);
    const [cardAdded, setCardAdded] = useState(false);
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);

    // Extract pack size from product or name
    const packSize = product.packSize || product.name.match(/\b\d+\s*(?:ml|gm|g|kg|l)\b/i)?.[0] || '';
    const hasDiscount = product.mrp > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
    const hasGenuineReviews = Boolean(product.numReviews && product.numReviews > 0);

    return (
        <div
            className="group bg-white flex flex-col h-full relative border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
        >
            {/* Image Container */}
            <div className="p-1.5 pb-0 bg-white">
                <div className="relative aspect-square overflow-hidden bg-white border border-gray-50 rounded-2xl flex items-center justify-center">
                    <Link 
                        to={`/product/${product._id}`} 
                        className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl" 
                        ref={imageRef}
                        aria-label={`View details for ${product.name}`}
                    >
                        <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                            objectFit="contain"
                        />
                    </Link>

                    {/* Badges container */}
                    <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start pointer-events-none">
                        <div className="flex flex-col gap-1.5">
                            {product.isBestseller && (
                                <span className="bg-[#D4AF37] text-gray-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <span>★ Bestseller</span>
                                </span>
                            )}
                            {product.countInStock > 0 && product.countInStock <= 5 && (
                                <span className="bg-amber-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    Only {product.countInStock} Left
                                </span>
                            )}
                            {hasDiscount && (
                                <span className="bg-[#fbbf24] text-gray-900 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    SALE
                                </span>
                            )}
                        </div>
                        {hasDiscount && (
                            <span className="bg-gray-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md shadow-sm">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Quick View Button */}
                    {onQuickView && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            aria-label={`Quick view ${product.name}`}
                            className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all transform opacity-0 group-hover:opacity-100 duration-300 cursor-pointer focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            title="Quick View"
                        >
                            <Eye size={15} />
                        </button>
                    )}

                    {/* Sold out overlay */}
                    {product.countInStock === 0 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-white/10 border border-white/20 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Section */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
                {/* Product Name */}
                <Link 
                    to={`/product/${product._id}`} 
                    className="block mb-2 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                >
                    <div className="bg-accent/10 group-hover:bg-primary/5 transition-all text-primary font-bold text-center py-2 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-xs uppercase tracking-wider line-clamp-2 min-h-[38px] sm:min-h-[44px] flex items-center justify-center leading-tight">
                        {product.name}
                    </div>
                </Link>

                {/* Meta Row: Pack Size, Genuine Rating, Wishlist */}
                <div className="flex items-center justify-between px-1 mb-2.5 sm:mb-3">
                    {/* Pack size indicator */}
                    {packSize ? (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {packSize}
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Classical Ayurveda
                        </span>
                    )}

                    {/* Genuine Rating or Verified Batch Badge */}
                    <div className="flex items-center gap-2">
                        {hasGenuineReviews ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                <Star size={11} fill="#d97706" className="text-amber-600" />
                                <span>{product.rating?.toFixed(1)}</span>
                                <span className="text-gray-400 font-normal text-[10px]">({product.numReviews})</span>
                            </div>
                        ) : (
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                100% Pure
                            </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400 rounded-full"
                            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                            <Heart
                                size={16}
                                fill={isWishlisted ? "#ef4444" : "none"}
                                className={isWishlisted ? "text-red-500" : "text-gray-400"}
                            />
                        </button>
                    </div>
                </div>

                {/* Pricing Display */}
                <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 mb-3 min-h-[26px] text-center px-1">
                    <span className="text-xs sm:text-sm font-black text-primary font-sans">
                        ₹{product.price}
                    </span>
                    {hasDiscount && (
                        <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                            ₹{product.mrp}
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-100">
                            Save ₹{product.mrp - product.price}
                        </span>
                    )}
                </div>

                {/* Action Buttons: Add to Cart & Buy Now */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 mt-auto pt-1 w-full">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (!user) {
                                openAuthModal({
                                    title: 'Login to Add to Cart',
                                    description: `Please verify your phone to add ${product.name} to cart`,
                                    onSuccess: () => {
                                        addToCart(product, 1);
                                        trackLeadEvent({ actionType: 'add_to_cart', product });
                                    },
                                });
                                return;
                            }
                            const cartIcon = document.getElementById('cart-icon-container');
                            if (imageRef.current) {
                                animateAddToCart(imageRef.current, cartIcon, product.image);
                            }
                            setCardAdded(true);
                            setTimeout(() => setCardAdded(false), 1200);
                            addToCart(product, 1);
                            trackLeadEvent({ actionType: 'add_to_cart', product });
                        }}
                        aria-label={`Add ${product.name} to cart`}
                        className={`w-full h-8 sm:h-9.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                            cardAdded
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-primary text-white hover:bg-opacity-95 hover:shadow-md'
                        }`}
                        disabled={product.countInStock === 0}
                    >
                        {cardAdded ? (
                            <>
                                <Check size={14} className="text-secondary stroke-[3]" />
                                <span>Added</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={13} className="shrink-0" />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product, 1);
                            trackLeadEvent({ actionType: 'buy_now', product });
                            navigate('/checkout/address');
                        }}
                        aria-label={`Buy ${product.name} now`}
                        disabled={product.countInStock === 0}
                        className="w-full h-8 sm:h-9.5 bg-gradient-to-r from-secondary to-[#c59e2b] text-primary rounded-xl hover:brightness-105 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 text-center cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        title={`Buy ${product.name} Now`}
                    >
                        <Zap size={13} className="shrink-0 fill-current" />
                        <span>Buy Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
