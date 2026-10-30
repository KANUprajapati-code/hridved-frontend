import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Truck, Package, CheckCircle2, 
    MapPin, Calendar, Clock, ChevronRight, 
    AlertCircle, ArrowLeft, Box, ShieldCheck, 
    MessageCircle, Sparkles, RefreshCw, RotateCcw, 
    Stethoscope, HelpCircle, PhoneCall
} from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/SEO';

const WHATSAPP_SUPPORT_PHONE = '917990934095';

const TrackOrderPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('orderId') || queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [ordersList, setOrdersList] = useState([]);
    const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const activeOrder = ordersList[selectedOrderIndex] || null;

    const handleTrack = async (overrideQuery) => {
        const queryToUse = (typeof overrideQuery === 'string' ? overrideQuery : searchQuery).trim();
        if (!queryToUse) {
            setError('Please enter your 10-digit mobile number, Order ID, or Waybill');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/orders/track', { query: queryToUse });
            if (Array.isArray(data) && data.length > 0) {
                setOrdersList(data);
                setSelectedOrderIndex(0);
            } else {
                setError('No orders found matching that query. Please check and try again.');
                setOrdersList([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not find any orders with that information. Please check your Order ID or phone number.');
            setOrdersList([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-track if URL query param exists
    useEffect(() => {
        if (initialQuery) {
            handleTrack(initialQuery);
        }
    }, [initialQuery]);

    // Stepper definition
    const statusSteps = [
        { label: 'Order Confirmed', description: 'Ayurvedic order placed', icon: <Package size={18} /> },
        { label: 'Formulated & Packed', description: 'Herbs measured and sealed', icon: <Box size={18} /> },
        { label: 'In Transit', description: 'Dispatched with carrier', icon: <Truck size={18} /> },
        { label: 'Delivered', description: 'Safely delivered to you', icon: <CheckCircle2 size={18} /> },
    ];

    const getCurrentStep = () => {
        if (!activeOrder) return 0;
        const status = (activeOrder.shippingStatus || '').toLowerCase();
        if (status.includes('deliver')) return 3;
        if (status.includes('ship') || status.includes('transit') || status.includes('out')) return 2;
        if (status.includes('pack') || status.includes('ready') || status.includes('process')) return 1;
        return 0; // Order Confirmed
    };

    const handleWhatsAppSupport = (category) => {
        const orderRef = activeOrder ? `#${activeOrder._id.slice(-8).toUpperCase()}` : searchQuery;
        let message = '';

        switch (category) {
            case 'delay':
                message = `Namaste Hridved Support, I am tracking Order ${orderRef} (Waybill: ${activeOrder?.waybill || 'N/A'}). Could you please share the current dispatch update?`;
                break;
            case 'return':
                message = `Namaste Hridved Support, I have an inquiry regarding return or exchange for Order ${orderRef}. Please advise on the reverse pickup procedure.`;
                break;
            case 'dosage':
                message = `Namaste Hridved Vaidya, I placed Order ${orderRef} and would like clinical guidance on dosage and anupana for my herbal formulations.`;
                break;
            case 'address':
                message = `Namaste Hridved Logistics, I need to verify or update the delivery address for Order ${orderRef}.`;
                break;
            default:
                message = `Namaste Hridved Support, I need assistance with tracking my Order ${orderRef}.`;
                break;
        }

        window.open(`https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-8 sm:py-14">
            <SEO
                title="Track Your Order"
                description="Check the real-time shipping progress, waybill, and estimated delivery of your Ayurvedic remedies."
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Track Order', path: '/track-order' }
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back to Home Breadcrumb */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </Link>

                {/* Hero Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                        <Sparkles size={14} className="text-secondary" /> Real-time Logistics
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
                        Track Your Ayurvedic Order
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto">
                        Enter your 10-digit registered mobile number, Order ID, or Courier Waybill to inspect live transit status.
                    </p>
                </div>

                {/* Search Bar Card */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-gray-100 mb-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleTrack();
                        }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Enter Mobile (e.g. 98765 43210), Order ID, or Waybill"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="bg-primary hover:bg-[#07470a] text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={16} />
                                    <span>Track Order</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                        <span>🔒 Privacy Protected: Personal addresses and phone numbers are securely masked.</span>
                        <button
                            type="button"
                            onClick={() => handleWhatsAppSupport('general')}
                            className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                        >
                            <MessageCircle size={13} className="text-[#25D366]" /> Need Help Tracking?
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-600 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-red-900">Order Not Located</h4>
                                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleWhatsAppSupport('general')}
                                className="bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap self-end sm:self-auto"
                            >
                                <MessageCircle size={15} />
                                <span>WhatsApp Support</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Multiple Orders Selector (when user enters phone number with multiple orders) */}
                {ordersList.length > 1 && (
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Found {ordersList.length} Orders Under this Number:
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {ordersList.map((ord, idx) => (
                                <button
                                    key={ord._id}
                                    type="button"
                                    onClick={() => setSelectedOrderIndex(idx)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                                        selectedOrderIndex === idx
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                                    }`}
                                >
                                    <span>#{ord._id.slice(-6).toUpperCase()}</span>
                                    <span className="opacity-75 ml-1.5 font-normal">
                                        ({new Date(ord.createdAt).toLocaleDateString()})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Tracking Details Result */}
                {activeOrder ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Main Status Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">
                                        Live Status
                                    </span>
                                    <h2 className="text-2xl font-serif font-bold text-primary mt-0.5">
                                        {activeOrder.shippingStatus || 'Order Confirmed'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Order #{activeOrder._id} • Placed on {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                                        Waybill: {activeOrder.waybill || 'Pending Allocation'}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${activeOrder.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {activeOrder.isPaid ? 'Paid' : 'Cash on Delivery'}
                                    </span>
                                </div>
                            </div>

                            {/* 4-Step Visual Timeline */}
                            <div className="py-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                                    {statusSteps.map((step, idx) => {
                                        const isCompleted = idx <= getCurrentStep();
                                        const isCurrent = idx === getCurrentStep();

                                        return (
                                            <div key={idx} className="flex flex-col items-center text-center relative z-10">
                                                <div
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                        isCompleted
                                                            ? 'bg-primary text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-400'
                                                    } ${isCurrent ? 'ring-4 ring-secondary/40 scale-105' : ''}`}
                                                >
                                                    {step.icon}
                                                </div>
                                                <h4 className={`text-xs font-bold mt-3 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                                    {step.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Logistics & Privacy-Safe Destination Meta */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <Truck size={12} className="text-secondary" /> Carrier Partner
                                    </span>
                                    <p className="text-sm font-bold text-gray-800 mt-1">
                                        {activeOrder.courierName || activeOrder.shippingProvider || 'Hridved Express'}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Speed: {activeOrder.deliveryOption || 'Standard Delivery'}
                                    </p>
                                </div>

                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <MapPin size={12} className="text-secondary" /> Destination
                                    </span>
                                    <p className="text-sm font-bold text-gray-800 mt-1">
                                        {activeOrder.destinationCity}, {activeOrder.destinationState}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        PIN: {activeOrder.destinationPincodeMasked}
                                    </p>
                                </div>

                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <Clock size={12} className="text-secondary" /> Estimated Delivery
                                    </span>
                                    <p className="text-sm font-bold text-primary mt-1">
                                        {activeOrder.estimatedDeliveryDays 
                                            ? `${activeOrder.estimatedDeliveryDays} Business Days` 
                                            : '3-5 Business Days'}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Recipient: {activeOrder.recipientMasked || 'Verified Customer'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Snapshot */}
                        {activeOrder.orderItems && activeOrder.orderItems.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                                <h3 className="text-base font-serif font-bold text-primary mb-4 flex items-center gap-2">
                                    <Box size={18} className="text-secondary" /> Items in this Parcel ({activeOrder.orderItems.length})
                                </h3>
                                <div className="divide-y divide-gray-100">
                                    {activeOrder.orderItems.map((item, i) => (
                                        <div key={i} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image || '/placeholder.png'}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1608248597359-2e061807353f?auto=format&fit=crop&q=80&w=200';
                                                    }}
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                                    <p className="text-[11px] text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-primary">
                                                ₹{item.qty * item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Support & Issue Router */}
                        <div className="bg-gradient-to-br from-primary to-[#07470a] text-white rounded-3xl p-6 sm:p-8 shadow-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 text-secondary text-xs uppercase font-bold tracking-widest">
                                        <HelpCircle size={14} /> Immediate Assistance
                                    </div>
                                    <h3 className="text-xl font-serif font-bold mt-1">
                                        Need Help with this Shipment?
                                    </h3>
                                    <p className="text-xs text-white/80 mt-1 max-w-md">
                                        Connect directly with the Hridved Logistics Desk or Ayurvedic Vaidya via WhatsApp for instant resolution.
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 text-xs font-mono text-center">
                                    <span className="text-secondary font-bold">Helpline:</span> +91 79909 34095
                                </div>
                            </div>

                            {/* 4 Action Tiles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleWhatsAppSupport('delay')}
                                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left border border-white/10 transition-all flex flex-col justify-between group active:scale-[0.98]"
                                >
                                    <Clock size={18} className="text-secondary mb-2" />
                                    <div>
                                        <h5 className="text-xs font-bold">Delivery Delay</h5>
                                        <p className="text-[10px] text-white/70 mt-0.5">Expedite transit</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleWhatsAppSupport('address')}
                                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left border border-white/10 transition-all flex flex-col justify-between group active:scale-[0.98]"
                                >
                                    <MapPin size={18} className="text-secondary mb-2" />
                                    <div>
                                        <h5 className="text-xs font-bold">Address Update</h5>
                                        <p className="text-[10px] text-white/70 mt-0.5">Modify destination</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleWhatsAppSupport('return')}
                                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left border border-white/10 transition-all flex flex-col justify-between group active:scale-[0.98]"
                                >
                                    <RotateCcw size={18} className="text-secondary mb-2" />
                                    <div>
                                        <h5 className="text-xs font-bold">Return / Exchange</h5>
                                        <p className="text-[10px] text-white/70 mt-0.5">7-day policy support</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleWhatsAppSupport('dosage')}
                                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left border border-white/10 transition-all flex flex-col justify-between group active:scale-[0.98]"
                                >
                                    <Stethoscope size={18} className="text-secondary mb-2" />
                                    <div>
                                        <h5 className="text-xs font-bold">Consult Vaidya</h5>
                                        <p className="text-[10px] text-white/70 mt-0.5">Dosage guidance</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Initial Empty State */
                    <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-accent/20 text-primary flex items-center justify-center mx-auto mb-4">
                            <Truck size={30} className="text-primary/70" />
                        </div>
                        <h3 className="text-lg font-serif font-bold text-primary">Ready to Inspect Shipments</h3>
                        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                            Once your order is confirmed, tracking credentials are dispatched via SMS and WhatsApp. Enter your details above to check current carrier progress.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
