import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import { 
    CheckCircle2, 
    Package, 
    Calendar, 
    Home, 
    Phone, 
    ShoppingBag, 
    Truck, 
    MessageCircle, 
    Copy, 
    Check, 
    ExternalLink, 
    Sparkles, 
    ArrowRight,
    FileText,
    ShieldCheck
} from 'lucide-react';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

export default function CheckoutSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkoutData, resetCheckout } = useCheckout();
    const { user } = useAuth();
    const { clearCart } = useCart();

    const [orderDetails, setOrderDetails] = useState(checkoutData.orderDetails || null);
    const [loading, setLoading] = useState(!checkoutData.orderDetails);
    const [copiedAwb, setCopiedAwb] = useState(false);
    const [copiedOrderId, setCopiedOrderId] = useState(false);

    const orderId = searchParams.get('id') || checkoutData.orderId;

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const { data: res } = await api.get(`/checkout/order/${orderId}`);
            if (res.success) {
                setOrderDetails(res.data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        fetchOrderDetails();

        // If order exists but not paid yet, poll for status (waiting for Razorpay webhook / capture)
        let pollInterval;
        if (orderDetails && !orderDetails.isPaid && orderDetails.paymentMethod === 'Razorpay') {
            pollInterval = setInterval(async () => {
                try {
                    const { data: res } = await api.get(`/checkout/order/${orderId}?t=${Date.now()}`);
                    if (res.success && res.data.isPaid) {
                        setOrderDetails(res.data);
                        clearInterval(pollInterval);
                    }
                } catch (error) {
                    console.warn('[SUCCESS PAGE] Poll failed:', error.message);
                }
            }, 4000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [orderId, navigate, fetchOrderDetails, orderDetails?._id, orderDetails?.isPaid]);

    // Track purchase analytics and clear cart
    useEffect(() => {
        if (orderDetails && (orderDetails.isPaid || orderDetails.paymentMethod === 'COD')) {
            trackWebsiteEvent('purchase', {
                orderId: orderDetails._id,
                totalPrice: orderDetails.totalPrice,
                items: orderDetails.orderItems || []
            });
            if (clearCart) clearCart();
            if (resetCheckout) resetCheckout();
        }
    }, [orderDetails?._id, orderDetails?.isPaid, orderDetails?.paymentMethod]);

    const calculateEstimatedDelivery = () => {
        if (!orderDetails) return '3-5 Business Days';
        const days = parseInt(orderDetails.estimatedDeliveryDays?.split('-')[1]) || 4;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);

        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const copyText = (text, type) => {
        if (!text) return;
        navigator.clipboard?.writeText(text);
        if (type === 'awb') {
            setCopiedAwb(true);
            setTimeout(() => setCopiedAwb(false), 2000);
        } else {
            setCopiedOrderId(true);
            setTimeout(() => setCopiedOrderId(false), 2000);
        }
    };

    const handleContinueShopping = () => {
        resetCheckout();
        navigate('/shop');
    };

    // Generate WhatsApp Order Confirmation URL for Order Desk (+91 79909 34095)
    const getWhatsAppOrderUrl = () => {
        if (!orderDetails) return '#';
        const itemsList = orderDetails.orderItems?.map(i => `${i.name} (x${i.qty})`).join(', ') || 'Ayurvedic Formulations';
        const shortOrderId = String(orderDetails._id).slice(-8).toUpperCase();
        const awbText = orderDetails.waybill ? `\n• AWB Tracking: ${orderDetails.waybill}` : '';

        const message = 
            `Namaste Hridved Order Desk! 🙏\n\n` +
            `I have placed Order #${shortOrderId} on the website.\n\n` +
            `📦 *Order Details:*\n` +
            `• Items: ${itemsList}\n` +
            `• Total Amount: ₹${orderDetails.totalPrice}\n` +
            `• Payment Mode: ${orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}\n` +
            `• Name: ${orderDetails.shippingAddress?.fullName || 'Customer'}\n` +
            `• City: ${orderDetails.shippingAddress?.city || ''} (${orderDetails.shippingAddress?.pincode || ''})${awbText}\n\n` +
            `Please share dispatch and live courier updates with me. Thank you!`;

        return `https://wa.me/917990934095?text=${encodeURIComponent(message)}`;
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-14 h-14 border-3 border-emerald-700/20 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-serif font-bold text-stone-800">Confirming Your Order...</h2>
                        <p className="text-sm text-stone-500 mt-1">Authenticating with Wayuvega logistics partner</p>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    if (!orderDetails) {
        return (
            <AnimatedPage>
                <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
                            <Package size={28} />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Order Details Not Found</h2>
                        <p className="text-sm text-stone-500 mb-6">We could not load this order. Please return to your account or continue browsing.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 bg-[#053807] hover:bg-[#074609] text-white rounded-xl font-bold text-sm transition"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const shortOrderId = String(orderDetails._id).slice(-8).toUpperCase();
    const isConfirmed = orderDetails.isPaid || orderDetails.paymentMethod === 'COD';
    const activeAwb = orderDetails.waybill;

    return (
        <AnimatedPage>
            <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-14 text-stone-800">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Smooth Animated Hero Header */}
                    <ScrollReveal>
                        <div className="text-center mb-8 sm:mb-12">
                            {/* Glowing Success Badge */}
                            <div className="inline-flex items-center justify-center relative mb-5">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xl border-4 border-white relative z-10">
                                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
                                <Sparkles size={13} className="text-emerald-700" />
                                <span>Order Confirmed & Booked</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
                                Dhanyavaad! Aapka Order Confirm Ho Gaya 🙏
                            </h1>

                            <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                                Hridved pure Ayurvedic formulations are being prepared and verified. A confirmation SMS has been sent to{' '}
                                <strong className="text-stone-900">
                                    {orderDetails.shippingAddress?.mobileNumber ? `+91 ${orderDetails.shippingAddress.mobileNumber}` : 'your registered phone'}
                                </strong>.
                            </p>

                            {/* Reference Badge with Copy */}
                            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-stone-200">
                                <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Order Reference:</span>
                                <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">#{shortOrderId}</span>
                                <button
                                    onClick={() => copyText(orderDetails._id, 'order')}
                                    className="p-1 hover:bg-stone-100 rounded text-stone-500 transition"
                                    title="Copy Full Order ID"
                                >
                                    {copiedOrderId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                </button>
                                {copiedOrderId && <span className="text-[10px] text-emerald-700 font-bold">Copied!</span>}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Wayuvega Courier Dispatch Card (High-Gloss Dark Emerald) */}
                    <ScrollReveal delay={0.1}>
                        <div className="bg-gradient-to-br from-[#032405] via-[#053807] to-[#011a04] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl border border-emerald-500/25 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/10 shadow-inner">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 block">
                                                Fast Express Delivery
                                            </span>
                                            <h3 className="text-lg font-bold text-white tracking-wide">
                                                {orderDetails.courierName || 'DELHIVERY SURFACE (Wayuvega)'}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                            <span>{orderDetails.shippingStatus || 'Dispatch Ready'}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                    {/* AWB / Waybill */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono block mb-1">
                                            Wayuvega Waybill (AWB)
                                        </span>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono font-bold text-lg text-emerald-300 tracking-wider">
                                                {activeAwb || 'Generating AWB...'}
                                            </span>
                                            {activeAwb && (
                                                <button
                                                    onClick={() => copyText(activeAwb, 'awb')}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 transition"
                                                    title="Copy AWB"
                                                >
                                                    {copiedAwb ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Estimated Delivery */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono block mb-1">
                                            Estimated Delivery
                                        </span>
                                        <div className="flex items-center gap-2 text-white font-bold text-base">
                                            <Calendar size={18} className="text-emerald-300" />
                                            <span>{calculateEstimatedDelivery()}</span>
                                        </div>
                                    </div>

                                    {/* Payment Confirmation */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 sm:col-span-2 lg:col-span-1">
                                        <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono block mb-1">
                                            Payment Mode
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">
                                                {orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orderDetails.isPaid ? 'bg-emerald-400 text-stone-950' : 'bg-amber-400/20 text-amber-300'}`}>
                                                {orderDetails.isPaid ? 'PAID' : 'PAY ON DELIVERY'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Instant WhatsApp Order Desk Card */}
                    <ScrollReveal delay={0.15}>
                        <div className="bg-gradient-to-r from-emerald-950 via-[#073318] to-stone-950 text-white rounded-3xl p-6 sm:p-7 mb-8 shadow-lg border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-13 h-13 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 shadow-inner">
                                    <MessageCircle size={28} className="fill-current" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-[#25D366] text-stone-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            WhatsApp Desk
                                        </span>
                                        <span className="text-xs text-emerald-200 font-mono">+91 79909 34095</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                                        Direct WhatsApp Confirmation & Live Tracking
                                    </h3>
                                    <p className="text-xs text-white/75 mt-0.5 max-w-lg leading-relaxed">
                                        Tap below to notify our order desk team on WhatsApp and receive dispatch alerts & invoice directly on your phone.
                                    </p>
                                </div>
                            </div>

                            <a
                                href={getWhatsAppOrderUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto bg-[#25D366] hover:bg-[#1fae53] text-stone-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
                            >
                                <MessageCircle size={16} className="fill-current" />
                                <span>Confirm on WhatsApp</span>
                            </a>
                        </div>
                    </ScrollReveal>

                    {/* Order Details & Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                        {/* Items Summary */}
                        <ScrollReveal delay={0.2}>
                            <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-7 h-full flex flex-col">
                                <h3 className="text-base font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-[#053807]" />
                                    <span>Ordered Formulations ({orderDetails.orderItems?.length || 0})</span>
                                </h3>

                                <div className="divide-y divide-stone-100 flex-1">
                                    {orderDetails.orderItems?.map((item, idx) => (
                                        <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                                            <img
                                                src={item.image || '/logo-modified.png'}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-xl object-cover bg-stone-50 border border-stone-100"
                                                onError={(e) => { e.target.src = '/logo-modified.png'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-stone-900 text-sm line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-stone-400 mt-0.5">
                                                    Qty: <span className="font-bold text-stone-700">{item.qty}</span>
                                                    {item.weight ? ` • ${item.weight * 1000 >= 1000 ? `${item.weight} kg` : `${Math.round(item.weight * 1000)}g`}` : ' • 500g'}
                                                </p>
                                            </div>
                                            <div className="text-right font-bold text-stone-900 text-sm">
                                                ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600 mt-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-stone-900">₹{Number(orderDetails.itemsPrice || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Express Shipping</span>
                                        <span className="font-medium text-emerald-700">
                                            {Number(orderDetails.shippingPrice) === 0 ? 'FREE' : `₹${Number(orderDetails.shippingPrice).toLocaleString('en-IN')}`}
                                        </span>
                                    </div>
                                    {Number(orderDetails.discountAmount) > 0 && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Ayurvedic Discount</span>
                                            <span>-₹{Number(orderDetails.discountAmount).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-stone-900 font-bold text-base">
                                        <span>Grand Total</span>
                                        <span className="text-xl font-serif text-[#053807]">
                                            ₹{Number(orderDetails.totalPrice || 0).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Delivery Destination */}
                        <ScrollReveal delay={0.25}>
                            <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-7 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                                        <Home size={18} className="text-[#053807]" />
                                        <span>Delivery Destination</span>
                                    </h3>

                                    {orderDetails.shippingAddress ? (
                                        <div className="space-y-2 text-stone-600 text-sm leading-relaxed">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-stone-900 text-base">
                                                    {orderDetails.shippingAddress.fullName || 'Customer'}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                                    {orderDetails.shippingAddress.addressType || 'Home'}
                                                </span>
                                            </div>

                                            <p>
                                                {orderDetails.shippingAddress.houseNumber}
                                                {orderDetails.shippingAddress.landmark ? `, Near ${orderDetails.shippingAddress.landmark}` : ''}
                                            </p>
                                            <p>
                                                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} -{' '}
                                                <span className="font-bold text-stone-900">{orderDetails.shippingAddress.pincode}</span>
                                            </p>

                                            <div className="pt-2 text-stone-700 flex items-center gap-2">
                                                <Phone size={14} className="text-emerald-800" />
                                                <span>+91 {orderDetails.shippingAddress.mobileNumber}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-stone-400">Address recorded on invoice.</p>
                                    )}
                                </div>

                                <div className="mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <p className="text-xs text-emerald-900 font-medium">
                                        100% Genuine Ayurvedic formulation guaranteed directly from Hridved Central Herbarium.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Stylish Action Suite (Open to all customers) */}
                    <ScrollReveal delay={0.3}>
                        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-8 text-center">
                            <h3 className="text-sm uppercase tracking-widest font-bold text-stone-400 mb-4">
                                What Would You Like To Do Next?
                            </h3>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {/* Track Live Order */}
                                <Link
                                    to={`/track-order?q=${activeAwb || orderDetails._id}`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#053807] via-[#074b0a] to-[#042e06] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
                                >
                                    <Truck size={16} />
                                    <span>Track Live Order</span>
                                </Link>

                                {/* View Full Order Details */}
                                <Link
                                    to={`/order/${orderDetails._id}`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-widest transition"
                                >
                                    <FileText size={16} />
                                    <span>View Order Details</span>
                                </Link>

                                {/* Continue Shopping */}
                                <button
                                    onClick={handleContinueShopping}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition"
                                >
                                    <span>Continue Shopping</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>

                </div>
            </div>
        </AnimatedPage>
    );
}
