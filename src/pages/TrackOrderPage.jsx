import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Truck, Package, CheckCircle2, 
    MapPin, Calendar, Clock, ChevronRight, 
    AlertCircle, ArrowLeft, Box, ShieldCheck, 
    MessageCircle, Sparkles, RefreshCw, RotateCcw, 
    Stethoscope, HelpCircle, PhoneCall, Copy, Check,
    Navigation, AlertTriangle, ExternalLink
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
    const [copiedAwb, setCopiedAwb] = useState(false);

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

    // 5-Stage Amazon/Meesho/Flipkart Milestone Definition
    const statusSteps = [
        { label: 'Order Confirmed', description: 'Manifest generated & verified', icon: <Package size={18} /> },
        { label: 'Packed & Ready', description: 'Formulations sealed & boxed', icon: <Box size={18} /> },
        { label: 'Shipped & In Transit', description: 'Moving across courier hubs', icon: <Truck size={18} /> },
        { label: 'Out for Delivery', description: 'With delivery executive', icon: <Navigation size={18} /> },
        { label: 'Delivered', description: 'Delivered safely to you', icon: <CheckCircle2 size={18} /> },
    ];

    const getCurrentStep = () => {
        if (!activeOrder) return 0;
        if (typeof activeOrder.currentStep === 'number') {
            return Math.min(Math.max(activeOrder.currentStep, 0), 4);
        }
        const status = (activeOrder.shippingStatus || '').toLowerCase();
        const code = String(activeOrder.statusCode || '');
        if (code === '100' || status.includes('deliver') || activeOrder.isDelivered) return 4;
        if (code === '80' || code === '330' || status.includes('out')) return 3;
        if (code === '60' || code === '70' || code === '340' || code === '350' || status.includes('ship') || status.includes('transit')) return 2;
        if (code === '40' || code === '50' || status.includes('pack') || status.includes('ready')) return 1;
        return 0; // Order Confirmed
    };

    const handleCopyWaybill = (waybill) => {
        if (!waybill) return;
        navigator.clipboard.writeText(waybill);
        setCopiedAwb(true);
        setTimeout(() => setCopiedAwb(false), 2500);
    };

    const handleWhatsAppSupport = (category) => {
        const orderRef = activeOrder ? `#${String(activeOrder._id).slice(-8).toUpperCase()}` : searchQuery;
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

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        try {
            const d = new Date(ts);
            return d.toLocaleString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch {
            return String(ts);
        }
    };

    const isNDR = String(activeOrder?.statusCode) === '110';
    const isDelivered = getCurrentStep() === 4 || activeOrder?.isDelivered;

    const latestScan = activeOrder?.timeline && activeOrder.timeline.length > 0 
        ? activeOrder.timeline[activeOrder.timeline.length - 1] 
        : null;
    const currentHub = latestScan?.location || activeOrder?.location || `${activeOrder?.destinationCity || 'Central'} Sorting Hub`;
    const latestActivity = latestScan?.status || activeOrder?.trackingStatus || activeOrder?.shippingStatus || 'In Transit';
    const latestRemarks = latestScan?.description || 'Parcel is moving through the courier logistics network';
    const latestScanTime = latestScan?.timestamp || activeOrder?.createdAt;

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-8 sm:py-14">
            <SEO
                title="Track Your Order - Live Courier Tracking"
                description="Live Amazon/Flipkart-style order tracking for Hridved Ayurvedic medicines. Real-time courier updates, AWB lookup, and delivery timeline."
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
                        <Sparkles size={14} className="text-secondary" /> Wayuvega Live Network
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
                        Live Shipment Tracking
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto">
                        Track your parcel with real-time carrier scans, hub transit updates, and estimated delivery dates.
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
                                placeholder="Enter Mobile Number (e.g. 9876543210), Order ID, or Waybill"
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
                                    <span>Scanning...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={16} />
                                    <span>Track Live</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                        <span>🔒 End-to-end privacy: Customer phone numbers and addresses are protected with masking.</span>
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
                                    <h4 className="text-xs font-bold text-red-900">Shipment Not Located</h4>
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

                {/* Multiple Orders Selector (when search matches multiple customer orders) */}
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
                                    <span>#{String(ord._id).slice(-6).toUpperCase()}</span>
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
                        {/* NDR or Special Notice Banner if applicable */}
                        {isNDR && (
                            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-amber-900">Delivery Attempt Unsuccessful</h4>
                                    <p className="text-xs text-amber-800 mt-1">
                                        The courier attempted delivery but the consignee was not available. A reattempt is scheduled automatically. If you wish to update the address or phone number, please contact us.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleWhatsAppSupport('address')}
                                        className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <MessageCircle size={14} /> Reschedule Delivery
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Main Status & Stepper Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100">
                            {/* Card Header with Live Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDelivered ? 'bg-emerald-400' : 'bg-secondary'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDelivered ? 'bg-emerald-500' : 'bg-secondary'}`}></span>
                                        </span>
                                        <span className="text-[11px] uppercase font-bold text-secondary tracking-widest">
                                            {isDelivered ? 'Delivered Safely' : 'Live Carrier Tracking'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                                        {activeOrder.trackingStatus || activeOrder.shippingStatus || 'Order Confirmed'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Order #{String(activeOrder._id).slice(-8).toUpperCase()} • Placed on {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {activeOrder.waybill && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopyWaybill(activeOrder.waybill)}
                                            className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                                            title="Click to copy waybill number"
                                        >
                                            <span>AWB: {activeOrder.waybill}</span>
                                            {copiedAwb ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-gray-400" />}
                                        </button>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${activeOrder.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {activeOrder.isPaid ? 'Prepaid' : 'Cash on Delivery'}
                                    </span>
                                </div>
                            </div>

                            {/* 5-Step Visual Progress Stepper (Amazon / Meesho / Flipkart style) */}
                            <div className="py-8">
                                <div className="relative">
                                    {/* Progress Background Line */}
                                    <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-gray-100 -z-0">
                                        <div 
                                            className="h-full bg-primary transition-all duration-700 ease-out"
                                            style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                                        {statusSteps.map((step, idx) => {
                                            const stepNum = getCurrentStep();
                                            const isCompleted = idx <= stepNum;
                                            const isCurrent = idx === stepNum;

                                            return (
                                                <div key={idx} className="flex flex-col items-center text-center">
                                                    <div
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                            isCompleted
                                                                ? 'bg-primary text-white shadow-md'
                                                                : 'bg-gray-100 text-gray-400'
                                                        } ${isCurrent ? 'ring-4 ring-secondary/50 scale-110 shadow-lg' : ''}`}
                                                    >
                                                        {isCompleted && idx < stepNum ? (
                                                            <CheckCircle2 size={20} className="text-white" />
                                                        ) : (
                                                            step.icon
                                                        )}
                                                    </div>
                                                    <h4 className={`text-xs font-bold mt-3 ${isCompleted ? 'text-gray-900 font-extrabold' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                                        {step.description}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="mt-1 px-2 py-0.5 bg-secondary/20 text-primary text-[9px] font-black uppercase rounded-full tracking-wider">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Carrier & Delivery Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <Truck size={12} className="text-secondary" /> Courier Network
                                    </span>
                                    <p className="text-sm font-bold text-gray-800 mt-1">
                                        {activeOrder.courierName || 'DELHIVERY SURFACE'}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Speed: {activeOrder.deliveryOption || 'Surface Express'}
                                    </p>
                                </div>

                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <MapPin size={12} className="text-secondary" /> Current Transit Hub
                                    </span>
                                    <p className="text-sm font-bold text-gray-800 mt-1 truncate" title={currentHub}>
                                        {currentHub}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                        Status: {latestActivity}
                                    </p>
                                </div>

                                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                        <Clock size={12} className="text-secondary" /> Expected Delivery
                                    </span>
                                    <p className="text-sm font-bold text-primary mt-1">
                                        {activeOrder.expectedDelivery 
                                            ? new Date(activeOrder.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                                            : `${activeOrder.estimatedDeliveryDays || '3-5'} Business Days`}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Destination: {activeOrder.destinationCity || 'India'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dedicated Live Current Hub & Transit Center Card */}
                        <div className="bg-gradient-to-br from-emerald-950 via-[#0a3a14] to-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-500/20">
                            {/* Background Radar Rings */}
                            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-emerald-400/10 pointer-events-none" />
                            <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full border border-emerald-400/10 pointer-events-none" />

                            <div className="relative z-10">
                                {/* Top Bar with Radar Pulse */}
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                                        </span>
                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                                            Live Courier Hub Radar
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-200/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                        <Clock size={12} className="text-emerald-400" />
                                        <span>Last Hub Scan: {formatTimestamp(latestScanTime)}</span>
                                    </div>
                                </div>

                                {/* Active Hub Details */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-widest flex items-center gap-1">
                                            <MapPin size={12} className="text-secondary" /> Active Sorting Facility / Hub
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-serif font-black text-white mt-0.5">
                                            {currentHub}
                                        </h3>
                                        <div className="text-xs text-emerald-100/90 mt-2 flex flex-wrap items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                                            <span className="font-bold text-white">{latestActivity}:</span>
                                            <span className="text-emerald-200">{latestRemarks}</span>
                                        </div>
                                    </div>

                                    <div className="sm:text-right shrink-0">
                                        <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-widest">
                                            Courier Partner
                                        </span>
                                        <p className="text-sm font-bold text-white mt-0.5 flex items-center sm:justify-end gap-1.5">
                                            <Truck size={14} className="text-secondary" />
                                            <span>{activeOrder.courierName || 'DELHIVERY SURFACE'}</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-200/80 font-mono mt-0.5">
                                            AWB: {activeOrder.waybill}
                                        </p>
                                    </div>
                                </div>

                                {/* 3-Point Visual Route Flow (Origin -> Current Hub -> Destination) */}
                                <div className="mt-6 pt-5 border-t border-white/10">
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs relative">
                                        {/* Track connecting line */}
                                        <div className="hidden sm:block absolute top-3.5 left-[18%] right-[18%] h-0.5 bg-white/20 -z-0" />

                                        {/* Origin */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-1.5 relative z-10 border border-white/40">
                                                1
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Origin Hub</span>
                                            <span className="text-[11px] text-white/90 font-medium truncate max-w-[120px]">Ahmedabad Herbarium</span>
                                        </div>

                                        {/* Current Hub */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-black mb-1.5 relative z-10 ring-4 ring-secondary/30 shadow-md">
                                                📍
                                            </div>
                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider animate-pulse">Current Hub</span>
                                            <span className="text-[11px] text-white font-bold truncate max-w-[130px]">{currentHub}</span>
                                        </div>

                                        {/* Destination */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-1.5 relative z-10 border border-white/40">
                                                3
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Destination</span>
                                            <span className="text-[11px] text-white/90 font-medium truncate max-w-[120px]">{activeOrder.destinationCity || 'Customer City'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Hub Scans & Activity Updates (Amazon / Flipkart Checkpoints) */}
                        {activeOrder.timeline && activeOrder.timeline.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} className="text-primary" />
                                        <h3 className="text-base font-serif font-bold text-primary">
                                            Transit Scans & Hub Journey ({activeOrder.timeline.length})
                                        </h3>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/5 text-primary px-3 py-1 rounded-full">
                                        Live Waybill Feed
                                    </span>
                                </div>

                                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                    {activeOrder.timeline.map((entry, idx) => {
                                        const isLatest = idx === activeOrder.timeline.length - 1;
                                        return (
                                            <div key={idx} className="relative">
                                                {/* Checkpoint Dot */}
                                                <div 
                                                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-4 border-white transition-all ${
                                                        isLatest 
                                                            ? 'bg-secondary ring-4 ring-secondary/30 scale-125' 
                                                            : 'bg-primary'
                                                    }`} 
                                                />
                                                <div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                        <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                                                            {entry.status}
                                                        </h5>
                                                        <span className="text-[11px] text-gray-400 font-mono">
                                                            {formatTimestamp(entry.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                        {entry.description}
                                                    </p>
                                                    {entry.location && (
                                                        <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 mt-1 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">
                                                            <MapPin size={11} className="text-secondary shrink-0" />
                                                            <span>{entry.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
