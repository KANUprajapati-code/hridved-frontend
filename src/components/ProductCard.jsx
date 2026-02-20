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
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
            <div className="relative overflow-hidden h-64 bg-gray-50 rounded-t-xl">
                {badge && (
                    <span className={`absolute top-3 left-3 ${badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10`}>
                        {badge}
                    </span>
                )}
                <Link to={`/product/${product._id}`} className="block h-full w-full group/image">
                    <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full group-hover/image:scale-105 transition-transform duration-500"
                    />
                </Link>
                {/* Overlay with Quick View and Wishlist */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-transform"
                        title="Quick View"
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-transform ${
                            isWishlisted ? 'bg-red-100 text-red-600' : 'bg-white text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Add to Wishlist"
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex text-yellow-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                        <span className="text-gray-400 ml-1 text-xs">({product.numReviews || 0})</span>
                    </div>
                </div>

                <Link to={`/product/${product._id}`} className="block flex-grow">
                    <h3 className="font-serif font-bold text-gray-800 text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">{product.category}</p>
                </Link>

                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        {badge === 'Sale' && <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>}
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        className="bg-primary text-white p-2.5 rounded-full hover:bg-secondary hover:text-primary transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95"
                        title="Add to Cart"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
