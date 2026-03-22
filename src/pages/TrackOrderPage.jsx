
import { useState } from 'react';
import api from '../utils/api';
import { 
    Search, Truck, Package, CheckCircle, 
    Circle, MapPin, Calendar, Clock, 
    ChevronRight, AlertCircle, Info, ArrowLeft,
    Box, ShieldCheck, MapPinned, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError('');
        setTrackingData(null);

        try {
            const { data } = await api.post(`/orders/track`, { query: orderId });
            const order = data[0]; // Get the most recent order matched
            
            setTrackingData({
                status: order.shippingStatus || 'Processing',
                waybill: order.waybill || 'Pending Allocation',
                fulfilledby: order.shippingProvider || 'Hridved Fulfillment',
                orderid: order._id,
                location: order.trackingHistory && order.trackingHistory.length > 0 ? order.trackingHistory[0].location : 'Order placed',
                lastscanned: order.trackingHistory && order.trackingHistory.length > 0 && order.trackingHistory[0].dateAndTime 
                    ? new Date(order.trackingHistory[0].dateAndTime).toLocaleString() 
                    : new Date(order.createdAt).toLocaleString(),
                remark: (order.trackingHistory && order.trackingHistory.length > 0 ? order.trackingHistory[0].remark : order.trackingStatus) || 'Awaiting update from carrier'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to locate order automatically.');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppTrack = () => {
        const WHATSAPP_NUMBER = '917990411390';
        const message = `Hello, I want to track my order. My Order ID / Phone Number is: ${orderId}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const statusSteps = [
        { label: 'Ordered', icon: <Package size={20} />, status: ['Confirmed', 'Processing', 'Ordered'] },
        { label: 'Packed', icon: <Box size={20} />, status: ['Packed', 'Ready to Ship'] },
        { label: 'In Transit', icon: <Truck size={20} />, status: ['Shipped', 'In Transit', 'Out for Delivery'] },
        { label: 'Delivered', icon: <CheckCircle size={20} />, status: ['Delivered'] },
    ];

    const getCurrentStep = () => {
        if (!trackingData) return 0;
        const currentStatus = trackingData.status || 'Processing';
        const stepIndex = statusSteps.findIndex(step => step.status.includes(currentStatus));
        // Fallback for "In Transit" sub-statuses
        if (stepIndex === -1 && (currentStatus.includes('Transit') || currentStatus.includes('Shipped'))) return 2;
        if (stepIndex === -1 && currentStatus.includes('Delivered')) return 3;
        return stepIndex === -1 ? 0 : stepIndex;
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 md:py-20 font-body">
            <div className="container mx-auto px-4 max-w-4xl">
                
                {/* Back to Home */}
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-8 group">
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Track Your Order</h1>
                    <p className="text-gray-500 max-w-md mx-auto">Enter your Order ID or Phone number to see where your Hridved journey is.</p>
                </div>

                {/* Search Card */}
                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-4 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-focus-within:opacity-10 transition-opacity">
                        <MapPinned size={120} className="text-primary rotate-12" />
                    </div>
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Order ID / Phone Number (e.g. 987654...)"
                            className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                        />
                    </div>
                    <button
                        onClick={handleTrack}
                        className="bg-primary text-white px-10 py-4 rounded-2xl hover:bg-secondary hover:text-primary flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Locating...' : <><Search size={18} /> Track Now</>}
                    </button>
                </div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-12 shadow-sm text-center md:text-left"
                        >
                            <div className="flex items-center gap-4 text-red-600">
                                <div className="bg-white p-2 rounded-full shadow-sm shadow-red-100">
                                    <AlertCircle size={20} />
                                </div>
                                <p className="font-bold text-sm tracking-wide">{error}</p>
                            </div>
                            <button
                                onClick={handleWhatsAppTrack}
                                className="bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1da851] transition-colors whitespace-nowrap"
                            >
                                <MessageCircle size={18} /> Ask on WhatsApp
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing with Logistics...</p>
                        </motion.div>
                    ) : trackingData ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Summary Card */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-2 bg-primary/5" />
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                                            <Truck size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
                                                {trackingData.status || "In Transit"}
                                            </h2>
                                            <p className="text-xs text-secondary font-black uppercase tracking-[0.2em] mt-1">Waybill: {trackingData.waybill || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto p-4 bg-gray-900 rounded-2xl flex items-center justify-between gap-10 text-white shadow-xl shadow-gray-900/20">
                                        <div className="shrink-0 text-center">
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Carrier</p>
                                            <p className="font-bold text-sm">{trackingData.fulfilledby || "Vamaship"}</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-800" />
                                        <div className="shrink-0 text-center">
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Order Ref</p>
                                            <p className="font-mono font-bold text-sm text-primary">#{trackingData.orderid?.slice(-8).toUpperCase() || "..."}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Stepper */}
                                <div className="relative pb-10">
                                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full" />
                                    <div 
                                        className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
                                    />
                                    
                                    <div className="relative flex justify-between">
                                        {statusSteps.map((step, idx) => {
                                            const isActive = idx <= getCurrentStep();
                                            const isCurrent = idx === getCurrentStep();
                                            return (
                                                <div key={idx} className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 z-10 border-4 border-white shadow-lg ${
                                                        isActive ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400'
                                                    } ${isCurrent ? 'ring-4 ring-primary/10' : ''}`}>
                                                        {isActive ? <CheckCircle size={18} /> : step.icon}
                                                    </div>
                                                    <p className={`mt-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                        isActive ? 'text-gray-900' : 'text-gray-300'
                                                    }`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Current Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                                    <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-gray-100/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <MapPin size={16} className="text-secondary" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Hub</span>
                                        </div>
                                        <p className="font-black text-gray-800 tracking-wide">{trackingData.location || "Logistics Hub"}</p>
                                    </div>
                                    <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-gray-100/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock size={16} className="text-secondary" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Activity</span>
                                        </div>
                                        <p className="font-black text-gray-800 tracking-wide">{trackingData.lastscanned || "Awaiting Scan"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <Info className="text-primary" size={24} /> Journey Details
                                </h3>
                                
                                {trackingData.remark ? (
                                    <div className="space-y-6">
                                        <div className="relative pl-8 border-l-2 border-primary/20 pb-2">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md shadow-primary/20" />
                                            <p className="text-sm font-black text-gray-900 mb-1">{trackingData.status || 'Active Update'}</p>
                                            <p className="text-sm text-gray-600 font-medium italic">"{trackingData.remark}"</p>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                <Calendar size={12} />
                                                <span>{trackingData.lastscanned || 'Just Now'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Static milestones to fill UI if history is empty */}
                                        <div className="relative pl-8 border-l-2 border-gray-100 opacity-50">
                                            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-gray-200 border-2 border-white" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pick up scheduled</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">System Generated</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-300 italic">No detailed activity logs available yet.</div>
                                )}
                            </div>

                            {/* Support Footnote */}
                            <div className="text-center pt-4">
                                <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                                    <ShieldCheck size={14} /> 
                                    Protected by Hridved Logistics Security. Issues? <Link to="/contact" className="text-primary font-bold hover:underline">Contact Support</Link>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-primary/5 rounded-[3rem] p-16 text-center border-2 border-dashed border-primary/10"
                        >
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                                <Box size={40} className="text-primary/20" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-primary mb-2">Awaiting Input</h3>
                            <p className="text-gray-500 text-sm font-medium">Tracking numbers can be found in your order confirmation email.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TrackOrderPage;
