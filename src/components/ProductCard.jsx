import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { useFlyingElement } from '../hooks/useFlyingElement';

const ProductCard = ({ product, onQuickView }) => {
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
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
                {product.countInStock > 0 && product.countInStock <= 5 && (
                    <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Only {product.countInStock} Left
                    </span>
                )}
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

                {/* Hover Actions - Visible on mobile/touch, hover on desktop */}
                <div className="absolute inset-0 bg-black/10 lg:bg-black/20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onQuickView && onQuickView(product)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl hover:bg-primary hover:text-white transition-all transform translate-y-0 lg:-translate-y-4 lg:group-hover:translate-y-0 duration-300"
                        title="Quick View"
                    >
                        <Eye size={20} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all transform translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 duration-300 delay-75 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-primary hover:bg-red-50'
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

            {/* Info Section - Tighter for mobile */}
            <div className="p-3 sm:p-6 flex flex-col flex-grow">
                <div className="mb-1 sm:mb-2">
                    <Link to={`/shop?category=${product.category}`} className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-[0.1em] hover:text-primary transition-colors">
                        {product.category}
                    </Link>
                </div>

                <Link to={`/product/${product._id}`} className="group-hover:text-primary transition-colors">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2 mb-2 sm:mb-3 leading-tight sm:leading-snug">{product.name}</h3>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Investment</span>
                        <span className="text-lg sm:text-2xl font-black text-primary font-sans">₹{product.price}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <button
                            onClick={() => {
                                addToCart(product);
                                const cartIcon = document.getElementById('cart-icon-container');
                                if (imageRef.current && cartIcon) {
                                    animateAddToCart(imageRef.current, cartIcon, product.image);
                                }
                            }}
                            className="bg-primary text-white p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-secondary hover:text-primary transition-all duration-300 shadow-md hover:shadow-xl transform active:scale-95 mb-1"
                            title="Add to Cart"
                        >
                            <ShoppingCart size={14} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
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
            </div>
        </motion.div>
    );
};

export default ProductCard;
