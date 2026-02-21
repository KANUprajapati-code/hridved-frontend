import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useContext } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

const CartPage = () => {
    const { cart, removeFromCart, updateCartItemQuantity } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await api.get('/products?isBestseller=true&limit=4');
                setRecommendedProducts(data.products || []);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };
        fetchRecommendations();
    }, []);

    const cartItems = cart?.cartItems || [];

    // Mock coupon data - replace with API call in production
    const validCoupons = {
        'WELLNESS20': { discount: 20, type: 'percentage' },
        'SAVE50': { discount: 50, type: 'fixed' },
        'FIRST10': { discount: 10, type: 'percentage' },
        'HEALTHY25': { discount: 25, type: 'percentage' },
    };

    const checkoutHandler = () => {
        if (!user) {
            navigate('/login?redirect=checkout/address');
        } else {
            navigate('/checkout/address');
        }
    };

    const handleApplyCoupon = () => {
        const coupon = validCoupons[promoCode.toUpperCase()];
        if (coupon) {
            setAppliedCoupon({ code: promoCode.toUpperCase(), ...coupon });
            setCouponError('');
        } else {
            setCouponError('Invalid coupon code');
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setPromoCode('');
        setCouponError('');
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discount = (subtotal * appliedCoupon.discount) / 100;
        } else {
            discount = appliedCoupon.discount;
        }
    }

    const discountedSubtotal = subtotal - discount;
    const shipping = discountedSubtotal > 499 ? 0 : 50;
    const tax = Math.round(discountedSubtotal * 0.18); // 18% GST
    const total = discountedSubtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <AnimatedPage>
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-6 rounded-full text-primary">
                            <ShoppingBag size={48} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-4 text-gray-800">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven&apos;t added any Ayurvedic wellness products to your cart yet.</p>
                    <Link to="/shop">
                        <AnimatedButton className="bg-primary text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition inline-flex items-center font-bold shadow-lg hover:shadow-xl border-none">
                            Explore Shop <ArrowRight size={18} className="ml-2" />
                        </AnimatedButton>
                    </Link>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="bg-background min-h-screen">
                {/* Free Shipping Banner */}
                <div className="bg-primary text-white text-center py-2 text-sm font-medium tracking-wide">
                    Free Shipping Above ₹499
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center text-sm text-gray-500 mb-8">
                        <Link to="/shop" className="hover:text-primary flex items-center">
                            <ArrowRight size={14} className="rotate-180 mr-2" /> Continue Shopping
                        </Link>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <h1 className="text-4xl font-serif font-bold text-gray-900">Shopping Cart</h1>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{cartItems.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Side: Cart Items */}
                        <div className="lg:w-2/3 space-y-6">
                            {cartItems.map((item, index) => (
                                <ScrollReveal key={item.product} delay={index * 0.1}>
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start transition hover:shadow-md">
                                        <Link to={`/product/${item.product}`} className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </Link>

                                        <div className="flex-grow w-full text-center sm:text-left">
                                            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">AYURVEDA</p>
                                            <Link to={`/product/${item.product}`} className="font-serif font-bold text-lg text-gray-800 hover:text-primary transition-colors block mb-2">
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 mb-4">
                                                <button className="hover:text-primary flex items-center gap-1">
                                                    <span>♡</span> Save for later
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.product)}
                                                    className="text-red-400 hover:text-red-600 flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                                                    onClick={() => updateCartItemQuantity(item.product, Math.max(1, item.qty - 1))}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm border-x border-gray-200 py-1.5">{item.qty}</span>
                                                <button
                                                    className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                                                    onClick={() => updateCartItemQuantity(item.product, item.qty + 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg text-gray-900">₹{item.price * item.qty}</span>
                                                {item.qty > 1 && <span className="text-xs text-gray-400">₹{item.price} each</span>}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}

                            {/* Gift/Offer Banner */}
                            <ScrollReveal delay={0.2}>
                                <div className="bg-white border border-dashed border-secondary/50 rounded-xl p-4 flex items-center gap-4">
                                    <Truck className="text-primary" size={24} />
                                    <p className="text-sm text-gray-700 font-medium">Congratulations! You&apos;ve unlocked free standard shipping.</p>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right Side: Order Summary */}
                        <div className="lg:w-1/3">
                            <ScrollReveal delay={0.3}>
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                    <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-primary" /> Order Summary
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                                        </div>

                                        {appliedCoupon && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount ({appliedCoupon.code})</span>
                                                <span className="font-bold">-₹{discount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping Estimate</span>
                                            <span className="font-bold text-green-600">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                                        </div>

                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax (18% GST)</span>
                                            <span className="font-bold text-gray-900">₹{tax.toLocaleString()}</span>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                            <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                            <span className="font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">Inclusive of all taxes</p>
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Apply Promo Code</label>
                                        {appliedCoupon ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-green-800 text-sm">{appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600">
                                                        {appliedCoupon.type === 'percentage'
                                                            ? `${appliedCoupon.discount}% discount`
                                                            : `₹${appliedCoupon.discount} discount`
                                                        }
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-xs text-red-600 hover:text-red-700 font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={promoCode}
                                                        onChange={(e) => {
                                                            setPromoCode(e.target.value);
                                                            setCouponError('');
                                                        }}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                        placeholder="e.g. WELLNESS20"
                                                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                    />
                                                    <AnimatedButton
                                                        onClick={handleApplyCoupon}
                                                        disabled={!promoCode}
                                                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition disabled:bg-gray-300 disabled:cursor-not-allowed border-none"
                                                    >
                                                        Apply
                                                    </AnimatedButton>
                                                </div>
                                                {couponError && (
                                                    <p className="text-xs text-red-600 font-medium">{couponError}</p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">Try: WELLNESS20, SAVE50, HEALTHY25</p>
                                            </>
                                        )}
                                    </div>

                                    <AnimatedButton
                                        onClick={checkoutHandler}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all block text-center border-none"
                                    >
                                        Proceed to Checkout
                                    </AnimatedButton>

                                    <div className="grid grid-cols-3 gap-2 mt-8 py-6 border-t border-gray-100">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Secure Pay</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
                                                <RefreshCw size={16} />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Easy Returns</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
                                                <Truck size={16} />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Tracked</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Need help with your order?</p>
                                            <p className="text-[10px] text-gray-500">Our experts are here 24/7</p>
                                        </div>
                                        <button className="text-primary text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow">Contact Us</button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>

                    {/* You Might Also Like */}
                    <div className="mt-20">
                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-8">You Might Also Like</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CartPage;
