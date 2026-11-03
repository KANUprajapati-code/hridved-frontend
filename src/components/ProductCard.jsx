import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { useFlyingElement } from '../hooks/useFlyingElement';
import { trackLeadEvent } from '../utils/tracking';

const ProductCard = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, openAuthModal } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product._id);
    const [cardAdded, setCardAdded] = useState(false);
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);

    return (
        <div
            className="group bg-white flex flex-col h-full relative border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
        >

            {/* Image Section */}
            <div className="p-1.5 pb-0 bg-white">
                <div className="relative aspect-square overflow-hidden bg-white border border-gray-50 rounded-2xl flex items-center justify-center">
                    <Link to={`/product/${product._id}`} className="w-full h-full block" ref={imageRef}>
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
                                <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-gray-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-1">
                                    <span>🪔</span>
                                    <span>Diwali Special</span>
                                </span>
                            )}
                            {product.countInStock > 0 && product.countInStock <= 5 && (
                                <span className="bg-amber-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    Only {product.countInStock} Left
                                </span>
                            )}
                            {product.mrp > product.price && (
                                <span className="bg-[#fbbf24] text-gray-900 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    SALE
                                </span>
                            )}
                        </div>
                        {product.mrp > product.price && (
                            <span className="bg-gray-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md shadow-sm">
                                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                            </span>
                        )}
                    </div>

                    {/* Eye Icon for Quick View - Clean Overlay */}
                    {onQuickView && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all transform opacity-0 group-hover:opacity-100 duration-300"
							title="Quick View"
                        >
                            <Eye size={15} />
                        </button>
                    )}

                    {product.countInStock === 0 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-white/10 border border-white/20 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="p-2.5 sm:p-4 flex flex-col flex-grow bg-white">
                {/* Product Name in a modern rounded pill box */}
                <Link to={`/product/${product._id}`} className="block mb-2 sm:mb-3">
                    <div className="bg-accent/10 group-hover:bg-primary/5 transition-all text-primary font-bold text-center py-2 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-xs uppercase tracking-wider line-clamp-2 min-h-[38px] sm:min-h-[44px] flex items-center justify-center leading-tight">
                        {product.name}
                    </div>
                </Link>

                {/* Heart wishlist and slider dots indicator container */}
                <div className="flex items-center justify-between px-1 mb-2 sm:mb-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                    >
                        <Heart
                            size={17}
                            fill={isWishlisted ? "#ef4444" : "none"}
                            className={isWishlisted ? "text-red-500" : "text-gray-400"}
                        />
                    </button>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-5 sm:w-6 h-1 bg-secondary rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                    </div>
                </div>

                {/* Pricing Badges Grid */}
                <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-h-[26px] sm:min-h-[28px] text-center px-1">
                    <span className="text-xs sm:text-sm font-black text-primary font-sans">
                        ₹{product.price}
                    </span>
                    {product.mrp > product.price && (
                        <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                            ₹{product.mrp}
                        </span>
                    )}
                    {product.mrp > product.price && (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-100">
                            Save ₹{product.mrp - product.price}
                        </span>
                    )}
                </div>

                {/* Bottom Actions - Stacked on Mobile, Side-by-Side on Desktop */}
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
                        className={`w-full h-8 sm:h-9.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 text-center cursor-pointer ${
                            cardAdded
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-primary text-white hover:bg-opacity-95 hover:shadow-md'
                        }`}
                        disabled={product.countInStock === 0}
                    >
                        {cardAdded ? (
                            <>
                                <span className="text-secondary font-bold">✓</span>
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
                        disabled={product.countInStock === 0}
                        className="w-full h-8 sm:h-9.5 bg-gradient-to-r from-secondary to-[#c59e2b] text-primary rounded-xl hover:brightness-105 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 text-center cursor-pointer shadow-sm"
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
