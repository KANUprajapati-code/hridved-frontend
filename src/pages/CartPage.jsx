import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';

const CartPage = () => {
    const { cart, removeFromCart, updateCartItemQuantity } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

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

    // Dummy recommended products (replace with real data in production)
    const recommendedProducts = [
        { id: 101, name: 'Ayurvedic Soap Bar', price: 85, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&q=80' },
        { id: 102, name: 'Ashwagandha Tablets', price: 320, image: 'https://images.unsplash.com/photo-1611079830811-865ecdd7d792?w=200&q=80' },
        { id: 103, name: 'Amla Hair Oil', price: 195, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80' },
        { id: 104, name: 'Tulsi Cough Syrup', price: 120, image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200&q=80' },
    ];

    if (cartItems.length === 0) {
        return (
            <AnimatedPage>
                <div className="container-full py-16 sm:py-20 md:py-24 text-center">
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="bg-primary/10 p-6 sm:p-8 rounded-full text-primary">
                            <ShoppingBag size={52} className="sm:w-16 sm:h-16" />
                        </div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6 text-gray-900">Your Cart is Empty</h2>
                    <p className="text-gray-700 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">Looks like you haven&apos;t added any Ayurvedic wellness products to your cart yet.</p>
                    <Link to="/shop">
                        <AnimatedButton className="bg-primary text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl border-none">
                            Explore Shop <ArrowRight size={20} />
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
                <div className="bg-primary text-white text-center py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide">
                    Free Shipping Above ₹499
                </div>

                <div className="container-full py-6 sm:py-8 md:py-10">
                    <div className="flex items-center text-sm text-gray-600 mb-8 sm:mb-10">
                        <Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-2">
                            <ArrowRight size={16} className="rotate-180" /> Continue Shopping
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-6 mb-10 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">Shopping Cart</h1>
                        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm sm:text-base font-semibold">{cartItems.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Left Side: Cart Items */}
                        <div className="lg:w-2/3 space-y-4 sm:space-y-6">
                            {cartItems.map((item, index) => (
                                <ScrollReveal key={item.product} delay={index * 0.1}>
                                    <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start">
                                        <Link to={`/product/${item.product}`} className="w-full sm:w-36 h-36 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                        </Link>

                                        <div className="flex-grow w-full">
                                            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Ayurvedic Product</p>
                                            <Link to={`/product/${item.product}`} className="font-serif font-bold text-lg sm:text-xl text-gray-900 hover:text-primary transition-colors block mb-3">
                                                {item.name}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-4">
                                                <button className="hover:text-primary transition-colors flex items-center gap-1.5">
                                                    <span>♡</span> Save for later
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.product)}
                                                    className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Trash2 size={16} /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                                <button
                                                    className="px-3 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                                                    onClick={() => updateCartItemQuantity(item.product, Math.max(1, item.qty - 1))}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-semibold text-base border-x border-gray-300 py-2">{item.qty}</span>
                                                <button
                                                    className="px-3 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                                                    onClick={() => updateCartItemQuantity(item.product, item.qty + 1)}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg sm:text-xl text-gray-900">₹{item.price * item.qty}</span>
                                                {item.qty > 1 && <span className="text-xs text-gray-500">₹{item.price} each</span>}
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ScrollReveal key={product.id}>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="h-40 bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm mb-1">{product.name}</h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-primary font-bold">₹{product.price}</span>
                                            <button className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-primary hover:text-white transition">Add</button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CartPage;
