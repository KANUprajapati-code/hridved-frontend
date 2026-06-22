import { Link } from 'react-router-dom';
import { Star, MessageCircle, Eye, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { useFlyingElement } from '../hooks/useFlyingElement';
import WhatsAppOrderModal from './WhatsAppOrderModal';

const ProductCard = ({ product, onQuickView }) => {
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-premium group bg-white flex flex-col h-full relative"
        >
            {/* Badge container - Refined for mobile */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
                {product.isBestseller && (
                    <motion.span
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass text-primary text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-lg"
                    >
                        Bestseller
                    </motion.span>
                )}
                {product.mrp > product.price && (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-lg"
                    >
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </motion.span>
                )}
                {product.countInStock > 0 && product.countInStock <= 5 && (
                    <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Only {product.countInStock} Left
                    </span>
                )}
            </div>

            {/* Wishlist Button - Floating on top-right on mobile, hidden on desktop */}
            <div className="absolute top-2 right-2 z-20 lg:hidden">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsWishlisted(!isWishlisted);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-gray-100 bg-white transition-all ${
                        isWishlisted ? 'text-red-500' : 'text-gray-400'
                    }`}
                >
                    <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                </motion.button>
            </div>

            {/* Image Section - Scaled for mobile */}
            <div className="relative h-48 sm:h-72 overflow-hidden bg-gray-50 flex items-center justify-center">
                <Link to={`/product/${product._id}`} className="w-full h-full block" ref={imageRef}>
                    <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {/* Hover Actions - Hidden on mobile/touch, visible on hover on desktop */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center gap-3 pointer-events-none">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickView && onQuickView(product);
                        }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl hover:bg-primary hover:text-white transition-all transform translate-y-0 lg:-translate-y-4 lg:group-hover:translate-y-0 duration-300 pointer-events-auto"
                        title="Quick View"
                    >
                        <Eye size={20} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsWishlisted(!isWishlisted);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all transform translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 duration-300 delay-75 pointer-events-auto ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-primary hover:bg-red-50'
                            }`}
                        title="Add to Wishlist"
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </motion.button>
                </div>

                {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-white/10 border border-white/20 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            {/* Info Section - Balanced for mobile & desktop */}
            <div className="p-3 sm:p-6 flex flex-col flex-grow">
                {/* Category */}
                <div className="mb-1 sm:mb-2">
                    <Link to={`/shop?category=${product.category}`} className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-[0.1em] hover:text-primary transition-colors">
                        {product.category}
                    </Link>
                </div>

                {/* Product Name */}
                <Link to={`/product/${product._id}`} className="group-hover:text-primary transition-colors">
                    <h3 className="text-xs sm:text-lg font-bold text-gray-800 line-clamp-2 mb-1.5 sm:mb-3 leading-tight sm:leading-snug">{product.name}</h3>
                </Link>

                {/* Rating (Inline for mobile, part of right side on desktop) */}
                <div className="flex sm:hidden text-secondary gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={10}
                            className={i < (product.rating || 0) ? "text-secondary" : "text-gray-200"}
                            fill={i < (product.rating || 0) ? "currentColor" : "none"}
                        />
                    ))}
                </div>

                {/* Pricing and Actions - Desktop View */}
                <div className="hidden sm:flex mt-auto items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Investment</span>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-primary font-sans">₹{product.price}</span>
                                {product.mrp > product.price && (
                                    <span className="text-sm text-gray-400 line-through font-medium">₹{product.mrp}</span>
                                )}
                            </div>
                            {product.mrp > product.price && (
                                <span className="text-xs text-green-600 font-black mt-0.5 whitespace-nowrap">
                                    Save ₹{product.mrp - product.price} ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <div className="mb-2">
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                In Stock
                            </span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    const cartIcon = document.getElementById('cart-icon-container');
                                    if (imageRef.current && cartIcon) {
                                        animateAddToCart(imageRef.current, cartIcon, product.image);
                                    }
                                    addToCart(product, 1);
                                }}
                                className="bg-white text-primary border border-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center transform active:scale-95"
                                title="Add to Cart"
                            >
                                <ShoppingCart size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsWhatsAppModalOpen(true);
                                }}
                                className="bg-[#25D366] text-white p-3 rounded-xl hover:bg-[#1da851] transition-all duration-300 shadow-md hover:shadow-xl transform active:scale-95"
                                title="Order on WhatsApp"
                            >
                                <MessageCircle size={18} />
                            </button>
                        </div>
                        <div className="flex text-secondary gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={8}
                                    className={i < (product.rating || 0) ? "text-secondary" : "text-gray-200"}
                                    fill={i < (product.rating || 0) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing and Actions - Mobile View */}
                <div className="flex sm:hidden flex-col mt-auto pt-2 border-t border-gray-50">
                    {/* Price & Savings */}
                    <div className="flex flex-wrap items-baseline gap-1.5 mb-0.5">
                        <span className="text-sm font-black text-primary font-sans">₹{product.price}</span>
                        {product.mrp > product.price && (
                            <span className="text-[9px] text-gray-400 line-through font-medium">₹{product.mrp}</span>
                        )}
                    </div>
                    {product.mrp > product.price && (
                        <span className="text-[8px] text-green-600 font-extrabold mb-1.5 block leading-none">
                            Save ₹{product.mrp - product.price} ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                        </span>
                    )}

                    {/* Stock Status */}
                    <div className="mb-2">
                        <span className="text-[8px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                            In Stock
                        </span>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex gap-1.5 mt-auto">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                const cartIcon = document.getElementById('cart-icon-container');
                                if (imageRef.current && cartIcon) {
                                    animateAddToCart(imageRef.current, cartIcon, product.image);
                                }
                                addToCart(product, 1);
                            }}
                            className="w-1/2 bg-white text-primary border border-primary py-2 rounded-lg flex items-center justify-center gap-1 text-[9px] font-black active:bg-primary active:text-white transition-all shadow-sm"
                            title="Add to Cart"
                        >
                            <ShoppingCart size={11} />
                            <span>Add</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsWhatsAppModalOpen(true);
                            }}
                            className="w-1/2 bg-[#25D366] text-white py-2 rounded-lg flex items-center justify-center gap-1 text-[9px] font-black active:bg-[#1da851] transition-all shadow-sm"
                            title="Order on WhatsApp"
                        >
                            <MessageCircle size={11} />
                            <span>WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>

            <WhatsAppOrderModal 
                product={product} 
                isOpen={isWhatsAppModalOpen} 
                onClose={() => setIsWhatsAppModalOpen(false)} 
            />
        </motion.div>
    );
};

export default ProductCard;
