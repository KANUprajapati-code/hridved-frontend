import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Star, Truck, ShieldCheck, ShoppingCart, Clock, Heart, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ImageZoom from '../components/ImageZoom';
import PincodeShippingCheck from '../components/PincodeShippingCheck';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import { useFlyingElement } from '../hooks/useFlyingElement';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState('description');

    // Animation hooks
    const { animateAddToCart } = useFlyingElement();
    const imageRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        // Trigger flying animation
        const cartIcon = document.getElementById('cart-icon-container');
        if (imageRef.current && cartIcon) {
            animateAddToCart(imageRef.current, cartIcon, product.image);
        }

        // Add to cart logic
        addToCart(product, qty);
    };

    const handleBuyNow = () => {
        addToCart(product, qty);
        navigate('/checkout/address');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <AnimatedPage>
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
                            <div className="p-8 bg-gray-50 flex flex-col justify-between" ref={imageRef}>
                                <ImageZoom
                                    images={
                                        product.images && product.images.length > 0
                                            ? [product.image, ...product.images]
                                            : [product.image]
                                    }
                                />
                            </div>

                            {/* Details Section */}
                            <div className="p-8 lg:p-12">
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">{product.name}</h1>
                                <div className="text-sm text-secondary font-bold uppercase tracking-wider mb-4">{product.category}</div>

                                <div className="flex items-center mb-6">
                                    <div className="flex text-secondary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < product.rating ? "currentColor" : "none"} className={i < product.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <span className="ml-3 text-gray-500 text-sm border-l pl-3 border-gray-300">Read {product.numReviews} Reviews</span>
                                </div>



                                <div className="flex items-baseline gap-4 mb-8">
                                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                                    <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">In Stock</span>
                                </div>

                                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                                    {product.description.substring(0, 150)}...
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <div className="flex items-center border border-gray-300 rounded-full h-12 w-32">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="w-10 h-full hover:bg-gray-100 rounded-l-full flex items-center justify-center text-gray-600 font-bold text-xl"
                                        >-</button>
                                        <div className="flex-1 text-center font-bold text-gray-800">{qty}</div>
                                        <button
                                            onClick={() => setQty(Math.min(product.countInStock || 10, qty + 1))}
                                            className="w-10 h-full hover:bg-gray-100 rounded-r-full flex items-center justify-center text-gray-600 font-bold text-xl"
                                        >+</button>
                                    </div>
                                    <AnimatedButton
                                        onClick={handleBuyNow}
                                        disabled={product.countInStock === 0}
                                        className="flex-1 bg-orange-500 text-white h-12 rounded-full font-bold hover:bg-opacity-90 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed border-none"
                                    >
                                        <Zap size={20} />
                                        Buy Now
                                    </AnimatedButton>
                                    <AnimatedButton
                                        onClick={handleAddToCart}
                                        disabled={product.countInStock === 0}
                                        className="flex-1 bg-primary text-white h-12 rounded-full font-bold hover:bg-opacity-90 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed border-none"
                                    >
                                        <ShoppingCart size={20} />
                                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </AnimatedButton>
                                    <button
                                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm"
                                        title="Add to Wishlist"
                                    >
                                        <Heart size={20} />
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

                                {/* Pincode Shipping Check */}
                                <PincodeShippingCheck productPrice={product.price} />
                            </div>
                        </div>
                    </div>

                    {/* Info Tabs */}
                    <ScrollReveal>
                        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
                                <button
                                    className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-colors ${activeTab === 'description' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-colors ${activeTab === 'benefits' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('benefits')}
                                >
                                    Benefits
                                </button>
                                <button
                                    className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-colors ${activeTab === 'usage' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setActiveTab('usage')}
                                >
                                    How to Use
                                </button>
                                <button
                                    className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
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
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Promotes overall wellness and balance.</li>
                                        <li>Formulated with time-tested Ayurvedic herbs.</li>
                                        <li>Supports natural body functions.</li>
                                        <li>Free from harmful chemicals.</li>
                                    </ul>
                                )}
                                {activeTab === 'usage' && (
                                    <div className="flex gap-4 items-start bg-yellow-50 p-4 rounded-lg">
                                        <Clock className="text-secondary shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">Recommended Dosage</h4>
                                            <p>Take 1-2 tablets twice daily with warm water, or as directed by your physician.</p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'reviews' && (
                                    <div>
                                        {product.reviews.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded">No reviews yet. Be the first to review!</div>
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
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ProductPage;
