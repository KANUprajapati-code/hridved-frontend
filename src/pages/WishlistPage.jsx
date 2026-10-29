import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

const WishlistPage = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart, openCartDrawer } = useCart();
    const { addToast } = useToast() || {};

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        if (addToast) {
            addToast(`Added ${product.name} to cart`, 'success');
        }
        if (openCartDrawer) {
            openCartDrawer();
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-8 sm:py-12">
            <SEO
                title="My Wishlist"
                description="View and manage your saved authentic Ayurvedic remedies and formulations."
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Saved Wishlist', path: '/wishlist' }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/shop" className="hover:text-primary transition-colors">Apothecary</Link>
                    <ChevronRight size={14} />
                    <span className="text-primary font-bold">My Wishlist</span>
                </nav>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200/80 pb-6 mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-secondary text-xs uppercase font-bold tracking-widest mb-1.5">
                            <Sparkles size={14} /> Curated Remedies
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary flex items-center gap-3">
                            My Saved Wishlist
                            {wishlist.length > 0 && (
                                <span className="text-sm font-sans font-bold bg-primary text-secondary px-3 py-1 rounded-full">
                                    {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1 max-w-xl">
                            Save your preferred Ayurvedic formulations, oil blends, and holistic health courses for quick access.
                        </p>
                    </div>

                    {wishlist.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                                    clearWishlist();
                                    if (addToast) addToast('Wishlist cleared', 'info');
                                }
                            }}
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors py-2 px-3 rounded-lg border border-gray-200 hover:border-red-200 bg-white shadow-sm"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>

                {/* Wishlist Items Grid or Empty State */}
                {wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto border border-gray-100 shadow-sm my-12"
                    >
                        <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center text-primary mb-6">
                            <Heart size={36} className="text-primary/70" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
                            Your Wishlist is Empty
                        </h2>
                        <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                            You haven't saved any herbal remedies to your wishlist yet. Explore our handcrafted authentic formulations and save your favorites.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-[#07470a] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            <ShoppingBag size={16} className="text-secondary" />
                            <span>Explore Apothecary</span>
                            <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {wishlist.map((item) => {
                                const productId = item._id || item;
                                const originalPrice = Number(item.originalPrice) || Number(item.mrp) || 0;
                                const currentPrice = Number(item.price) || 0;
                                const discountPct = originalPrice > currentPrice
                                    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                                    : 0;

                                return (
                                    <motion.div
                                        key={productId}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group relative"
                                    >
                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeFromWishlist(productId)}
                                            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Discount Badge */}
                                        {discountPct > 0 && (
                                            <span className="absolute top-3 left-3 z-10 bg-secondary text-primary font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {discountPct}% OFF
                                            </span>
                                        )}

                                        {/* Product Image */}
                                        <Link
                                            to={`/product/${productId}`}
                                            className="block aspect-square overflow-hidden bg-gray-50 relative"
                                        >
                                            <img
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1608248597359-2e061807353f?auto=format&fit=crop&q=80&w=600';
                                                }}
                                            />
                                        </Link>

                                        {/* Content */}
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                {/* Category */}
                                                <div className="text-[10px] uppercase font-bold text-secondary tracking-widest mb-1">
                                                    {item.category || 'Ayurvedic Care'}
                                                </div>

                                                {/* Title */}
                                                <Link
                                                    to={`/product/${productId}`}
                                                    className="block font-serif font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-2 leading-snug"
                                                >
                                                    {item.name}
                                                </Link>

                                                {/* Price Row */}
                                                <div className="flex items-baseline gap-2 mt-2">
                                                    <span className="text-lg font-bold text-primary">
                                                        ₹{currentPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    {originalPrice > currentPrice && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{originalPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Indicator */}
                                                <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700 font-medium">
                                                    <Check size={13} className="text-emerald-600" />
                                                    <span>Verified In Stock</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(item)}
                                                    className="flex-1 bg-primary hover:bg-[#07470a] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow hover:shadow-md transition-all active:scale-[0.98]"
                                                >
                                                    <ShoppingBag size={14} className="text-secondary" />
                                                    <span>Add to Cart</span>
                                                </button>
                                                <Link
                                                    to={`/product/${productId}`}
                                                    className="px-3 py-2.5 rounded-xl border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-bold text-xs transition-colors flex items-center justify-center"
                                                    title="View product details"
                                                >
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
