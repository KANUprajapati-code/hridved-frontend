import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Trash2, ShoppingBag, Truck, ShieldCheck, Plus, Minus, 
    ArrowRight, Lock, CheckCircle2, AlertCircle, Tag, Sparkles, X, Check
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
    const { 
        cart, 
        removeFromCart, 
        updateCartItemQuantity, 
        clearCart,
        serverTotals,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        activeCoupons
    } = useCart();
    
    const { user } = useAuth();
    const { updateAddress, applyCoupon } = useCheckout();
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};

    const [promoInput, setPromoInput] = useState('');
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

    // Verified cart totals calculation
    const calculatedItemsSubtotal = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
    const calculatedMrpTotal = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.mrp || item.price) || 0), 0);
    // If serverTotals is populated and consistent with actual cart items, use server subtotal; otherwise use calculated subtotal
    const subtotal = (serverTotals.itemsPrice > 0 && Math.abs(serverTotals.itemsPrice - calculatedItemsSubtotal) < 5)
        ? serverTotals.itemsPrice
        : calculatedItemsSubtotal;
    const mrpSavings = (serverTotals.mrpSavings > 0 && serverTotals.itemsPrice === subtotal)
        ? serverTotals.mrpSavings
        : Math.max(0, calculatedMrpTotal - subtotal);
    const discount = serverTotals.discount || 0;
    const isFreeShipping = (subtotal - discount) >= 999;
    const shipping = isFreeShipping || subtotal === 0 ? 0 : 49;
    const freeShippingThreshold = 999;
    const amountNeeded = Math.max(0, freeShippingThreshold - Math.max(0, subtotal - discount));
    const progressPercent = Math.min(100, Math.round((Math.max(0, subtotal - discount) / freeShippingThreshold) * 100));
    const grandTotal = Math.max(0, subtotal - discount + shipping);

    useEffect(() => {
        if (cartItems.length > 0) {
            trackWebsiteEvent('view_cart', { cartTotal: subtotal });
        }
    }, [cartItems.length, subtotal]);

    // Coupon Handlers
    const handleApplyCoupon = async () => {
        if (!promoInput.trim()) return;

        try {
            setCouponLoading(true);
            setCouponError('');
            const res = await applyCouponCode(promoInput.trim());

            if (res.success) {
                if (addToast) addToast(`Coupon ${res.coupon.code} applied! Saved ₹${res.coupon.appliedDiscount}`, 'success');
                setPromoInput('');
                if (applyCoupon) applyCoupon(res.coupon, res.coupon.appliedDiscount);
            } else {
                setCouponError(res.message);
                if (addToast) addToast(res.message, 'error');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid or expired promo code';
            setCouponError(msg);
            if (addToast) addToast(msg, 'error');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSelectQuickCoupon = async (code) => {
        setCouponLoading(true);
        setCouponError('');
        const res = await applyCouponCode(code);
        if (res.success) {
            if (addToast) addToast(`Coupon ${code} applied! Saved ₹${res.coupon.appliedDiscount}`, 'success');
            if (applyCoupon) applyCoupon(res.coupon, res.coupon.appliedDiscount);
        } else {
            setCouponError(res.message);
            if (addToast) addToast(res.message, 'error');
        }
        setCouponLoading(false);
    };

    const handleRemoveCoupon = () => {
        removeCouponCode();
        setPromoInput('');
        setCouponError('');
        if (applyCoupon) applyCoupon(null, 0);
        if (addToast) addToast('Coupon removed', 'info');
    };

    // Online Secure Checkout Handler
    const handleProceedToOnlineCheckout = () => {
        if (appliedCoupon && applyCoupon) {
            applyCoupon(appliedCoupon, discount);
        }
        
        if (shippingDetails.fullName && shippingDetails.mobileNumber && shippingDetails.pincode) {
            updateAddress({
                ...shippingDetails,
                _id: user ? (user._id || 'user_addr') : 'guest_' + Date.now(),
            });
        }

        navigate('/checkout/address');
    };

    // Fast WhatsApp Checkout Handler with verified server prices
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
                    packSize: item.packSize || '',
                    sku: item.sku || '',
                    selectedVariant: item.selectedVariant || null,
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
                couponCode: appliedCoupon?.code || null,
                email: shippingDetails.email,
                itemsPrice: subtotal,
                taxPrice: 0,
                shippingPrice: shipping,
                codPrice: paymentMethod === 'COD' ? 50 : 0,
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
            msg += `*Grand Total: ₹${grandTotal.toLocaleString()}*\n\n`;

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
            
            if (addToast) addToast('Order created! Opening WhatsApp...', 'success');
            
            if (typeof clearCart === 'function') {
                clearCart();
            }
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

                    {/* Recommendations below empty state */}
                    {recommendedProducts.length > 0 && (
                        <div className="container mx-auto px-4 max-w-5xl mt-16">
                            <h3 className="text-xl font-serif font-bold text-primary mb-6 text-center">
                                Bestselling Classical Remedies
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto w-full">
                                {recommendedProducts.map((p) => (
                                    <ProductCard key={p._id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="bg-[#FDFBF7] min-h-screen font-body pb-20 w-full max-w-full overflow-x-hidden">
                
                {/* Dynamic Free Shipping Bar */}
                <div className="bg-primary text-white py-3 shadow-inner">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                <span className="flex items-center gap-1.5 text-secondary font-bold">
                                    <Truck size={15} />
                                    {isFreeShipping 
                                        ? '🎉 FREE COURIER SHIPPING UNLOCKED!' 
                                        : `Add ₹${amountNeeded.toLocaleString()} more to unlock FREE pan-India delivery`}
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

                <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                    
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-primary">Shopping Basket</h1>
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

                    {/* Stock Warnings Banner if any stock changed server-side */}
                    {serverTotals.stockWarnings && serverTotals.stockWarnings.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-900 shadow-2xs">
                            <div className="flex items-center gap-2 font-bold text-amber-950 mb-1">
                                <AlertCircle size={16} className="text-amber-700" />
                                <span>Inventory Notice:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-amber-800">
                                {serverTotals.stockWarnings.map((warn, i) => (
                                    <li key={i}>{warn.message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                        
                        {/* Left Column: Cart Items List */}
                        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                            {cartItems.map((item, index) => {
                                const itemId = item.product || item._id;
                                const variantName = item.selectedVariant || (item.name.includes('(') ? item.name.split('(')[1]?.replace(')', '') : 'Standard Pack');

                                return (
                                    <ScrollReveal key={itemId} delay={index * 0.05}>
                                        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-accent/40 shadow-xs flex flex-row gap-3 sm:gap-4 items-start hover:shadow-sm transition w-full min-w-0 max-w-full">
                                            
                                            {/* Thumbnail */}
                                            <Link 
                                                to={`/product/${itemId}`} 
                                                className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FDFBF7] rounded-xl border border-gray-100 p-1.5 shrink-0 flex items-center justify-center overflow-hidden hover:opacity-90"
                                            >
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain" 
                                                />
                                            </Link>

                                            {/* Item Details & Actions */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        <span className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-widest">
                                                            Ayurvedic Formulation
                                                        </span>
                                                        {variantName && (
                                                            <Badge variant="accent" size="xs">
                                                                {variantName}
                                                            </Badge>
                                                        )}
                                                        {item.packSize && (
                                                            <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded font-medium">
                                                                {item.packSize}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link 
                                                        to={`/product/${itemId}`} 
                                                        className="font-serif font-bold text-sm sm:text-base text-primary hover:underline line-clamp-2 leading-snug break-words block"
                                                    >
                                                        {item.name}
                                                    </Link>

                                                    <div className="flex items-baseline gap-2 text-[11px] sm:text-xs text-gray-500 mt-1">
                                                        <span>Price: <strong className="text-gray-900 font-sans">₹{item.price}</strong></span>
                                                        {item.mrp > item.price && (
                                                            <span className="line-through text-gray-400">₹{item.mrp}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quantity & Item Subtotal Row */}
                                                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 min-w-0">
                                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/70 overflow-hidden shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartItemQuantity(itemId, Math.max(1, item.qty - 1))}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white transition cursor-pointer"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-7 sm:w-8 text-center text-xs font-bold text-gray-900 font-sans">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartItemQuantity(itemId, item.qty + 1)}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white transition cursor-pointer"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 sm:gap-3">
                                                        <span className="text-sm sm:text-base font-sans font-black text-primary">
                                                            ₹{(item.price * item.qty).toLocaleString()}
                                                        </span>
                                                        <button 
                                                            onClick={() => removeFromCart(itemId)}
                                                            className="text-rose-500 hover:text-rose-700 p-1 sm:p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                                            title="Remove item"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </ScrollReveal>
                                );
                            })}

                            {/* Serviceability Check Strip */}
                            <div className="mt-6">
                                <PincodeShippingCheck productPrice={subtotal} />
                            </div>
                        </div>

                        {/* Right Column: Order Summary & Checkout Selection */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-3xl shadow-sm border border-accent/40 p-4 sm:p-7 sticky top-24 w-full max-w-full min-w-0">
                                
                                <h2 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-secondary" /> 
                                    Order Summary
                                </h2>

                                {/* Calculation Breakdown (Server Verified) */}
                                <div className="space-y-3.5 mb-6 text-xs sm:text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Formulations Subtotal</span>
                                        <span className="font-bold text-gray-900 font-sans">₹{subtotal.toLocaleString()}</span>
                                    </div>

                                    {mrpSavings > 0 && (
                                        <div className="flex justify-between text-emerald-700 text-xs">
                                            <span>MRP Direct Savings</span>
                                            <span className="font-bold">Save ₹{mrpSavings.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <span className="font-medium flex items-center gap-1.5">
                                                <Tag size={14} /> Coupon ({appliedCoupon.code})
                                            </span>
                                            <span className="font-bold font-sans">-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Pan-India Courier Shipping</span>
                                        <span className={`font-bold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900 font-sans'}`}>
                                            {isFreeShipping ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-500 text-xs">
                                        <span>Statutory GST & Taxes</span>
                                        <span className="font-medium text-emerald-700">Inclusive</span>
                                    </div>

                                    <div className="border-t border-accent/30 pt-3 flex justify-between items-baseline">
                                        <span className="text-base font-bold text-primary">Grand Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-sans font-black text-primary">
                                                ₹{grandTotal.toLocaleString()}
                                            </span>
                                            <p className="text-[10px] text-gray-500">All duties & statutory taxes included</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Promo Code Accordion / Active Coupons */}
                                <div className="mb-6 bg-[#FDFBF7] p-3.5 rounded-2xl border border-accent/40">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2 block flex items-center gap-1.5">
                                        <Tag size={13} className="text-secondary" />
                                        Have a Promo Code?
                                    </label>

                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Check size={14} className="text-emerald-700" />
                                                    <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                                                </div>
                                                <p className="text-[10px] text-emerald-600 mt-0.5">{appliedCoupon.description || 'Coupon active'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer flex items-center gap-1"
                                            >
                                                <X size={13} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoInput}
                                                    onChange={(e) => {
                                                        setPromoInput(e.target.value.toUpperCase());
                                                        setCouponError('');
                                                    }}
                                                    placeholder="Enter code (e.g. VEDIC10)"
                                                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs uppercase font-medium focus:outline-hidden focus:border-primary text-gray-900"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !promoInput.trim()}
                                                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                                                >
                                                    {couponLoading ? 'Checking...' : 'Apply'}
                                                </button>
                                            </div>

                                            {couponError && (
                                                <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {couponError}
                                                </p>
                                            )}

                                            {/* Quick Available Coupons Chips */}
                                            {activeCoupons.length > 0 && (
                                                <div className="mt-3 pt-2.5 border-t border-gray-100">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                        Available Coupons:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeCoupons.map((c) => (
                                                            <button
                                                                key={c.code}
                                                                type="button"
                                                                onClick={() => handleSelectQuickCoupon(c.code)}
                                                                disabled={couponLoading}
                                                                className="px-2 py-1 bg-white border border-secondary/40 text-primary text-[10px] font-bold rounded-lg hover:bg-secondary/10 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                                                title={c.description}
                                                            >
                                                                <Tag size={10} className="text-secondary" />
                                                                <span>{c.code}</span>
                                                                <span className="text-gray-400 font-normal">
                                                                    ({c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`})
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
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
                                            className={`p-2 sm:p-2.5 rounded-xl border text-center transition cursor-pointer font-bold flex items-center justify-center leading-tight ${
                                                paymentMethod === 'Prepaid'
                                                    ? 'border-primary bg-primary text-white shadow-2xs'
                                                    : 'border-gray-200 bg-[#FDFBF7] text-gray-700'
                                            }`}
                                        >
                                            <span className="text-[11px] sm:text-xs">Online / UPI</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-2 sm:p-2.5 rounded-xl border text-center transition cursor-pointer font-bold flex items-center justify-center leading-tight ${
                                                paymentMethod === 'COD'
                                                    ? 'border-primary bg-primary text-white shadow-2xs'
                                                    : 'border-gray-200 bg-[#FDFBF7] text-gray-700'
                                            }`}
                                        >
                                            <span className="text-[11px] sm:text-xs">Cash on Delivery</span>
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
                        <div className="mt-16 sm:mt-20">
                            <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-6">
                                Recommended Formulations For You
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto w-full">
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
