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
import { CreditCard, Lock, ChevronLeft, ArrowRight, MapPin, Package, Smartphone, QrCode, ShieldCheck } from 'lucide-react';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

export default function CheckoutPaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart, calculateCodFee } = useCart();
    const { checkoutData, updateStep, setErrorMessage, clearError, setOrderId, error } = useCheckout();

    const [loading] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');

    const orderId = checkoutData.orderId;

    useEffect(() => {
        if (!checkoutData.address || !checkoutData.shippingMethod) {
            navigate('/checkout/address');
            return;
        }

        // Check if cart has items
        if (!cart?.cartItems || cart.cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        // Polling for payment status (Optimized for QR payments)
        let pollInterval;
        if (orderId && !checkoutData.isPaymentConfirmed && paymentMethod === 'razorpay') {
            const startTime = Date.now();
            const maxDuration = 120000; // 2 minutes

            console.log(`[POLLING] Started for Order: ${orderId}`);
            pollInterval = setInterval(async () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > maxDuration) {
                    console.log("[POLLING] Timed out after 2 minutes");
                    clearInterval(pollInterval);
                    return;
                }

                try {
                    const { data: res } = await api.get(`/checkout/order/${orderId}?t=${Date.now()}`);
                    if (res.success && res.data.isPaid) {
                        console.log("[POLLING] Webhook/Payment detected! Redirecting to success page.");
                        clearInterval(pollInterval);
                        if (clearCart) clearCart();
                        window.location.href = `/checkout/success?id=${orderId}`;
                    }
                } catch (err) {
                    console.warn("[POLLING] Check warning:", err.message);
                }
            }, 3000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [checkoutData, navigate, cart, orderId, paymentMethod, clearCart]);

    useEffect(() => {
        trackWebsiteEvent('add_payment_info', {
            paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'COD'
        });
    }, [paymentMethod]);

    const calculateTotals = () => {
        const cartItems = cart?.cartItems || [];
        const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
        const taxPrice = cartItems.reduce((total, item) => total + (item.price * item.qty * (item.gst || 0) / 100), 0);
        const shippingPrice = checkoutData.shippingCost || 0;
        const discountPrice = checkoutData.discount || 0;
        const codPrice = calculateCodFee ? calculateCodFee(paymentMethod) : 0;
        const totalPrice = Math.max(0, itemsPrice + taxPrice + shippingPrice + codPrice - discountPrice);

        return { itemsPrice, taxPrice, shippingPrice, codPrice, totalPrice, discountPrice };
    };

    const createOrderBackend = async () => {
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
                shippingProvider: checkoutData.shippingProvider || 'Vamaship',
                email: user?.email || checkoutData.address?.email || '',
            });

            if (res.success) {
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
                discountAmount: discountPrice,
                codPrice,
                totalPrice,
                paymentMethod: 'COD',
                shippingProvider: checkoutData.shippingProvider || 'Vamaship',
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
            <div className="bg-[#FDFBF7] min-h-screen py-8 font-body">
                <div className="container mx-auto px-4 max-w-5xl">
                    <CheckoutStepIndicator />

                    <div className="bg-white rounded-3xl shadow-sm border border-accent/40 p-6 sm:p-8">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-6">Payment Method</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Left Column: Order Summary & Delivery Address */}
                            <div className="space-y-6">
                                <ScrollReveal>
                                    <div className="bg-[#FDFBF7] rounded-2xl p-5 sm:p-6 border border-accent/40">
                                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Package size={16} className="text-secondary" /> Order Summary
                                        </h3>

                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto no-scrollbar">
                                            {cart?.cartItems && cart.cartItems.map((item) => (
                                                <div key={item.product || item._id} className="flex justify-between items-start pb-2.5 border-b border-accent/20 last:border-0 last:pb-0 text-xs">
                                                    <div>
                                                        <div className="font-bold text-gray-900 truncate max-w-[180px]">{item.name}</div>
                                                        <div className="text-[11px] text-gray-500 mt-0.5">Qty: {item.qty}</div>
                                                    </div>
                                                    <div className="font-bold text-primary">₹{(item.price * item.qty).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 text-xs pt-3 border-t border-accent/30">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span className="font-bold text-gray-900">₹{itemsPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Shipping</span>
                                                <span className="font-bold text-emerald-700">{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                                            </div>
                                            {paymentMethod === 'COD' && codPrice > 0 && (
                                                <div className="flex justify-between text-amber-800 font-bold">
                                                    <span>COD Convenience Fee</span>
                                                    <span>₹{codPrice}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-gray-600">
                                                <span>GST (Statutory Taxes)</span>
                                                <span className="font-bold text-gray-900">₹{taxPrice.toFixed(2)}</span>
                                            </div>
                                            {checkoutData.discount > 0 && (
                                                <div className="flex justify-between text-emerald-700 font-bold">
                                                    <span>Discount ({checkoutData.coupon?.code})</span>
                                                    <span>-₹{checkoutData.discount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-accent/30 my-2 pt-2 flex justify-between font-bold text-base text-primary">
                                                <span>Total Payable</span>
                                                <span className="text-xl font-sans font-black">₹{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.1}>
                                    <div className="bg-[#FDFBF7] rounded-2xl p-5 border border-accent/40 text-xs text-gray-600">
                                        <h3 className="font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <MapPin size={15} className="text-secondary" /> Delivery Destination
                                        </h3>
                                        <div className="font-bold text-gray-900 mb-0.5">{checkoutData.address?.fullName}</div>
                                        <p>{checkoutData.address?.houseNumber}{checkoutData.address?.landmark && `, ${checkoutData.address.landmark}`}</p>
                                        <p>{checkoutData.address?.city}, {checkoutData.address?.state} - {checkoutData.address?.pincode}</p>
                                        <p className="mt-1 font-medium text-primary">Contact: {checkoutData.address?.mobileNumber}</p>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Right Column: Payment Selection */}
                            <div>
                                <ScrollReveal delay={0.2}>
                                    <div className="bg-white rounded-2xl border-2 border-accent/40 p-6 shadow-xs h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                                                <CreditCard size={18} className="text-secondary" /> Choose Payment Option
                                            </h3>

                                            <div className="space-y-3 mb-6">
                                                {/* Option 1: Razorpay Online Payment */}
                                                <label 
                                                    className={`flex items-start p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'razorpay'
                                                            ? 'border-primary bg-primary/5 shadow-2xs'
                                                            : 'border-gray-200 hover:border-accent bg-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="razorpay"
                                                        checked={paymentMethod === 'razorpay'}
                                                        onChange={() => setPaymentMethod('razorpay')}
                                                        className="mt-1 w-4 h-4 accent-primary mr-3.5 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-gray-900 text-xs sm:text-sm">Online Payment (UPI / Cards / Netbanking)</span>
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Zero Fee</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-1">Instant confirmation via Google Pay, PhonePe, Paytm, UPI, Cards, or Netbanking.</p>
                                                    </div>
                                                </label>

                                                {/* Option 2: Cash on Delivery */}
                                                <label 
                                                    className={`flex items-start p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'COD'
                                                            ? 'border-primary bg-primary/5 shadow-2xs'
                                                            : 'border-gray-200 hover:border-accent bg-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="COD"
                                                        checked={paymentMethod === 'COD'}
                                                        onChange={() => setPaymentMethod('COD')}
                                                        className="mt-1 w-4 h-4 accent-primary mr-3.5 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-gray-900 text-xs sm:text-sm">Cash on Delivery (COD)</span>
                                                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">+₹50 Fee</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-1">Pay with cash or UPI to the delivery courier when your order arrives.</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Security Assurance Box */}
                                            <div className="bg-[#FDFBF7] rounded-xl p-3 mb-6 text-xs text-gray-600 flex gap-2.5 items-start border border-accent/30">
                                                <Lock size={15} className="text-secondary mt-0.5 shrink-0" />
                                                <p className="text-[11px] leading-relaxed">
                                                    {paymentMethod === 'razorpay'
                                                        ? "All transactions are secured by 256-bit bank-grade encryption via Razorpay. Zero raw card or CVV details are ever stored."
                                                        : "A verification WhatsApp message or call may be made to confirm delivery details for COD orders."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div>
                                            {(orderError || error) && (
                                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs animate-shake">
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

                                            {paymentMethod === 'razorpay' ? (
                                                <PaymentButton
                                                    amount={totalPrice}
                                                    orderId={orderId}
                                                    customerDetails={{
                                                        name: checkoutData.address?.fullName,
                                                        email: user?.email || checkoutData.address?.email || '',
                                                        phone: checkoutData.address?.mobileNumber,
                                                    }}
                                                    onBeforePayment={createOrderBackend}
                                                    onSuccess={(verifyData) => {
                                                        trackWebsiteEvent('purchase', {
                                                            orderId: orderId,
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
                                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
                                                >
                                                    {creatingOrder ? "Confirming Order..." : <>Confirm COD Order (₹{totalPrice.toLocaleString()}) <ArrowRight size={18} /></>}
                                                </AnimatedButton>
                                            )}

                                            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                                                <ShieldCheck size={14} className="text-secondary" />
                                                <span>100% Genuine Ayurvedic Guarantee</span>
                                            </div>
                                        </div>

                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>

                        {/* Back to Shipping */}
                        <div className="pt-4 border-t border-accent/40 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => navigate('/checkout/shipping')}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
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
