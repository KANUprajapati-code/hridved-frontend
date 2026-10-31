import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';
import PaymentButton from '../components/PaymentButton';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import { CreditCard, Lock, ChevronLeft, ArrowRight, MapPin, Package, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

export default function CheckoutPaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart, calculateCodFee } = useCart();
    const { checkoutData, setErrorMessage, clearError, setOrderId, error } = useCheckout();

    const [creatingOrder, setCreatingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');
    // Require explicit selection by customer: '' | 'razorpay' | 'COD'
    const [paymentMethod, setPaymentMethod] = useState('');
    const [activePaymentOrderId, setActivePaymentOrderId] = useState(null);

    const hasAddress = !!checkoutData.address;
    const hasShipping = !!checkoutData.shippingMethod;
    const hasCartItems = (cart?.cartItems?.length || 0) > 0;

    // Fast route guard
    useEffect(() => {
        if (!hasAddress || !hasShipping) {
            navigate('/checkout/address');
            return;
        }
        if (!hasCartItems) {
            navigate('/cart');
            return;
        }
    }, [hasAddress, hasShipping, hasCartItems, navigate]);

    // Clear any stale completed orderId from previous checkouts
    useEffect(() => {
        if (checkoutData.orderId && !activePaymentOrderId) {
            setOrderId(null, null);
        }
    }, []);

    // Payment polling effect: ONLY runs after user has initiated Razorpay payment in this session
    useEffect(() => {
        if (!activePaymentOrderId || paymentMethod !== 'razorpay') return;

        console.log(`[POLLING] Started for active checkout Order: ${activePaymentOrderId}`);
        const startTime = Date.now();
        const maxDuration = 120000;

        const pollInterval = setInterval(async () => {
            if (Date.now() - startTime > maxDuration) {
                console.log("[POLLING] Timed out after 2 minutes");
                clearInterval(pollInterval);
                return;
            }

            try {
                const { data: res } = await api.get(`/checkout/order/${activePaymentOrderId}?t=${Date.now()}`);
                if (res.success && res.data?.isPaid) {
                    console.log("[POLLING] Payment detected! Redirecting to success page.");
                    clearInterval(pollInterval);
                    if (clearCart) clearCart();
                    window.location.href = `/checkout/success?id=${activePaymentOrderId}`;
                }
            } catch (err) {
                // Ignore transient network errors
            }
        }, 3500);

        return () => clearInterval(pollInterval);
    }, [activePaymentOrderId, paymentMethod, clearCart]);

    useEffect(() => {
        if (paymentMethod) {
            trackWebsiteEvent('add_payment_info', {
                paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'COD'
            });
        }
    }, [paymentMethod]);

    const calculateTotals = () => {
        const cartItems = cart?.cartItems || [];
        const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
        const taxPrice = cartItems.reduce((total, item) => total + (item.price * item.qty * (item.gst || 0) / 100), 0);
        const shippingPrice = checkoutData.shippingCost || 0;
        const discountPrice = checkoutData.discount || 0;
        const codPrice = (paymentMethod === 'COD' && calculateCodFee) ? calculateCodFee('COD') : 0;
        const totalPrice = Math.max(0, itemsPrice + taxPrice + shippingPrice + codPrice - discountPrice);

        return { itemsPrice, taxPrice, shippingPrice, codPrice, totalPrice, discountPrice };
    };

    const createOrderBackend = async () => {
        if (paymentMethod !== 'razorpay') {
            const err = 'Please select Online Payment option to proceed with payment';
            setOrderError(err);
            throw new Error(err);
        }

        try {
            setCreatingOrder(true);
            setOrderError('');
            clearError();

            const { itemsPrice, taxPrice, shippingPrice, totalPrice, discountPrice } = calculateTotals();
            const cartItems = cart?.cartItems || [];

            const { data: res } = await api.post('/checkout/create-order', {
                addressId: checkoutData.address?._id,
                shippingAddress: checkoutData.address,
                deliveryOption: checkoutData.shippingMethod || 'Standard',
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    weight: item.weight || 0.5,
                    product: item.product || item._id,
                })),
                itemsPrice,
                taxPrice,
                shippingPrice,
                codPrice: 0,
                discountAmount: discountPrice,
                totalPrice,
                paymentMethod: 'razorpay',
                shippingProvider: checkoutData.shippingProvider || 'Wayuvega',
                email: user?.email || checkoutData.address?.email || '',
            });

            if (res.success) {
                setActivePaymentOrderId(res.data._id);
                setOrderId(res.data._id, res.data);
                trackWebsiteEvent('order_created', { orderId: res.data._id });
                return res.data;
            } else {
                throw new Error(res.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to create order';
            setErrorMessage(msg);
            setOrderError(msg);
            throw error;
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleCODOrder = async () => {
        if (paymentMethod !== 'COD') {
            setOrderError('Please select Cash on Delivery option to proceed');
            return;
        }

        try {
            setCreatingOrder(true);
            setOrderError('');
            clearError();

            const { itemsPrice, taxPrice, shippingPrice, totalPrice, discountPrice, codPrice } = calculateTotals();
            const cartItems = cart?.cartItems || [];

            const { data: res } = await api.post('/checkout/create-order', {
                addressId: checkoutData.address?._id,
                shippingAddress: checkoutData.address,
                deliveryOption: checkoutData.shippingMethod || 'Standard',
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    weight: item.weight || 0.5,
                    product: item.product || item._id,
                })),
                itemsPrice,
                taxPrice,
                shippingPrice,
                discountAmount: discountPrice,
                codPrice,
                totalPrice,
                paymentMethod: 'COD',
                shippingProvider: checkoutData.shippingProvider || 'Wayuvega',
                email: user?.email || checkoutData.address?.email || '',
            });

            if (res.success) {
                setOrderId(res.data._id, res.data);
                trackWebsiteEvent('order_created', { orderId: res.data._id });
                trackWebsiteEvent('purchase', {
                    orderId: res.data._id,
                    totalPrice: res.data.totalPrice || totalPrice,
                    items: cartItems.map(item => ({
                        product: item.product || item._id,
                        name: item.name,
                        price: item.price,
                        qty: item.qty
                    }))
                });
                if (clearCart) clearCart();
                navigate(`/checkout/success?id=${res.data._id}`);
                return res.data;
            } else {
                throw new Error(res.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating COD order:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to confirm COD order. Please verify your address and try again.';
            setErrorMessage(msg);
            setOrderError(msg);
        } finally {
            setCreatingOrder(false);
        }
    };

    const { itemsPrice, taxPrice, shippingPrice, codPrice, totalPrice } = calculateTotals();

    return (
        <AnimatedPage>
            <div className="bg-[#FAF8F5] min-h-screen py-8 font-body">
                <div className="container mx-auto px-4 max-w-5xl">
                    <CheckoutStepIndicator />

                    <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-6">Payment Method</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Left Column: Order Summary & Delivery Address */}
                            <div className="space-y-6">
                                <ScrollReveal>
                                    <div className="bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/70">
                                        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Package size={16} className="text-emerald-800" /> Order Summary
                                        </h3>

                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto no-scrollbar">
                                            {cart?.cartItems && cart.cartItems.map((item) => (
                                                <div key={item.product || item._id} className="flex justify-between items-start pb-2.5 border-b border-stone-200/50 last:border-0 last:pb-0 text-xs">
                                                    <div>
                                                        <div className="font-bold text-stone-900 truncate max-w-[180px]">{item.name}</div>
                                                        <div className="text-[11px] text-stone-500 mt-0.5">Qty: {item.qty}</div>
                                                    </div>
                                                    <div className="font-bold text-stone-900">₹{(item.price * item.qty).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 text-xs pt-3 border-t border-stone-200">
                                            <div className="flex justify-between text-stone-600">
                                                <span>Subtotal</span>
                                                <span className="font-bold text-stone-900">₹{itemsPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-600">
                                                <span>Express Shipping</span>
                                                <span className="font-bold text-emerald-700">{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                                            </div>
                                            {paymentMethod === 'COD' && codPrice > 0 && (
                                                <div className="flex justify-between text-amber-800 font-bold">
                                                    <span>COD Convenience Fee</span>
                                                    <span>₹{codPrice}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-stone-600">
                                                <span>GST (Taxes)</span>
                                                <span className="font-bold text-stone-900">₹{taxPrice.toFixed(2)}</span>
                                            </div>
                                            {checkoutData.discount > 0 && (
                                                <div className="flex justify-between text-emerald-700 font-bold">
                                                    <span>Discount ({checkoutData.coupon?.code})</span>
                                                    <span>-₹{checkoutData.discount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-stone-300 my-2 pt-2 flex justify-between font-bold text-base text-stone-900">
                                                <span>Total Payable</span>
                                                <span className="text-xl font-serif text-[#053807]">₹{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.1}>
                                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/70 text-xs text-stone-600">
                                        <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <MapPin size={15} className="text-emerald-800" /> Delivery Destination
                                        </h3>
                                        <div className="font-bold text-stone-900 mb-0.5">{checkoutData.address?.fullName}</div>
                                        <p>{checkoutData.address?.houseNumber}{checkoutData.address?.landmark && `, ${checkoutData.address.landmark}`}</p>
                                        <p>{checkoutData.address?.city}, {checkoutData.address?.state} - {checkoutData.address?.pincode}</p>
                                        <p className="mt-1 font-medium text-emerald-900">Contact: +91 {checkoutData.address?.mobileNumber}</p>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Right Column: Payment Selection */}
                            <div>
                                <ScrollReveal delay={0.2}>
                                    <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-xs h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-base font-serif font-bold text-stone-900 mb-2 flex items-center gap-2">
                                                <CreditCard size={18} className="text-emerald-800" /> Choose Payment Option
                                            </h3>
                                            <p className="text-xs text-stone-500 mb-5">
                                                Please select how you would like to pay for your Ayurvedic formulations:
                                            </p>

                                            <div className="space-y-3 mb-6">
                                                {/* Option 1: Razorpay Online Payment */}
                                                <label 
                                                    className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'razorpay'
                                                            ? 'border-emerald-700 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-700/20'
                                                            : 'border-stone-200 hover:border-stone-300 bg-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="razorpay"
                                                        checked={paymentMethod === 'razorpay'}
                                                        onChange={() => {
                                                            setPaymentMethod('razorpay');
                                                            setOrderError('');
                                                        }}
                                                        className="mt-1 w-4 h-4 accent-[#053807] mr-3.5 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-stone-900 text-xs sm:text-sm">Online Payment (UPI / Cards / Netbanking)</span>
                                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Zero Fee</span>
                                                        </div>
                                                        <p className="text-[11px] text-stone-500 mt-1">Instant confirmation via Google Pay, PhonePe, Paytm, UPI, Debit/Credit Cards, or Netbanking.</p>
                                                    </div>
                                                </label>

                                                {/* Option 2: Cash on Delivery */}
                                                <label 
                                                    className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'COD'
                                                            ? 'border-emerald-700 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-700/20'
                                                            : 'border-stone-200 hover:border-stone-300 bg-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="COD"
                                                        checked={paymentMethod === 'COD'}
                                                        onChange={() => {
                                                            setPaymentMethod('COD');
                                                            setOrderError('');
                                                        }}
                                                        className="mt-1 w-4 h-4 accent-[#053807] mr-3.5 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-stone-900 text-xs sm:text-sm">Cash on Delivery (COD)</span>
                                                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">+₹50 Fee</span>
                                                        </div>
                                                        <p className="text-[11px] text-stone-500 mt-1">Pay with cash or UPI directly to the Wayuvega delivery executive at your doorstep.</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Security Assurance Box */}
                                            <div className="bg-stone-50 rounded-xl p-3 mb-6 text-xs text-stone-600 flex gap-2.5 items-start border border-stone-200/60">
                                                <Lock size={15} className="text-emerald-800 mt-0.5 shrink-0" />
                                                <p className="text-[11px] leading-relaxed">
                                                    {paymentMethod === 'razorpay'
                                                        ? "All transactions are secured by 256-bit bank-grade encryption via Razorpay. Zero raw card or CVV details are ever stored."
                                                        : paymentMethod === 'COD'
                                                        ? "A verification SMS or WhatsApp notification will be sent upon booking for doorstep verification."
                                                        : "Select an option above to securely confirm your herbal formulation order."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button Section */}
                                        <div>
                                            {(orderError || error) && (
                                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs">
                                                    <span className="font-medium">{orderError || error}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setOrderError(''); clearError(); }} 
                                                        className="text-red-500 hover:text-red-800 font-bold ml-2 cursor-pointer text-sm"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}

                                            {!paymentMethod ? (
                                                <div className="space-y-2">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="w-full bg-stone-100 text-stone-400 border border-stone-300 py-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        <span>Select Payment Option Above to Continue</span>
                                                    </button>
                                                    <p className="text-[11px] text-center text-amber-800 font-semibold bg-amber-50/80 py-2 px-3 rounded-lg border border-amber-200/60">
                                                        ⚠️ Please choose either <strong>Online Payment</strong> or <strong>Cash on Delivery</strong> above.
                                                    </p>
                                                </div>
                                            ) : paymentMethod === 'razorpay' ? (
                                                <PaymentButton
                                                    amount={totalPrice}
                                                    orderId={activePaymentOrderId || checkoutData.orderId}
                                                    customerDetails={{
                                                        name: checkoutData.address?.fullName,
                                                        email: user?.email || checkoutData.address?.email || '',
                                                        phone: checkoutData.address?.mobileNumber,
                                                    }}
                                                    onBeforePayment={createOrderBackend}
                                                    onSuccess={(verifyData) => {
                                                        trackWebsiteEvent('purchase', {
                                                            orderId: activePaymentOrderId || checkoutData.orderId,
                                                            totalPrice: totalPrice,
                                                            items: cart?.cartItems || []
                                                        });
                                                        if (clearCart) clearCart();
                                                    }}
                                                    onError={(err) => setErrorMessage(err)}
                                                />
                                            ) : (
                                                <AnimatedButton
                                                    onClick={handleCODOrder}
                                                    disabled={creatingOrder}
                                                    className="w-full bg-[#053807] hover:bg-[#074609] text-white py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
                                                >
                                                    {creatingOrder ? "Confirming Order with Wayuvega..." : <>Confirm COD Order (₹{totalPrice.toLocaleString()}) <ArrowRight size={18} /></>}
                                                </AnimatedButton>
                                            )}

                                            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-stone-500">
                                                <ShieldCheck size={14} className="text-emerald-800" />
                                                <span>100% Genuine Ayurvedic Formulation Guarantee</span>
                                            </div>
                                        </div>

                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>

                        {/* Back to Shipping */}
                        <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => navigate('/checkout/shipping')}
                                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Back to Shipping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
