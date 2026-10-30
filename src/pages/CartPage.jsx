import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Trash2, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, 
    ArrowRight, Lock, CheckCircle2, AlertCircle, Tag, Sparkles 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../context/CheckoutContext';
import { ToastContext } from '../context/ToastContext';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import Badge from '../components/Badge';
import PincodeShippingCheck from '../components/PincodeShippingCheck';
import api from '../utils/api';
import { trackLeadEvent } from '../utils/tracking';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const CartPage = () => {
    const { cart, removeFromCart, updateCartItemQuantity, clearCart, calculateShipping, calculateCodFee, shippingConfig } = useCart();
    const { user, openAuthModal } = useAuth();
    const { checkoutData, applyCoupon, updateAddress } = useCheckout();
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};

    const [promoCode, setPromoCode] = useState(checkoutData.coupon?.code || '');
    const [appliedCoupon, setAppliedCoupon] = useState(checkoutData.coupon || null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    // Delivery Details State (Autofilled if logged in)
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
    const [paymentMethod, setPaymentMethod] = useState('Prepaid');

    // Fetch recommended products
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await api.get('/products?isBestseller=true&limit=4');
                setRecommendedProducts(data.products || data || []);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };
        fetchRecommendations();
    }, []);

    // Autofill shipping details if user is logged in
    useEffect(() => {
        if (user) {
            setShippingDetails(prev => ({
                ...prev,
                fullName: prev.fullName || user.name || '',
                mobileNumber: prev.mobileNumber || user.phone || '',
                email: prev.email || (user.email && !user.email.includes('@hridved.in') ? user.email : ''),
                houseNumber: prev.houseNumber || user.address || '',
                city: prev.city || user.city || '',
                pincode: prev.pincode || user.postalCode || '',
            }));
        }
    }, [user]);

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
        if (!shippingDetails.fullName.trim()) errors.fullName = 'Full name is required';
        if (!shippingDetails.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
        else if (shippingDetails.mobileNumber.trim().length < 10) errors.mobileNumber = 'Enter a valid 10-digit number';
        if (!shippingDetails.houseNumber.trim()) errors.houseNumber = 'House/Building is required';
        if (!shippingDetails.city.trim()) errors.city = 'City is required';
        if (!shippingDetails.state.trim()) errors.state = 'State is required';
        if (!shippingDetails.pincode.trim()) errors.pincode = 'Pincode is required';
        else if (shippingDetails.pincode.trim().length < 6) errors.pincode = 'Enter a valid 6-digit pincode';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Calculate core pricing
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);

    // Calculate coupon discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discount = Math.round((subtotal * appliedCoupon.discount) / 100);
        } else {
            discount = Math.min(subtotal, Number(appliedCoupon.discount) || 0);
        }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shipping = calculateShipping ? calculateShipping(discountedSubtotal) : 0;
    const isFreeShipping = shipping === 0;
    const threshold = Number(shippingConfig?.freeShippingThreshold) || 0;
    const hasThreshold = !shippingConfig?.isFreeShipping && threshold > 0 && Number(shippingConfig?.shippingFee) > 0;
    const amountNeeded = hasThreshold ? Math.max(0, threshold - discountedSubtotal) : 0;
    const progressPercent = hasThreshold ? Math.min(100, Math.round((discountedSubtotal / threshold) * 100)) : 100;

    // Per-item statutory GST calculation
    const tax = cartItems.reduce((acc, item) => {
        const itemGst = item.gst || 0;
        return acc + ((item.price * item.qty * itemGst) / 100);
    }, 0);

    const codCharge = calculateCodFee ? calculateCodFee(paymentMethod) : 0;
    const grandTotal = discountedSubtotal + shipping + tax + codCharge;

    useEffect(() => {
        if (cartItems.length > 0) {
            trackWebsiteEvent('view_cart', { cartTotal: subtotal });
        }
    }, [cartItems.length]);

    // Coupon Handlers
    const handleApplyCoupon = async () => {
        if (!promoCode.trim()) return;

        try {
            setCouponLoading(true);
            setCouponError('');
            const { data } = await api.post('/coupons/validate', {
                code: promoCode.trim().toUpperCase(),
                cartTotal: subtotal
            });

            setAppliedCoupon(data);
            applyCoupon(data, data.type === 'percentage' ? Math.round((subtotal * data.discount) / 100) : data.discount);
            if (addToast) addToast(`Coupon ${data.code} applied successfully!`, 'success');
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid or expired promo code';
            setCouponError(msg);
            setAppliedCoupon(null);
            applyCoupon(null, 0);
            if (addToast) addToast(msg, 'error');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setPromoCode('');
        setCouponError('');
        applyCoupon(null, 0);
        if (addToast) addToast('Coupon removed', 'info');
    };

    // Online Secure Checkout Handler
    const handleProceedToOnlineCheckout = () => {
        // Persist applied coupon into checkout state
        if (appliedCoupon) {
            applyCoupon(appliedCoupon, discount);
        }
        
        // If shipping form has valid fields, save as active address in checkoutData
        if (shippingDetails.fullName && shippingDetails.mobileNumber && shippingDetails.pincode) {
            updateAddress({
                ...shippingDetails,
                _id: user ? (user._id || 'user_addr') : 'guest_' + Date.now(),
            });
        }

        navigate('/checkout/address');
    };

    // Fast WhatsApp Checkout Handler
    const handleWhatsAppCheckout = async () => {
        if (!validateForm()) {
            if (addToast) addToast('Please fill all required delivery details', 'error');
            return;
        }

        setIsProcessingOrder(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product || item._id,
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
                totalPrice: grandTotal,
                discountAmount: discount,
                paymentMethod: paymentMethod === 'COD' ? 'WhatsApp COD' : 'WhatsApp Prepaid'
            };

            const { data } = await api.post('/orders/whatsapp', orderData);

            trackLeadEvent({
                actionType: 'whatsapp_order',
                cartItems: cartItems,
                cartTotal: grandTotal,
                phone: shippingDetails.mobileNumber,
                customerName: shippingDetails.fullName,
                email: shippingDetails.email,
            });

            // Cleanly format WhatsApp confirmation text
            let msg = `🌿 *New Ayurvedic Formulation Order - Hridved*\n\n`;
            msg += `📋 *Formulations Ordered:*\n`;
            cartItems.forEach((item, idx) => {
                msg += `${idx + 1}. ${item.name} (Qty: ${item.qty}) - ₹${item.price * item.qty}\n`;
            });
            
            msg += `\n💰 *Pricing Breakdown:*\n`;
            msg += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
            if (appliedCoupon) {
                msg += `Coupon (${appliedCoupon.code}): -₹${discount.toLocaleString()}\n`;
            }
            msg += `Shipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}\n`;
            if (tax > 0) msg += `GST: ₹${tax.toFixed(2)}\n`;
            if (codCharge > 0) msg += `COD Surcharge: ₹${codCharge}\n`;
            msg += `*Grand Total: ₹${grandTotal.toFixed(2)}*\n\n`;

            msg += `📦 *Delivery Address:*\n`;
            msg += `Recipient: ${shippingDetails.fullName}\n`;
            msg += `Contact: ${shippingDetails.mobileNumber}\n`;
            if (shippingDetails.email) msg += `Email: ${shippingDetails.email}\n`;
            msg += `Address: ${shippingDetails.houseNumber}${shippingDetails.landmark ? ', ' + shippingDetails.landmark : ''}\n`;
            msg += `City/State: ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}\n\n`;
            
            msg += `💳 *Payment Mode:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (UPI / Card)'}\n`;
            if (data?._id) {
                msg += `📄 Order Reference: #${data._id}\n`;
            }
            msg += `\nPlease confirm formulation dispatch and share tracking details.`;

            const encodedMsg = encodeURIComponent(msg);
            const waNumber = '917990934095';
            const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;
            
            window.open(waLink, '_blank', 'noopener,noreferrer');
            
            if (addToast) addToast('Order generated! Opening WhatsApp...', 'success');
            
            // Clear items and redirect to shop
            cartItems.forEach(item => removeFromCart(item.product || item._id));
            setTimeout(() => navigate('/shop'), 2000);
        } catch (error) {
            console.error('WhatsApp Checkout Error:', error);
            if (addToast) addToast('Failed to process order. Please try again.', 'error');
        } finally {
            setIsProcessingOrder(false);
        }
    };

    // Empty Cart State
    if (cartItems.length === 0) {
        return (
            <AnimatedPage>
                <div className="bg-[#FDFBF7] min-h-screen py-20 font-body">
                    <div className="container mx-auto px-4 max-w-lg text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center text-primary mx-auto mb-6 shadow-xs">
                            <ShoppingBag size={40} />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-primary mb-3">Your Herbal Basket is Empty</h2>
                        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                            Looks like you haven&apos;t added any classical Ayurvedic formulations yet. Nourish your mind and body with our authentic apothecary remedies.
                        </p>
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition shadow-md"
                        >
                            <span>Explore Apothecary</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="bg-[#FDFBF7] min-h-screen font-body pb-20">
                
                {/* Dynamic Free Shipping Bar */}
                <div className="bg-primary text-white py-3 shadow-inner">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                <span className="flex items-center gap-1.5 text-secondary font-bold">
                                    <Truck size={15} />
                                    {isFreeShipping 
                                        ? (hasThreshold ? '🎉 FREE SHIPPING UNLOCKED!' : '🎉 FREE DELIVERY ON ALL ORDERS!')
                                        : `Add ₹${amountNeeded.toLocaleString()} more to unlock FREE delivery`}
                                </span>
                                <span className="text-[11px] opacity-80 font-mono">
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-secondary shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                    
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">Shopping Basket</h1>
                            <p className="text-xs text-gray-500 mt-1">Review your selected formulations before checkout</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-accent/40 shadow-2xs">
                                {cartItems.reduce((acc, item) => acc + item.qty, 0)} Items Selected
                            </span>
                            <Link 
                                to="/shop" 
                                className="text-xs uppercase font-bold text-primary hover:text-secondary transition flex items-center gap-1"
                            >
                                <ArrowRight size={14} className="rotate-180" /> Continue Browsing
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        
                        {/* Left Column: Cart Items List */}
                        <div className="lg:col-span-7 space-y-4">
                            {cartItems.map((item, index) => {
                                const itemId = item.product || item._id;
                                const variantName = item.selectedVariant || (item.name.includes('(') ? item.name.split('(')[1]?.replace(')', '') : 'Standard Pack');

                                return (
                                    <ScrollReveal key={itemId} delay={index * 0.05}>
                                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-accent/40 shadow-xs flex flex-col sm:flex-row gap-4 items-center sm:items-start hover:shadow-sm transition">
                                            
                                            {/* Thumbnail */}
                                            <Link 
                                                to={`/product/${itemId}`} 
                                                className="w-24 h-24 bg-[#FDFBF7] rounded-xl border border-gray-100 p-2 shrink-0 flex items-center justify-center overflow-hidden hover:opacity-90"
                                            >
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain" 
                                                />
                                            </Link>

                                            {/* Item Details */}
                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                                        Ayurvedic Formulation
                                                    </span>
                                                    <Badge variant="accent" size="xs">
                                                        {variantName}
                                                    </Badge>
                                                </div>

                                                <Link 
                                                    to={`/product/${itemId}`} 
                                                    className="font-serif font-bold text-base sm:text-lg text-primary hover:underline block truncate"
                                                >
                                                    {item.name}
                                                </Link>

                                                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-gray-500">
                                                    <button 
                                                        onClick={() => removeFromCart(itemId)}
                                                        className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-600">Unit: ₹{item.price}</span>
                                                </div>
                                            </div>

                                            {/* Quantity & Item Subtotal */}
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartItemQuantity(itemId, Math.max(1, item.qty - 1))}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white transition cursor-pointer"
                                                    >
                                                        <Minus size={13} />
                                                    </button>
                                                    <span className="w-9 text-center text-xs font-bold text-gray-900">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartItemQuantity(itemId, item.qty + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white transition cursor-pointer"
                                                    >
                                                        <Plus size={13} />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-base sm:text-lg font-sans font-black text-primary">
                                                        ₹{(item.price * item.qty).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    </ScrollReveal>
                                );
                            })}

                            {/* Serviceability Check Strip */}
                            <div className="mt-6">
                                <PincodeShippingCheck productPrice={discountedSubtotal} />
                            </div>
                        </div>

                        {/* Right Column: Order Summary & Checkout Selection */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-3xl shadow-sm border border-accent/40 p-6 sm:p-7 sticky top-24">
                                
                                <h2 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-secondary" /> 
                                    Order Summary
                                </h2>

                                {/* Calculation Breakdown */}
                                <div className="space-y-3.5 mb-6 text-xs sm:text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Basket Subtotal</span>
                                        <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <span className="font-medium flex items-center gap-1.5">
                                                <Tag size={14} /> Coupon ({appliedCoupon.code})
                                            </span>
                                            <span className="font-bold">-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Standard Shipping</span>
                                        <span className={`font-bold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900'}`}>
                                            {isFreeShipping ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Statutory GST (Taxes)</span>
                                        <span className="font-bold text-gray-900">₹{tax.toFixed(2)}</span>
                                    </div>

                                    {paymentMethod === 'COD' && codCharge > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Cash on Delivery Convenience Fee</span>
                                            <span className="font-bold text-gray-900">₹{codCharge}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-accent/30 pt-3 flex justify-between items-baseline">
                                        <span className="text-base font-bold text-primary">Grand Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-sans font-black text-primary">
                                                ₹{grandTotal.toLocaleString()}
                                            </span>
                                            <p className="text-[10px] text-gray-500">All duties & taxes included</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Promo Code Accordion */}
                                <div className="mb-6 bg-[#FDFBF7] p-3.5 rounded-2xl border border-accent/40">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2 block flex items-center gap-1.5">
                                        <Tag size={13} className="text-secondary" />
                                        Have a Promo Code?
                                    </label>

                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs">
                                            <div>
                                                <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                                                <p className="text-[10px] text-emerald-600 mt-0.5">Applied discount active</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => {
                                                        setPromoCode(e.target.value.toUpperCase());
                                                        setCouponError('');
                                                    }}
                                                    placeholder="e.g. WELCOME10"
                                                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs uppercase font-medium focus:outline-hidden focus:border-primary text-gray-900"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !promoCode.trim()}
                                                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                                                >
                                                    {couponLoading ? 'Checking...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && (
                                                <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PRIMARY CHECKOUT ACTION: Standard E-Commerce Flow */}
                                <div className="space-y-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={handleProceedToOnlineCheckout}
                                        className="w-full h-12 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Lock size={16} className="text-secondary" />
                                        <span>Proceed to Secure Checkout</span>
                                        <ArrowRight size={16} />
                                    </button>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-accent/40"></div>
                                        <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">or quick order</span>
                                        <div className="flex-grow border-t border-accent/40"></div>
                                    </div>
                                </div>

                                {/* Delivery Details Form for WhatsApp / Quick Checkout */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                                        <Truck size={15} className="text-secondary" />
                                        Recipient Details (For WhatsApp Order):
                                    </h3>

                                    <div className="space-y-2.5">
                                        <div>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="Recipient Full Name *"
                                                value={shippingDetails.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.fullName ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                            />
                                            {formErrors.fullName && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.fullName}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <input
                                                    type="tel"
                                                    name="mobileNumber"
                                                    placeholder="10-Digit Mobile *"
                                                    value={shippingDetails.mobileNumber}
                                                    onChange={handleInputChange}
                                                    maxLength="10"
                                                    className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.mobileNumber ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                                />
                                                {formErrors.mobileNumber && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.mobileNumber}</p>}
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    placeholder="6-Digit Pincode *"
                                                    value={shippingDetails.pincode}
                                                    onChange={handleInputChange}
                                                    maxLength="6"
                                                    className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.pincode ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                                />
                                                {formErrors.pincode && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.pincode}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <input
                                                type="text"
                                                name="houseNumber"
                                                placeholder="House / Flat / Building *"
                                                value={shippingDetails.houseNumber}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.houseNumber ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                            />
                                            {formErrors.houseNumber && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.houseNumber}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    placeholder="City *"
                                                    value={shippingDetails.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.city ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    placeholder="State *"
                                                    value={shippingDetails.state}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 bg-[#FDFBF7] border ${formErrors.state ? 'border-rose-500' : 'border-accent/40'} rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-primary`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Mode Toggle */}
                                <div className="mb-6">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2 block">
                                        Preferred Payment Option:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('Prepaid')}
                                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                                                paymentMethod === 'Prepaid'
                                                    ? 'border-primary bg-primary text-white shadow-2xs'
                                                    : 'border-gray-200 bg-[#FDFBF7] text-gray-700'
                                            }`}
                                        >
                                            Online / UPI (Prepaid)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                                                paymentMethod === 'COD'
                                                    ? 'border-primary bg-primary text-white shadow-2xs'
                                                    : 'border-gray-200 bg-[#FDFBF7] text-gray-700'
                                            }`}
                                        >
                                            Cash on Delivery (+₹50)
                                        </button>
                                    </div>
                                </div>

                                {/* WhatsApp Fast Order Button */}
                                <button
                                    type="button"
                                    onClick={handleWhatsAppCheckout}
                                    disabled={isProcessingOrder}
                                    className="w-full h-11 bg-[#25D366] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#1da851] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <MessageCircleIcon />
                                    <span>{isProcessingOrder ? 'Processing...' : 'Place Order via WhatsApp'}</span>
                                </button>

                                {/* Trust Strip */}
                                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-accent/40 text-center text-[10px] text-gray-500">
                                    <div>
                                        <ShieldCheck size={16} className="text-secondary mx-auto mb-1" />
                                        <span>Authentic Purity</span>
                                    </div>
                                    <div>
                                        <Truck size={16} className="text-secondary mx-auto mb-1" />
                                        <span>Fast Dispatch</span>
                                    </div>
                                    <div>
                                        <Lock size={16} className="text-secondary mx-auto mb-1" />
                                        <span>256-Bit SSL</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Recommended Formulations */}
                    {recommendedProducts.length > 0 && (
                        <div className="mt-20">
                            <h3 className="text-2xl font-serif font-bold text-primary mb-6">
                                Recommended Formulations For You
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {recommendedProducts.map((p) => (
                                    <ProductCard key={p._id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AnimatedPage>
    );
};

// WhatsApp SVG Icon helper
const MessageCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
);

export default CartPage;
