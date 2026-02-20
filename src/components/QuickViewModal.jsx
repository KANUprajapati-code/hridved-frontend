import { useState } from 'react';
import { X, Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductImage from './ProductImage';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
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
                            <div className="mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ₹{product.price}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">
                                            ₹{product.originalPrice}
                                        </span>
                                    )}
                                </div>
                            </div>

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
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            isWishlisted
                                                ? 'bg-red-100 border-red-300 text-red-600'
                                                : 'border-gray-300 text-gray-600 hover:border-red-300'
                                        }`}
                                    >
                                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.countInStock === 0}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>

                                <Link
                                    to={`/product/${product._id}`}
                                    onClick={onClose}
                                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
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
