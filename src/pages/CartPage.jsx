import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../context/CheckoutContext';
import { useState, useEffect, useContext } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import PincodeShippingCheck from '../components/PincodeShippingCheck';

const CartPage = () => {
    const { cart, removeFromCart, updateCartItemQuantity } = useCart();
    const { user } = useAuth();
    const { checkoutData, applyCoupon } = useCheckout();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState(checkoutData.coupon?.code || '');
    const [appliedCoupon, setAppliedCoupon] = useState(checkoutData.coupon || null);
    const [couponError, setCouponError] = useState('');
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const { addToast } = useContext(ToastContext);
    
    // WhatsApp Checkout State
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        mobileNumber: '',
        email: '',
        houseNumber: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!shippingDetails.fullName.trim()) errors.fullName = 'Required';
        if (!shippingDetails.mobileNumber.trim()) errors.mobileNumber = 'Required';
        else if (shippingDetails.mobileNumber.trim().length < 10) errors.mobileNumber = 'Invalid';
        if (!shippingDetails.houseNumber.trim()) errors.houseNumber = 'Required';
        if (!shippingDetails.city.trim()) errors.city = 'Required';
        if (!shippingDetails.state.trim()) errors.state = 'Required';
        if (!shippingDetails.pincode.trim()) errors.pincode = 'Required';
        else if (shippingDetails.pincode.trim().length < 6) errors.pincode = 'Invalid';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleWhatsAppCheckout = async () => {
        if (!validateForm()) {
            if (addToast) addToast('Please fill all required fields correctly', 'error');
            return;
        }

        setIsProcessingOrder(true);
        try {
            const codCharge = paymentMethod === 'COD' ? 50 : 0;

            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    qty: item.qty,
                    weight: item.weight || 0.5
                })),
                shippingAddress: {
                    fullName: shippingDetails.fullName,
                    mobileNumber: shippingDetails.mobileNumber,
                    houseNumber: shippingDetails.houseNumber,
                    landmark: shippingDetails.landmark,
                    city: shippingDetails.city,
                    state: shippingDetails.state,
                    pincode: shippingDetails.pincode
                },
                email: shippingDetails.email,
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                codPrice: codCharge,
                totalPrice: total,
                discountAmount: discount,
                paymentMethod: paymentMethod === 'COD' ? 'WhatsApp COD' : 'WhatsApp Prepaid'
            };

            const { data } = await api.post('/orders/whatsapp', orderData);
            
            let msg = `Hello, I want to place an order:\n\n🛒 *Order Details:*\n`;
            cartItems.forEach((item, idx) => {
                msg += `${idx + 1}. ${item.name} (Qty: ${item.qty}) - ₹${item.price * item.qty}\n`;
            });
            
            msg += `\n💰 *Pricing:*\n`;
            msg += `Total: ₹${subtotal}\n`;
            if (appliedCoupon) {
                msg += `Promo Code: ${appliedCoupon.code}\n`;
                msg += `Discount: -₹${discount}\n`;
            }
            if (shipping > 0) msg += `Shipping: ₹${shipping}\n`;
            if (tax > 0) msg += `GST: ₹${tax.toFixed(2)}\n`;
            if (codCharge > 0) msg += `COD Fee: ₹${codCharge}\n`;
            msg += `*Final Amount: ₹${total.toFixed(2)}*\n\n`;

            msg += `📦 *Shipping Details:*\n`;
            msg += `Name: ${shippingDetails.fullName}\n`;
            msg += `Phone: ${shippingDetails.mobileNumber}\n`;
            if (shippingDetails.email) msg += `Email: ${shippingDetails.email}\n`;
            msg += `Address: ${shippingDetails.houseNumber}${shippingDetails.landmark ? ', ' + shippingDetails.landmark : ''}\n`;
            msg += `City: ${shippingDetails.city}\n`;
            msg += `State: ${shippingDetails.state}\n`;
            msg += `Pincode: ${shippingDetails.pincode}\n\n`;
            
            msg += `💳 *Payment Method:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (Online Payment)'}\n\n`;
            
            msg += `🔗 Order Source: ${window.location.href}\n`;
            if (data._id) {
                msg += `📄 Order Ref: ${data._id}\n`;
            }
            msg += `\nPlease confirm my order.`;

            const encodedMsg = encodeURIComponent(msg);
            // Replace XXXXXXXXXX with actual WhatsApp number
            const waNumber = '917990411390'; // Using a placeholder that user can configure
            const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;
            
            window.open(waLink, '_blank');
            
            if (addToast) addToast('Order placed! Redirecting to WhatsApp...', 'success');
            
            cartItems.forEach(item => removeFromCart(item.product));
            
            setTimeout(() => navigate('/shop'), 2000);
        } catch (error) {
            console.error('WhatsApp Checkout Error:', error);
            if (addToast) addToast('Failed to process order. Please try again.', 'error');
        } finally {
            setIsProcessingOrder(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!promoCode) return;

        try {
            const { data } = await api.post('/coupons/validate', {
                code: promoCode,
                cartTotal: subtotal
            });

            setAppliedCoupon(data);
            setCouponError('');
            if (addToast) addToast('Coupon applied successfully!', 'success');
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid coupon code';
            setCouponError(msg);
            setAppliedCoupon(null);
            if (addToast) addToast(msg, 'error');
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setPromoCode('');
        setCouponError('');
        applyCoupon(null, 0);
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
    const shipping = discountedSubtotal > 999 ? 0 : 50;

    // Calculate tax based on per-item GST
    const tax = cartItems.reduce((acc, item) => {
        const itemGst = item.gst || 0;
        return acc + (item.price * item.qty * itemGst / 100);
    }, 0);

    const codCharge = paymentMethod === 'COD' ? 50 : 0;
    const total = discountedSubtotal + shipping + tax + codCharge;

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
                {/* Dynamic Free Shipping Banner */}
                <div className="bg-primary text-white py-4 shadow-inner">
                    <div className="container mx-auto px-4">
                        <div className="max-w-xl mx-auto">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Free Shipping Status</span>
                                <span className="text-sm font-medium">
                                    {subtotal >= 999 ? (
                                        <span className="flex items-center gap-1.5 text-secondary">
                                            <Truck size={16} /> FREE SHIPPING UNLOCKED!
                                        </span>
                                    ) : (
                                        `₹${(999 - subtotal).toLocaleString()} more for FREE shipping`
                                    )}
                                </span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                <motion.div 
                                    className="h-full bg-secondary shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-[10px] mt-2 text-center text-white/70 italic">Standard delivery for order value above ₹999 is free of charge.</p>
                        </div>
                    </div>
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
                                <div className="space-y-4">
                                    <div className="bg-white border border-dashed border-secondary/50 rounded-xl p-4 flex items-center gap-4">
                                        <Truck className="text-primary" size={24} />
                                        <p className="text-sm text-gray-700 font-medium">Congratulations! You&apos;ve unlocked free standard shipping.</p>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                        <PincodeShippingCheck />
                                    </div>
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
                                            <span>GST</span>
                                            <span className="font-bold text-gray-900">₹{tax.toLocaleString()}</span>
                                        </div>

                                        {paymentMethod === 'COD' && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>COD Fee</span>
                                                <span className="font-bold text-gray-900">₹{codCharge.toLocaleString()}</span>
                                            </div>
                                        )}


                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                            <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                            <span className="font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
                                        </div>
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

                                    {/* Customer Details Form */}
                                    <div className="mt-8 mb-6 border-t border-gray-100 pt-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Truck size={18} className="text-primary" /> Delivery Details
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    placeholder="Full Name *"
                                                    value={shippingDetails.fullName}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="mobileNumber"
                                                    placeholder="Phone Number *"
                                                    value={shippingDetails.mobileNumber}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Email (Optional)"
                                                    value={shippingDetails.email}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="houseNumber"
                                                    placeholder="Address Line 1 *"
                                                    value={shippingDetails.houseNumber}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${formErrors.houseNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="landmark"
                                                    placeholder="Address Line 2 (Optional)"
                                                    value={shippingDetails.landmark}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-1/2">
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        placeholder="City *"
                                                        value={shippingDetails.city}
                                                        onChange={handleInputChange}
                                                        className={`w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        placeholder="State *"
                                                        value={shippingDetails.state}
                                                        onChange={handleInputChange}
                                                        className={`w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    placeholder="Pincode *"
                                                    value={shippingDetails.pincode}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${formErrors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="mb-6 border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            Payment Method
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'Prepaid' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value="Prepaid" 
                                                    className="hidden" 
                                                    checked={paymentMethod === 'Prepaid'} 
                                                    onChange={() => setPaymentMethod('Prepaid')} 
                                                />
                                                <span className="font-bold text-sm">Online/Prepaid</span>
                                            </label>

                                            <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value="COD" 
                                                    className="hidden" 
                                                    checked={paymentMethod === 'COD'} 
                                                    onChange={() => setPaymentMethod('COD')} 
                                                />
                                                <span className="font-bold text-sm flex flex-col items-center text-center">Cash on Delivery <span className="text-xs text-secondary tracking-widest">+₹50</span></span>
                                            </label>
                                        </div>
                                    </div>

                                    <AnimatedButton
                                        onClick={handleWhatsAppCheckout}
                                        disabled={isProcessingOrder}
                                        className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#128C7E] hover:shadow-xl transition-all block text-center border-none flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                                        </svg>
                                        {isProcessingOrder ? 'Processing...' : 'Place Order on WhatsApp'}
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
