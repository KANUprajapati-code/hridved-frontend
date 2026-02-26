import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import { CreditCard, Lock, ShieldCheck, ChevronLeft, ArrowRight, MapPin, Package } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';

export default function CheckoutPaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart } = useCart();
    const { checkoutData, updateStep, setErrorMessage, clearError, setOrderId } = useCheckout();

    const [loading] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

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

        // 4. Polling for payment status (Optimized for QR payments)
        let pollInterval;
        if (orderId && !checkoutData.isPaymentConfirmed) {
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
                    // Force no-cache to get latest DB status
                    const { data: res } = await api.get(`/checkout/order/${orderId}?t=${Date.now()}`);
                    if (res.success && res.data.isPaid) {
                        console.log("[POLLING] Payment detected! Redirecting...");
                        clearInterval(pollInterval);
                        navigate(`/checkout/success?id=${orderId}`);
                    }
                } catch (err) {
                    // Silent fail for polling errors to avoid interrupting user session
                    console.warn("[POLLING] Check failed:", err.message);
                }
            }, 4000); // 4 second interval
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [checkoutData, navigate, cart, orderId]);

    const calculateTotals = () => {
        const cartItems = cart?.cartItems || [];
        const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
        const taxPrice = 0;
        const shippingPrice = checkoutData.shippingCost || 0;
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        return { itemsPrice, taxPrice, shippingPrice, totalPrice };
    };

    const createOrderBackend = async () => {
        try {
            setCreatingOrder(true);
            clearError();

            const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateTotals();
            const cartItems = cart?.cartItems || [];

            const { data: res } = await api.post('/checkout/create-order', {
                addressId: checkoutData.address._id,
                deliveryOption: checkoutData.shippingMethod,
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    product: item.product || item._id,
                })),
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            if (res.success) {
                setOrderId(res.data._id, res.data);
                return res.data;
            } else {
                throw new Error(res.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to create order');
            throw error;
        } finally {
            setCreatingOrder(false);
        }
    };

    const createRazorpayOrder = async (totalAmount) => {
        try {
            const { data } = await api.post('/razorpay/order', {
                amount: totalAmount,
                currency: 'INR',
                receipt: `order_${Date.now()}`,
            });
            return data;
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            setErrorMessage('Failed to create payment order');
            throw error;
        }
    };

    const [paymentMethod, setPaymentMethod] = useState('razorpay');

    const handleCODOrder = async () => {
        try {
            setCreatingOrder(true);
            clearError();

            const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateTotals();
            const cartItems = cart?.cartItems || [];

            const { data: res } = await api.post('/checkout/create-order', {
                addressId: checkoutData.address._id,
                deliveryOption: checkoutData.shippingMethod,
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    product: item.product || item._id,
                })),
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentMethod: 'COD',
            });

            if (res.success) {
                setOrderId(res.data._id, res.data);
                navigate(`/checkout/success?id=${res.data._id}`);
                return res.data;
            } else {
                throw new Error(res.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating COD order:', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to create order');
        } finally {
            setCreatingOrder(false);
        }
    };

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        if (paymentMethod === 'COD') {
            await handleCODOrder();
        }
    };

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateTotals();

    return (
        <AnimatedPage>
            <div className="bg-background min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <CheckoutStepIndicator />

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 font-sans">Payment</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Order Summary */}
                            <div className="space-y-6">
                                <ScrollReveal>
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <Package size={16} /> Order Summary
                                        </h3>

                                        <div className="space-y-4 mb-4">
                                            {cart?.cartItems && cart.cartItems.map((item) => (
                                                <div key={item.product || item._id} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{item.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">Qty: {item.qty}</div>
                                                    </div>
                                                    <div className="font-bold text-gray-900 text-sm">₹{(item.price * item.qty).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 text-sm pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₹{itemsPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Shipping</span>
                                                <span>₹{shippingPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                                                <span>Total Amount</span>
                                                <span>₹{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.1}>
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <MapPin size={16} /> Delivery Address
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="font-bold text-gray-900 mb-1">{checkoutData.address?.fullName}</div>
                                            <p>{checkoutData.address?.houseNumber}{checkoutData.address?.landmark && `, ${checkoutData.address.landmark}`}</p>
                                            <p>{checkoutData.address?.city}, {checkoutData.address?.state} - {checkoutData.address?.pincode}</p>
                                            <p className="pt-1 font-medium text-gray-700">{checkoutData.address?.mobileNumber}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Payment Section */}
                            <div>
                                <ScrollReveal delay={0.2}>
                                    <div className="bg-white rounded-xl border-2 border-primary/10 p-6 md:p-8 shadow-sm h-full flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <CreditCard size={20} className="text-primary" /> Select Payment Method
                                        </h3>

                                        <div className="space-y-4 mb-8">
                                            {/* Razorpay Option */}
                                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="razorpay"
                                                    checked={paymentMethod === 'razorpay'}
                                                    onChange={() => setPaymentMethod('razorpay')}
                                                    className="w-5 h-5 accent-primary mr-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">Online Payment</div>
                                                    <div className="text-xs text-gray-500">Cards, UPI, Netbanking, Wallets</div>
                                                    {paymentMethod === 'razorpay' && (
                                                        <div className="text-[10px] text-primary font-bold bg-white border border-primary px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">Razorpay Secured</div>
                                                    )}
                                                </div>
                                                {paymentMethod === 'razorpay' && <ShieldCheck size={20} className="text-primary" />}
                                            </label>

                                            {/* COD Option */}
                                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="COD"
                                                    checked={paymentMethod === 'COD'}
                                                    onChange={() => setPaymentMethod('COD')}
                                                    className="w-5 h-5 accent-primary mr-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">Cash on Delivery (COD)</div>
                                                    <div className="text-xs text-gray-500">Pay when you receive your order</div>
                                                </div>
                                                {paymentMethod === 'COD' && <Package size={20} className="text-primary" />}
                                            </label>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600 flex gap-3 items-start">
                                            <Lock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p>
                                                {paymentMethod === 'razorpay'
                                                    ? "Secure your order with instant online payment. All transactions are SSL encrypted."
                                                    : "A small verification call might be made for COD orders to confirm your details."}
                                            </p>
                                        </div>

                                        <div className="mt-auto">
                                            {paymentMethod === 'razorpay' ? (
                                                <PaymentButton
                                                    amount={totalPrice}
                                                    onBeforePayment={createOrderBackend}
                                                    onError={(err) => setErrorMessage(err)}
                                                />
                                            ) : (
                                                <AnimatedButton
                                                    onClick={handleCODOrder}
                                                    disabled={creatingOrder}
                                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all flex items-center justify-center gap-2 border-none"
                                                >
                                                    {creatingOrder ? "Processing..." : <>Complete Order <ArrowRight size={20} /></>}
                                                </AnimatedButton>
                                            )}

                                            <div className="mt-4 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
                                                {orderId && !checkoutData.isPaymentConfirmed && paymentMethod === 'razorpay' && (
                                                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse mb-2 text-sm bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                                        Waiting for payment confirmation...
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Lock size={12} />
                                                    <span>Your information is safe & secure</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="pt-6 border-t border-gray-100">
                            <AnimatedButton
                                onClick={() => navigate('/checkout/shipping')}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200 flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
                            >
                                <ChevronLeft size={20} /> Back to Shipping
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
