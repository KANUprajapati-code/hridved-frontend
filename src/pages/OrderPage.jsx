import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Truck, CheckCircle2, Copy, Check, ExternalLink, Package, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ orderId, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success?id=${orderId}`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else {
            setMessage('Payment Processed');
            onSuccess();
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />
            {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full bg-[#053807] text-white py-3 rounded-xl mt-4 hover:bg-[#074609] transition font-bold disabled:opacity-50"
            >
                <span id="button-text">
                    {isProcessing ? "Processing ... " : "Pay Now"}
                </span>
            </button>
        </form>
    );
};

const OrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const { user } = useAuth();
    const [copiedAwb, setCopiedAwb] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Stripe State
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    // Tracking State
    const [trackingInput, setTrackingInput] = useState('');
    const [courierInput, setCourierInput] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                // Attempt fetching through checkout order endpoint (supports guest / public / auth)
                try {
                    const { data: res } = await api.get(`/checkout/order/${id}`);
                    if (res && res.success && res.data) {
                        setOrder(res.data);
                        initStripeIfRequired(res.data);
                        return;
                    }
                } catch (checkoutErr) {
                    // Fallback to standard order endpoint
                }

                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                initStripeIfRequired(data);
            } catch (error) {
                console.error('Error fetching order:', error);
                setErrorMsg('Could not find or load this order. Please check the order reference.');
            } finally {
                setLoading(false);
            }
        };

        const initStripeIfRequired = async (data) => {
            if (!data.isPaid && data.paymentMethod === 'Stripe') {
                try {
                    const { data: publishableKey } = await api.get('/config/stripe');
                    setStripePromise(loadStripe(publishableKey));

                    const { data: intentData } = await api.post('/payment/create-payment-intent', {
                        amount: Math.round(data.totalPrice * 100),
                        currency: 'inr'
                    });
                    setClientSecret(intentData.clientSecret);
                } catch (stErr) {
                    console.error('Stripe init error:', stErr);
                }
            }
        };

        fetchOrder();
    }, [id]);

    const copyToClipboard = (text) => {
        navigator.clipboard?.writeText(text);
        setCopiedAwb(true);
        setTimeout(() => setCopiedAwb(false), 2000);
    };

    const handlePaymentSuccess = async () => {
        try {
            await api.put(`/orders/${order._id}/pay`, {});
            setOrder({ ...order, isPaid: true, paidAt: new Date().toISOString() });
            alert('Payment Successful! Thank you.');
        } catch (error) {
            console.error(error);
            alert('Error updating order status');
        }
    };

    const handleBookWayuvegaShipment = async () => {
        try {
            setBookingLoading(true);
            const { data } = await api.post('/shipping/create-shipment', { orderId: order._id });
            if (data.success) {
                alert(`Wayuvega Courier Booked Successfully!\nAWB: ${data.waybill}\nCourier: ${data.courierName || 'Delhivery Surface'}`);
                setOrder(prev => ({
                    ...prev,
                    waybill: data.waybill,
                    courierName: data.courierName || 'Delhivery Surface',
                    shippingStatus: 'Shipped'
                }));
            } else {
                alert('Booking note: ' + (data.message || 'Check Wayuvega dashboard'));
            }
        } catch (err) {
            alert('Booking failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    const trackingUpdateHandler = async () => {
        try {
            const { data } = await api.put(`/orders/${order._id}/tracking`, {
                trackingId: trackingInput,
                courierName: courierInput || 'Delhivery Surface'
            });
            setOrder(data);
            alert('Tracking Updated Successfully');
            setTrackingInput('');
            setCourierInput('');
        } catch (error) {
            console.error(error);
            alert('Error updating tracking info');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-emerald-50/30">
                <div className="w-12 h-12 border-3 border-emerald-700/20 border-t-emerald-700 rounded-full animate-spin mb-4" />
                <p className="text-stone-600 font-medium font-serif">Loading order details...</p>
            </div>
        );
    }

    if (errorMsg || !order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <Package size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Order Not Found</h2>
                <p className="text-stone-500 max-w-md mb-6">{errorMsg || 'We could not find the requested order.'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-[#053807] text-white rounded-xl font-bold hover:bg-[#074609] transition"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe',
        variables: { colorPrimary: '#053807' },
    };
    const options = { clientSecret, appearance };

    const activeAwb = order.waybill || order.trackingId;

    return (
        <div className="bg-[#FAF8F5] min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-stone-200/80 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                Verified Order
                            </span>
                            <span className="text-xs text-stone-400">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                            Order #{String(order._id).slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-xs font-mono text-stone-400 mt-0.5">Ref: {order._id}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {activeAwb && (
                            <Link
                                to={`/track-order?q=${activeAwb}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.02] transition"
                            >
                                <Truck size={16} /> Track Live Order
                            </Link>
                        )}
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-stone-700 border border-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: 2 Columns */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Wayuvega Courier Card */}
                        <div className="bg-gradient-to-br from-emerald-900 via-[#053807] to-teal-950 text-white p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-hidden border border-emerald-500/20">
                            <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                                            <Truck size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] tracking-widest uppercase font-mono text-emerald-300 block">
                                                Courier Partner
                                            </span>
                                            <h3 className="text-base font-bold text-white tracking-wide">
                                                {order.courierName || 'DELHIVERY SURFACE (Wayuvega)'}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        {order.shippingStatus || 'Dispatch Ready'}
                                    </span>
                                </div>

                                {activeAwb ? (
                                    <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[11px] text-white/60 uppercase font-mono tracking-wider block">
                                                Wayuvega Tracking / Waybill (AWB)
                                            </span>
                                            <span className="text-lg font-mono font-bold text-emerald-300 tracking-wider">
                                                {activeAwb}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(activeAwb)}
                                                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                                            >
                                                {copiedAwb ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                <span>{copiedAwb ? 'Copied' : 'Copy AWB'}</span>
                                            </button>
                                            <Link
                                                to={`/track-order?q=${activeAwb}`}
                                                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                                            >
                                                <span>Live Tracking</span>
                                                <ExternalLink size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-xs text-white/70">
                                        Shipment is queued for Wayuvega manifest generation. Your courier waybill will appear here once booked.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
                            <h2 className="text-lg font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                                <Package size={18} className="text-emerald-800" />
                                <span>Order Formulations ({order.orderItems?.length || 0})</span>
                            </h2>

                            <div className="divide-y divide-stone-100">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                        <img
                                            src={item.image || '/logo-modified.png'}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-xl object-cover bg-stone-50 border border-stone-200/60"
                                            onError={(e) => { e.target.src = '/logo-modified.png'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={item.product ? `/product/${item.product}` : '#'}
                                                className="font-medium text-stone-900 hover:text-emerald-800 transition line-clamp-1 text-sm sm:text-base"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="text-xs text-stone-400 mt-0.5">
                                                Qty: <span className="font-bold text-stone-700">{item.qty}</span>
                                                {item.weight ? ` • ${item.weight * 1000 >= 1000 ? `${item.weight} kg` : `${Math.round(item.weight * 1000)}g`}` : ' • 500g'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-stone-900 text-sm sm:text-base">
                                                ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                            </div>
                                            <div className="text-xs text-stone-400">₹{item.price} each</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address & Contact */}
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
                            <h2 className="text-lg font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                                <MapPin size={18} className="text-emerald-800" />
                                <span>Delivery Address</span>
                            </h2>

                            {order.shippingAddress ? (
                                <div className="space-y-1.5 text-stone-600 text-sm">
                                    <div className="font-bold text-stone-900 text-base mb-1">
                                        {order.shippingAddress.fullName || order.user?.name || 'Customer'}
                                    </div>
                                    <p className="leading-relaxed">
                                        {order.shippingAddress.houseNumber}
                                        {order.shippingAddress.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}
                                    </p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                        <span className="font-bold text-stone-900">{order.shippingAddress.pincode}</span>
                                    </p>
                                    <p className="pt-2 text-stone-700">
                                        <strong>Phone:</strong> +91 {order.shippingAddress.mobileNumber}
                                    </p>
                                    {(order.email || order.user?.email) && (
                                        <p className="text-stone-700">
                                            <strong>Email:</strong> {order.email || order.user?.email}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-400">Address details unavailable</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Summary & Admin Side */}
                    <div className="space-y-6">

                        {/* Pricing Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
                            <h2 className="text-lg font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                                <CreditCard size={18} className="text-emerald-800" />
                                <span>Price Breakdown</span>
                            </h2>

                            <div className="space-y-3 text-sm text-stone-600">
                                <div className="flex justify-between">
                                    <span>Formulations Subtotal</span>
                                    <span className="font-medium text-stone-900">₹{Number(order.itemsPrice || 0).toLocaleString('en-IN')}</span>
                                </div>

                                {Number(order.taxPrice) > 0 && (
                                    <div className="flex justify-between">
                                        <span>GST (Taxes)</span>
                                        <span className="font-medium text-stone-900">₹{Number(order.taxPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>Wayuvega Express Delivery</span>
                                    <span className="font-medium text-stone-900">
                                        {Number(order.shippingPrice) === 0 ? (
                                            <span className="text-emerald-700 font-bold">FREE</span>
                                        ) : (
                                            `₹${Number(order.shippingPrice).toLocaleString('en-IN')}`
                                        )}
                                    </span>
                                </div>

                                {Number(order.codPrice) > 0 && (
                                    <div className="flex justify-between">
                                        <span>COD Convenience Fee</span>
                                        <span className="font-medium text-stone-900">₹{Number(order.codPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                {Number(order.discountAmount) > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-medium">
                                        <span>Ayurvedic Coupon Discount</span>
                                        <span>-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                                    <span className="text-base font-bold text-stone-900">Total Amount</span>
                                    <span className="text-2xl font-serif font-bold text-[#053807]">
                                        ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-stone-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Payment Mode</span>
                                    <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-md">
                                        {order.paymentMethod === 'COD' ? 'Cash On Delivery (COD)' : order.paymentMethod}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Payment Status</span>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {order.isPaid ? 'PAID' : 'PENDING'}
                                    </span>
                                </div>
                            </div>

                            {!order.isPaid && order.paymentMethod === 'Stripe' && clientSecret && (
                                <div className="mt-6 pt-4 border-t">
                                    <Elements options={options} stripe={stripePromise}>
                                        <CheckoutForm orderId={order._id} amount={order.totalPrice} onSuccess={handlePaymentSuccess} />
                                    </Elements>
                                </div>
                            )}
                        </div>

                        {/* Admin Controls */}
                        {user && user.isAdmin && (
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-300 p-6">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 text-[#053807]">
                                    <ShieldCheck size={20} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Admin Courier Controls</h3>
                                </div>

                                <div className="space-y-4">
                                    {!activeAwb ? (
                                        <button
                                            onClick={handleBookWayuvegaShipment}
                                            disabled={bookingLoading}
                                            className="w-full bg-[#053807] hover:bg-[#074609] text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition disabled:opacity-50"
                                        >
                                            {bookingLoading ? 'Booking Wayuvega...' : 'Book Wayuvega Courier Shipment'}
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                                            Shipment is successfully registered with Wayuvega under AWB: <strong>{activeAwb}</strong>
                                        </div>
                                    )}

                                    {/* Manual Tracking Override */}
                                    <div className="pt-4 border-t border-stone-100">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                                            Manual Tracking Override
                                        </h4>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Courier (e.g. Delhivery)"
                                                value={courierInput}
                                                onChange={(e) => setCourierInput(e.target.value)}
                                                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700"
                                            />
                                            <input
                                                type="text"
                                                placeholder="AWB / Waybill Number"
                                                value={trackingInput}
                                                onChange={(e) => setTrackingInput(e.target.value)}
                                                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700"
                                            />
                                            <button
                                                onClick={trackingUpdateHandler}
                                                disabled={!trackingInput}
                                                className="w-full bg-stone-800 hover:bg-stone-900 text-white py-2 rounded-lg text-xs font-bold transition disabled:opacity-40"
                                            >
                                                Save Tracking Info
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
