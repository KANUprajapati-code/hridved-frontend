
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    User, Package, LogOut, MapPin, AlertCircle, Mail, Phone, 
    Home, Building2, Globe, Lock, Stethoscope, Video, 
    Calendar, Clock, ChevronRight, LayoutDashboard, 
    Settings, ShoppingBag, CreditCard, Bell, Heart,
    Truck, CheckCircle2, Box, Navigation, Copy, Check,
    AlertTriangle, MessageCircle, ExternalLink, RefreshCw, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');

    // Profile State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [avatar, setAvatar] = useState('');
    const [uploading, setUploading] = useState(false);

    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Data State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingConsultations] = useState(true);

    // Tracking State (Temporary inside profile)
    const [trackingOrderId, setTrackingOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setCity(user.city || '');
            setPostalCode(user.postalCode || '');
            setCountry(user.country || '');
            setAvatar(user.avatar || '');
            fetchOrders();
            fetchConsultations();
        }
    }, [navigate, user]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
            setLoadingOrders(false);
        } catch (error) {
            console.error(error);
            setLoadingOrders(false);
        }
    };

    const fetchConsultations = async () => {
        try {
            const { data } = await api.get('/doctor-bookings');
            setConsultations(data);
            setLoadingConsultations(false);
        } catch (error) {
            console.error(error);
            setLoadingConsultations(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await api.post('/upload', formData, config);
            setAvatar(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (password && password !== confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            return;
        }

        try {
            await updateProfile({
                id: user._id,
                name,
                email,
                password,
                phone,
                address,
                city,
                postalCode,
                country,
                avatar
            });
            setMessage('Profile updated successfully');
            setMessageType('success');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Update failed');
            setMessageType('error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleTrackOrder = async (orderId, waybill = '') => {
        setActiveTab('tracking');
        setTrackingOrderId(waybill || orderId);
        setLoadingTracking(true);
        setTrackingError('');
        setTrackingData(null);

        try {
            const identifier = waybill || orderId;
            const { data } = await api.get(`/shipping/track/${identifier}`);
            setTrackingData(data);
        } catch (err) {
            setTrackingError(err.response?.data?.message || 'Tracking information not found.');
        } finally {
            setLoadingTracking(false);
        }
    };

    const handleManualTrack = (e) => {
        e.preventDefault();
        if (trackingOrderId) {
            handleTrackOrder('', trackingOrderId);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={20} /> },
        { id: 'consultations', label: 'Consultations', icon: <Stethoscope size={20} /> },
        { id: 'tracking', label: 'Track Shipment', icon: <MapPin size={20} /> },
        { id: 'settings', label: 'Account Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">My Account</h1>
                    <p className="text-gray-500">Welcome back, {name || 'User'}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden sticky top-24">
                            {/* User Intro */}
                            <div className="p-8 pb-4 text-center border-b border-gray-50">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-xl overflow-hidden group">
                                        {avatar ? (
                                            <img src={avatar} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-serif font-bold">
                                                {name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                        <Settings size={14} className="text-gray-500" />
                                        <input type="file" id="avatar-upload" className="hidden" onChange={uploadFileHandler} />
                                    </label>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h2>
                                <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Premium Member</p>
                            </div>

                            {/* Nav List */}
                            <nav className="p-4">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group mb-1 ${
                                            activeTab === item.id 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary'} transition-colors`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 translate-x--2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                                    </button>
                                ))}

                                <Link
                                    to="/wishlist"
                                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 text-gray-500 hover:bg-gray-50 hover:text-primary mb-1 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Heart size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                                        <span className="font-bold text-sm tracking-wide">My Wishlist</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {wishlistCount > 0 && (
                                            <span className="bg-secondary text-primary font-bold text-xs px-2 py-0.5 rounded-full">
                                                {wishlistCount}
                                            </span>
                                        )}
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                                
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Section */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeTab === 'dashboard' && <Dashboard orders={orders} consultations={consultations} name={name} wishlistCount={wishlistCount} />}
                                {activeTab === 'orders' && <OrdersList orders={orders} loading={loadingOrders} onTrack={handleTrackOrder} isAdmin={user?.isAdmin} />}
                                {activeTab === 'consultations' && <ConsultationsList consultations={consultations} loading={loadingConsultations} />}
                                {activeTab === 'tracking' && (
                                    <TrackingView 
                                        orderId={trackingOrderId} 
                                        setOrderId={setTrackingOrderId} 
                                        data={trackingData} 
                                        loading={loadingTracking} 
                                        error={trackingError} 
                                        onTrack={handleManualTrack} 
                                    />
                                )}
                                {activeTab === 'settings' && (
                                    <SettingsForm 
                                        formData={{ name, email, phone, postalCode, country, city, address, password, confirmPassword }}
                                        setters={{ setName, setEmail, setPhone, setPostalCode, setCountry, setCity, setAddress, setPassword, setConfirmPassword }}
                                        onSubmit={handleProfileUpdate}
                                        message={message}
                                        messageType={messageType}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner code
const Dashboard = ({ orders, consultations, name, wishlistCount = 0 }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<ShoppingBag className="text-primary" />} label="Orders Placed" value={orders.length} color="bg-primary/5" />
            <StatCard icon={<Stethoscope className="text-secondary" />} label="Consultations" value={consultations.length} color="bg-secondary/5" />
            <Link to="/wishlist" className="block transition-transform hover:-translate-y-0.5">
                <StatCard icon={<Heart className="text-red-500" />} label="Saved Items" value={wishlistCount} color="bg-rose-50" />
            </Link>
            <StatCard icon={<Bell className="text-blue-500" />} label="Notifications" value="0" color="bg-blue-50" />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Recent Activity</h3>
            {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">No recent activity found.</div>
            ) : (
                <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Package size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const StatCard = ({ icon, label, value, color }) => (
    <div className={`p-8 rounded-3xl ${color} border border-white shadow-xl shadow-gray-200/20`}>
        <div className="bg-white p-3 rounded-2xl w-fit shadow-md mb-4">{icon}</div>
        <p className="text-3xl font-serif font-black text-gray-900">{value}</p>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

const OrdersList = ({ orders, loading, onTrack, isAdmin }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8">My Orders</h2>
        {loading ? (
            <SkeletonLoader />
        ) : orders.length === 0 ? (
            <EmptyState icon={<Package size={32} />} message="You haven't placed any orders yet." link="/shop" linkText="Start Shopping" />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map(order => (
                    <div key={order._id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-gray-900 font-mono tracking-tighter">ORDER #{order._id.slice(-6).toUpperCase()}</h4>
                                <p className="text-xs text-secondary font-bold uppercase tracking-tight">{new Date(order.createdAt).toDateString()}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="relative group/img">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-white" />
                                    <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {item.qty}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                                <p className="text-lg font-serif font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <Link to={`/order/${order._id}`} className="p-2.5 bg-white text-gray-400 hover:text-primary rounded-xl border border-gray-100 hover:border-primary/20 transition-all shadow-sm">
                                        <ChevronRight size={18} />
                                    </Link>
                                )}
                                <button 
                                    onClick={() => onTrack(order._id, order.waybill || order.trackingId)}
                                    className="bg-primary hover:bg-secondary text-white hover:text-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    Track
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const ConsultationsList = ({ consultations, loading }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-body">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8">My Consultations</h2>
        {loading ? (
            <SkeletonLoader />
        ) : consultations.length === 0 ? (
            <EmptyState icon={<Stethoscope size={32} />} message="No consultations booked yet." link="/contact" linkText="Contact Us" />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consultations.map(booking => (
                    <div key={booking._id} className="p-6 rounded-3xl border border-gray-50 bg-[#FDFBF7] hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <Stethoscope size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{booking.doctorName}</h4>
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Confirmed</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                <Calendar size={16} className="text-gray-400" />
                                <span>{new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                <Clock size={16} className="text-gray-400" />
                                <span>{booking.appointmentTime} IST</span>
                            </div>
                        </div>

                        {booking.googleMeetLink && (
                            <a 
                                href={booking.googleMeetLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                <Video size={18} />
                                Join Consultation
                            </a>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const TrackingView = ({ orderId, setOrderId, data, loading, error, onTrack }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const steps = [
        { label: 'Order Confirmed', desc: 'Manifested & Verified', icon: <Package size={16} /> },
        { label: 'Packed & Ready', desc: 'Formulated & Boxed', icon: <Box size={16} /> },
        { label: 'Shipped & In Transit', desc: 'Courier Hub Movement', icon: <Truck size={16} /> },
        { label: 'Out for Delivery', desc: 'With Delivery Agent', icon: <Navigation size={16} /> },
        { label: 'Delivered', desc: 'Delivered to Doorstep', icon: <CheckCircle2 size={16} /> },
    ];

    const currentStep = data?.currentStep !== undefined ? Math.min(Math.max(data.currentStep, 0), 4) : 0;
    const isDelivered = currentStep === 4 || data?.isDelivered;
    const isNDR = String(data?.statusCode) === '110';

    const formatTime = (ts) => {
        if (!ts) return '';
        try {
            return new Date(ts).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return String(ts);
        }
    };

    const handleWhatsApp = () => {
        const ref = data?.orderId ? `#${String(data.orderId).slice(-8).toUpperCase()}` : (orderId || '');
        const awb = data?.waybill || '';
        const msg = `Namaste Hridved Support, I am tracking Order ${ref} (AWB: ${awb}). Could you please share the current dispatch status?`;
        window.open(`https://wa.me/917990934095?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">Live Shipment Tracker</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time carrier updates powered by Wayuvega Logistics</p>
                </div>
                <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 text-xs font-bold transition-colors"
                >
                    <MessageCircle size={15} className="text-[#25D366]" />
                    <span>WhatsApp Support</span>
                </button>
            </div>

            {/* Tracking Search Input */}
            <form onSubmit={onTrack} className="flex gap-3 mb-8">
                <div className="flex-1 relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Enter Order ID or Waybill Number (AWB)" 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-bold text-sm text-gray-800"
                    />
                </div>
                <button 
                    disabled={loading || !orderId?.trim()}
                    className="bg-primary hover:bg-[#07470a] text-white px-7 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Locating...</span>
                        </>
                    ) : (
                        <span>Track Live</span>
                    )}
                </button>
            </form>

            {/* Error Banner */}
            {error && (
                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 text-red-700 flex items-center gap-3 mb-6 animate-fade-in text-xs font-bold">
                    <AlertCircle className="shrink-0 text-red-600" size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* NDR Alert Banner */}
            {isNDR && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3 mb-6">
                    <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
                    <div className="text-xs">
                        <p className="font-bold">Delivery Reattempt Scheduled</p>
                        <p className="mt-0.5 text-amber-800">The courier partner reported consignee unavailable. A delivery reattempt is automatically scheduled.</p>
                    </div>
                </div>
            )}

            {/* Tracking Result Card */}
            {data ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Status Highlights Banner */}
                    <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 rounded-3xl p-6 border border-primary/10 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDelivered ? 'bg-emerald-400' : 'bg-secondary'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isDelivered ? 'bg-emerald-500' : 'bg-secondary'}`}></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                                        {isDelivered ? 'Delivered' : 'Live Status'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-serif font-black text-gray-900">
                                    {data.trackingStatus || data.shippingStatus || 'In Transit'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Order #{String(data.orderId || orderId).slice(-8).toUpperCase()}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {data.waybill && (
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(data.waybill)}
                                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                        title="Click to copy AWB"
                                    >
                                        <span>AWB: {data.waybill}</span>
                                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-gray-400" />}
                                    </button>
                                )}
                                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                                    {data.courierName || 'DELHIVERY SURFACE'}
                                </span>
                            </div>
                        </div>

                        {/* 5-Step Visual Stepper (Amazon / Meesho / Flipkart) */}
                        <div className="py-6">
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0">
                                    <div 
                                        className="h-full bg-primary transition-all duration-700 ease-out"
                                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                                    {steps.map((s, idx) => {
                                        const isDone = idx <= currentStep;
                                        const isCurrent = idx === currentStep;

                                        return (
                                            <div key={idx} className="flex flex-col items-center text-center">
                                                <div 
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                        isDone 
                                                            ? 'bg-primary text-white shadow-md' 
                                                            : 'bg-gray-100 text-gray-400'
                                                    } ${isCurrent ? 'ring-4 ring-secondary/40 scale-105' : ''}`}
                                                >
                                                    {isDone && idx < currentStep ? <CheckCircle2 size={16} /> : s.icon}
                                                </div>
                                                <h5 className={`text-[11px] font-bold mt-2 ${isDone ? 'text-gray-900 font-extrabold' : 'text-gray-400'}`}>
                                                    {s.label}
                                                </h5>
                                                <p className="text-[9px] text-gray-400 line-clamp-1 mt-0.5">
                                                    {s.desc}
                                                </p>
                                                {isCurrent && (
                                                    <span className="mt-1 px-1.5 py-0.2 bg-secondary/20 text-primary text-[8px] font-black uppercase rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs">
                            <div className="bg-white/80 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                    <MapPin size={11} className="text-secondary" /> Current Hub
                                </span>
                                <p className="font-bold text-gray-800 mt-0.5 truncate">
                                    {data.location || 'Central Sorting Hub'}
                                </p>
                            </div>

                            <div className="bg-white/80 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={11} className="text-secondary" /> Expected Delivery
                                </span>
                                <p className="font-bold text-primary mt-0.5">
                                    {data.expectedDelivery 
                                        ? new Date(data.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                                        : `${data.expectedDeliveryDays || '3-5'} Days`}
                                </p>
                            </div>

                            <div className="bg-white/80 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                    <Truck size={11} className="text-secondary" /> Destination
                                </span>
                                <p className="font-bold text-gray-800 mt-0.5">
                                    {data.destinationCity || 'India'} {data.destinationPincodeMasked ? `(${data.destinationPincodeMasked})` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Checkpoints (Amazon/Flipkart Hub Scan Feed) */}
                    {data.timeline && data.timeline.length > 0 && (
                        <div className="bg-gray-50/60 rounded-3xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/60">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" />
                                    <span>Carrier Scan History ({data.timeline.length} updates)</span>
                                </h4>
                                <span className="text-[10px] font-mono font-bold text-gray-400">
                                    Updated Just Now
                                </span>
                            </div>

                            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                {data.timeline.map((entry, idx) => {
                                    const isLatest = idx === data.timeline.length - 1;
                                    return (
                                        <div key={idx} className="relative">
                                            <div 
                                                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${
                                                    isLatest ? 'bg-secondary ring-2 ring-secondary/40' : 'bg-primary'
                                                }`} 
                                            />
                                            <div>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-xs font-bold text-gray-900">{entry.status}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{formatTime(entry.timestamp)}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-0.5">{entry.description}</p>
                                                {entry.location && (
                                                    <span className="inline-block text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 mt-1">
                                                        📍 {entry.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Order Items Preview */}
                    {data.orderItems && data.orderItems.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                Items in Shipment ({data.orderItems.length})
                            </h5>
                            <div className="space-y-2">
                                {data.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1608248597359-2e061807353f?auto=format&fit=crop&q=80&w=200';
                                                }}
                                            />
                                            <span className="font-bold text-gray-800 line-clamp-1">{item.name}</span>
                                        </div>
                                        <span className="text-gray-500 font-mono font-bold shrink-0">Qty: {item.qty}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : !loading && (
                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-gray-100">
                        <Truck size={28} className="text-gray-300" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700">Enter a Tracking Number or Select an Order</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Go to "My Orders" and click "Track" on any order to see live courier scans and milestone updates.
                    </p>
                </div>
            )}
        </div>
    );
};


const SettingsForm = ({ formData, setters, onSubmit, message, messageType }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8">Account Settings</h2>
        
        {message && (
            <div className={`p-5 rounded-2xl mb-8 flex items-center gap-3 animate-fade-in ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${messageType === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <p className="font-bold text-sm tracking-wide">{message}</p>
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-10">
            {/* Sections */}
            <FormSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Full Name" value={formData.name} onChange={e => setters.setName(e.target.value)} icon={<User size={16} />} />
                    <FormInput label="Email Address" value={formData.email} onChange={e => setters.setEmail(e.target.value)} icon={<Mail size={16} />} />
                    <FormInput label="Mobile Number" value={formData.phone} onChange={e => setters.setPhone(e.target.value)} icon={<Phone size={16} />} />
                </div>
            </FormSection>

            <FormSection title="Shipping Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Pincode" value={formData.postalCode} onChange={e => setters.setPostalCode(e.target.value)} icon={<MapPin size={16} />} />
                    <FormInput label="City" value={formData.city} onChange={e => setters.setCity(e.target.value)} icon={<Building2 size={16} />} />
                    <FormInput label="House No / Street / Landmark" value={formData.address} onChange={e => setters.setAddress(e.target.value)} icon={<Home size={16} />} containerClass="md:col-span-2" />
                </div>
            </FormSection>

            <FormSection title="Security & Password">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="New Password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setters.setPassword(e.target.value)} icon={<Lock size={16} />} helper="Leave empty if you don't want to change" />
                    <FormInput label="Confirm New Password" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setters.setConfirmPassword(e.target.value)} icon={<Lock size={16} />} />
                </div>
            </FormSection>

            <div className="flex justify-end pt-6">
                <button type="submit" className="bg-primary text-white hover:bg-secondary hover:text-primary px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all duration-300 active:scale-95 leading-none">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
);

// Atomic UI Components
const FormSection = ({ title, children }) => (
    <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] border-l-4 border-primary pl-4">{title}</h3>
        {children}
    </div>
);

const FormInput = ({ label, icon, containerClass = '', helper = '', ...props }) => (
    <div className={`space-y-2 ${containerClass}`}>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors pointer-events-none">
                {icon}
            </div>
            <input 
                {...props} 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm text-gray-900" 
            />
        </div>
        {helper && <p className="text-[10px] text-gray-400 italic ml-1">{helper}</p>}
    </div>
);

const TrackingRow = ({ label, value, italic = false }) => (
    <div className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-bold text-gray-900 ${italic ? 'italic font-medium text-gray-600' : ''}`}>{value}</span>
    </div>
);

const EmptyState = ({ icon, message, link, linkText }) => (
    <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50 text-gray-200">
            {icon && icon}
        </div>
        <p className="text-gray-500 font-bold mb-4">{message}</p>
        <Link to={link || '/'} className="inline-block bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95">
            {linkText}
        </Link>
    </div>
);

const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl w-full" />)}
    </div>
);

export default ProfilePage;
