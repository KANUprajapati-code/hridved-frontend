import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import ProductImage from './ProductImage';

const ProductCard = ({ product, onQuickView }) => {
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Randomize a badge for demo purposes (mimicking the design)
    const badge = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'New' : 'Sale') : null;
    const badgeColor = badge === 'New' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full group overflow-hidden">
            <div className="relative overflow-hidden h-64 sm:h-72 bg-gray-100 rounded-t-lg">
                {badge && (
                    <span className={`absolute top-3 left-3 ${badgeColor} text-white text-xs sm:text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10`}>
                        {badge}
                    </span>
                )}
                <Link to={`/product/${product._id}`} className="block h-full w-full group/image">
                    <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500"
                    />
                </Link>
                {/* Overlay with Quick View and Wishlist */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-4">
                    <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="bg-white text-gray-900 p-3 sm:p-4 rounded-full shadow-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0"
                        title="Quick View"
                        aria-label="Quick view product"
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`p-3 sm:p-4 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 ${
                            isWishlisted ? 'bg-red-100 text-red-600' : 'bg-white text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Add to Wishlist"
                        aria-label="Add to wishlist"
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-grow gap-4">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-gray-500 text-xs">({product.numReviews || 0})</span>
                    </div>
                </div>

                <Link to={`/product/${product._id}`} className="block flex-grow">
                    <h3 className="font-serif font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">{product.category}</p>
                </Link>

                <div className="flex justify-between items-end gap-3 pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{product.price}</span>
                        {badge === 'Sale' && <span className="text-xs text-gray-500 line-through">₹{Math.round(product.price * 1.2)}</span>}
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        className="bg-primary text-white p-3 sm:p-4 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        title="Add to Cart"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
