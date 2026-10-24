import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Star, Truck, ShieldCheck, ShoppingCart, Clock, Heart, Zap, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import ImageZoom from '../components/ImageZoom';
import PincodeShippingCheck from '../components/PincodeShippingCheck';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import { useFlyingElement } from '../hooks/useFlyingElement';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';
import { useWishlist } from '../context/WishlistContext';
import { useJourneyAnalytics } from '../context/JourneyAnalyticsContext';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [qty, setQty] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { addToCart } = useCart();
    const { track } = useJourneyAnalytics();
    const { user } = useAuth();
    const { addToast } = useContext(ToastContext) || {};
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [activeTab, setActiveTab] = useState('description');
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

    // Animation hooks
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);
    const purchaseProduct = product && selectedVariant ? {
        ...product,
        name: `${product.name} (${selectedVariant.name})`,
        price: Number(selectedVariant.price),
        mrp: Number(selectedVariant.mrp || selectedVariant.price),
        countInStock: Number(selectedVariant.countInStock ?? product.countInStock),
        variantName: selectedVariant.name,
    } : product;

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
            setSelectedVariant(data.variants?.[0] || null);

            // Fetch all products to filter related ones (simple approach)
            const { data: allProductsData } = await api.get('/products');
            const filtered = allProductsData.products
                .filter(p => p.category === data.category && p._id !== data._id)
                .slice(0, 4);
            setRelatedProducts(filtered);
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product?._id) track({ type: 'product_view', productId: product._id, productName: product.name, price: Number(product.price) || 0 });
    }, [product?._id, track]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            if (addToast) addToast('Please select a rating', 'error');
            return;
        }

        try {
            setReviewLoading(true);
            await api.post(`/products/${id}/reviews`, { rating, comment });
            if (addToast) addToast('Review submitted successfully!', 'success');
            setRating(0);
            setComment('');
            fetchProduct();
        } catch (error) {
            if (addToast) addToast(error.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddToCart = () => {
        // Trigger flying animation
        const cartIcon = document.getElementById('cart-icon-container');
        if (imageRef.current && cartIcon) {
            animateAddToCart(imageRef.current, cartIcon, product.image);
        }

        // Add to cart logic
        addToCart(purchaseProduct, qty);
    };

    const handleBuyNow = () => {
        addToCart(purchaseProduct, qty);
        navigate('/cart');
    };

    const handleWhatsAppOrder = () => {
        setIsWhatsAppModalOpen(true);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <AnimatedPage>
            <SEO 
                title={product.name}
                description={product.description}
                ogImage={product.image}
                ogType="product"
                product={product}
            />
            <div className="bg-background min-h-screen pb-12">
                <div className="container mx-auto px-4 py-8">
                    <nav className="text-sm mb-6 text-gray-500">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/shop" className="hover:text-primary">Shop</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">{product.name}</span>
                    </nav>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">
                            {/* Image Section */}
                            <div className="p-4 md:p-8 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100" ref={imageRef}>
                                <ImageZoom
                                    images={
                                        product.images && product.images.length > 0
                                            ? [product.image, ...product.images]
                                            : [product.image]
                                    }
                                />
                            </div>

                            {/* Details Section */}
                            <div className="p-4 md:p-8 lg:p-12 bg-white">
                                <h1 className="text-3xl md:text-5xl font-sans font-bold text-primary mb-2 leading-tight">{product.name}</h1>
                                <div className="text-sm text-secondary font-bold uppercase tracking-wider mb-4">{product.category}</div>

                                <div className="flex items-center mb-6">
                                    <div className="flex text-secondary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < product.rating ? "currentColor" : "none"} className={i < product.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <span className="ml-3 text-gray-500 text-sm border-l pl-3 border-gray-300">Read {product.numReviews} Reviews</span>
                                </div>
                                {product.variants?.length > 0 && (
                                    <fieldset className="mb-6">
                                        <legend className="font-bold text-gray-700 mb-2">Choose a pack</legend>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {product.variants.map((variant) => (
                                                <button key={variant._id || variant.name} type="button" onClick={() => { setSelectedVariant(variant); setQty(1); }} className={`rounded-xl border p-3 text-left transition ${selectedVariant?.name === variant.name ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary'}`}>
                                                    <span className="block font-bold text-sm text-primary">{variant.name}</span>
                                                    <span className="block text-sm mt-1">₹{variant.price}</span>
                                                    {variant.mrp > variant.price && <span className="block text-xs text-gray-400 line-through">₹{variant.mrp}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-black text-gray-900">₹{purchaseProduct.price}</span>
                                            {purchaseProduct.mrp > purchaseProduct.price && (
                                                <span className="text-xl text-gray-400 line-through">₹{purchaseProduct.mrp}</span>
                                            )}
                                        </div>
                                        {purchaseProduct.mrp > purchaseProduct.price && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-green-600 font-extrabold text-lg">
                                                    {Math.round(((purchaseProduct.mrp - purchaseProduct.price) / purchaseProduct.mrp) * 100)}% OFF
                                                </span>
                                                <span className="text-green-700 font-medium text-sm bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                    Save ₹{purchaseProduct.mrp - purchaseProduct.price}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`${purchaseProduct.countInStock > 0 ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'} text-sm font-medium px-3 py-1 rounded-full border ml-auto sm:ml-0`}>{purchaseProduct.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                                </div>

                                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                                    {product.description.substring(0, 150)}...
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                                    <div className="flex items-center border border-gray-300 rounded-full h-12 w-full sm:w-32 justify-between">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="w-12 sm:w-10 h-full hover:bg-gray-100 rounded-l-full flex items-center justify-center text-gray-600 font-bold text-xl"
                                        >-</button>
                                        <div className="flex-1 text-center font-bold text-gray-800">{qty}</div>
                                        <button
                                            onClick={() => setQty(Math.min(purchaseProduct.countInStock || 10, qty + 1))}
                                            className="w-12 sm:w-10 h-full hover:bg-gray-100 rounded-r-full flex items-center justify-center text-gray-600 font-bold text-xl"
                                        >+</button>
                                    </div>
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={purchaseProduct.countInStock === 0}
                                            className="flex-1 bg-white text-primary border-2 border-primary h-12 rounded-full font-bold hover:bg-primary hover:text-white transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-2 w-full"
                                        >
                                            <ShoppingCart size={20} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={handleWhatsAppOrder}
                                            disabled={purchaseProduct.countInStock === 0}
                                            className="flex-1 bg-[#25D366] text-white h-12 rounded-full font-bold hover:bg-[#1da851] transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed border-none text-sm px-2 w-full"
                                        >
                                            <MessageCircle size={20} />
                                                    {purchaseProduct.countInStock === 0 ? 'Out of Stock' : 'Order on WhatsApp'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleWishlist(product)}
                                        aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                        className={`flex w-12 h-12 rounded-full border border-gray-200 items-center justify-center hover:text-red-500 hover:bg-red-50 transition shadow-sm ${isWishlisted(product._id) ? 'text-red-500' : 'text-gray-400'}`}
                                        title={isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    >
                                        <Heart size={20} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Truck className="text-primary mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Free Shipping</h4>
                                            <p className="text-xs text-gray-500">On all orders above ₹999</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="text-primary mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Authentic & Pure</h4>
                                            <p className="text-xs text-gray-500">100% genuine products</p>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>
                        </div>
                    </div>

                    {/* Info Tabs */}
                    <ScrollReveal>
                        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
                                <button
                                    className={`pb-4 px-4 sm:px-6 font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${activeTab === 'description' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`pb-4 px-4 sm:px-6 font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${activeTab === 'benefits' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('benefits')}
                                >
                                    Benefits
                                </button>
                                <button
                                    className={`pb-4 px-4 sm:px-6 font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${activeTab === 'usage' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('usage')}
                                >
                                    How to Use
                                </button>
                                <button
                                    className={`pb-4 px-4 sm:px-6 font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    Reviews ({product.numReviews})
                                </button>
                            </div>

                            <div className="prose max-w-none text-gray-600">
                                {activeTab === 'description' && (
                                    <div>
                                        <p>{product.description}</p>
                                    </div>
                                )}
                                {activeTab === 'benefits' && (
                                    <div className="whitespace-pre-line">
                                        {product.benefits || (
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li>Promotes overall wellness and balance.</li>
                                                <li>Formulated with time-tested Ayurvedic herbs.</li>
                                                <li>Supports natural body functions.</li>
                                                <li>Free from harmful chemicals.</li>
                                            </ul>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'usage' && (
                                    <div className="flex gap-4 items-start bg-yellow-50 p-4 rounded-lg">
                                        <Clock className="text-secondary shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">How to Use</h4>
                                            <div className="whitespace-pre-line">
                                                {product.howToUse || "Take 1-2 tablets twice daily with warm water, or as directed by your physician."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'reviews' && (
                                    <div>
                                        {product.reviews.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-xl">No reviews yet. Be the first to review!</div>
                                        ) : (
                                            product.reviews.map(review => (
                                                <div key={review._id} className="border-b pb-4 mb-4 last:border-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-gray-800">{review.name}</span>
                                                        <span className="text-xs text-gray-400">{review.createdAt?.substring(0, 10)}</span>
                                                    </div>
                                                    <div className="flex text-secondary text-sm mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-600">{review.comment}</p>
                                                </div>
                                            ))
                                        )}

                                        {/* Write a review form */}
                                        <div className="mt-12 pt-8 border-t border-gray-100">
                                            <h3 className="text-xl md:text-2xl font-sans font-bold text-gray-900 mb-6 text-center">Write a Customer Review</h3>
                                            {user ? (
                                                <form onSubmit={submitReviewHandler} className="max-w-lg mx-auto space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setRating(star)}
                                                                    className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                >
                                                                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="comment" className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                                        <textarea
                                                            id="comment"
                                                            rows="4"
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
                                                            placeholder="Share your experience with this product..."
                                                            required
                                                        ></textarea>
                                                    </div>
                                                    <div className="text-center">
                                                        <AnimatedButton
                                                            type="submit"
                                                            disabled={reviewLoading}
                                                            className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 border-none"
                                                        >
                                                            {reviewLoading ? 'Submitting...' : 'Post Review'}
                                                        </AnimatedButton>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="text-center py-6 bg-gray-50 rounded-xl">
                                                    <p className="text-gray-600 mb-4 font-medium">Please sign in to write a review</p>
                                                    <Link to={`/login?redirect=product/${id}`}>
                                                        <AnimatedButton className="bg-primary text-white px-8 py-2 rounded-full font-bold border-none">
                                                            Login to Review
                                                        </AnimatedButton>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-20">
                            <ScrollReveal>
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <h2 className="text-3xl font-sans font-bold text-primary">Related Products</h2>
                                        <p className="text-gray-500 mt-2">More items you might find helpful from {product.category}.</p>
                                    </div>
                                    <Link to="/shop" className="text-primary font-bold text-sm tracking-wider uppercase hover:text-secondary hover:underline underline-offset-4">
                                        View All
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {relatedProducts.map((p) => (
                                        <ProductCard key={p._id} product={p} />
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>
                    )}
                </div>
            </div>

            <WhatsAppOrderModal 
                product={purchaseProduct} 
                isOpen={isWhatsAppModalOpen} 
                onClose={() => setIsWhatsAppModalOpen(false)} 
            />
        </AnimatedPage>
    );
};

export default ProductPage;
