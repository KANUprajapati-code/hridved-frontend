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
            className="group bg-white flex flex-col h-full relative border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
        >

            {/* Image Section */}
            <div className="p-1.5 pb-0 bg-white">
                <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-2xl flex items-center justify-center">
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
                                <span className="bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    Bestseller
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
            <div className="p-4 flex flex-col flex-grow bg-white">
                {/* Product Name in a modern rounded pill box */}
                <Link to={`/product/${product._id}`} className="block mb-3">
                    <div className="bg-accent/10 group-hover:bg-primary/5 transition-all text-primary font-bold text-center py-2.5 px-4 rounded-full text-xs uppercase tracking-wider line-clamp-2 min-h-[44px] flex items-center justify-center leading-tight">
                        {product.name}
                    </div>
                </Link>

                {/* Heart wishlist and slider dots indicator container */}
                <div className="flex items-center justify-between px-1 mb-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsWishlisted(!isWishlisted);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Wishlist"
                    >
                        <Heart
                            size={18}
                            fill={isWishlisted ? "#ef4444" : "none"}
                            className={isWishlisted ? "text-red-500" : "text-gray-400"}
                        />
                    </button>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-6 h-1 bg-secondary rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                    </div>
                </div>

                {/* Pricing Badges Grid */}
                <div className="flex flex-wrap items-center gap-1.5 justify-center mb-4 min-h-[32px]">
                    <span className="bg-primary/5 text-primary text-[10px] font-black px-2.5 py-1 rounded-full border border-primary/10 tracking-wider">
                        DEAL ₹{product.price}
                    </span>
                    {product.mrp > product.price && (
                        <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2.5 py-1 rounded-full border border-secondary/10 tracking-wider">
                            SAVE ₹{product.mrp - product.price}
                        </span>
                    )}
                    {product.mrp > product.price && (
                        <span className="text-[10px] text-gray-400 line-through font-medium">
                            ₹{product.mrp}
                        </span>
                    )}
                </div>

                {/* Bottom Actions - Add to Cart and Buy Now side-by-side */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const cartIcon = document.getElementById('cart-icon-container');
                            if (imageRef.current && cartIcon) {
                                animateAddToCart(imageRef.current, cartIcon, product.image);
                            }
                            addToCart(product, 1);
                        }}
                        className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-opacity-95 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider active:scale-[0.98] disabled:opacity-50"
                        disabled={product.countInStock === 0}
                    >
                        <ShoppingCart size={13} />
                        <span>Add</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsWhatsAppModalOpen(true);
                        }}
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-xl hover:bg-[#1da851] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider active:scale-[0.98]"
                    >
                        <MessageCircle size={13} />
                        <span>Buy Now</span>
                    </button>
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
