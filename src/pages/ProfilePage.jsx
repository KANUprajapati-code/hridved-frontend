import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { 
    User, Package, LogOut, MapPin, AlertCircle, Mail, Phone, 
    Home, Building2, Globe, Lock, Stethoscope, Video, 
    Calendar, Clock, ChevronRight, LayoutDashboard, 
    Settings, ShoppingBag, CreditCard, Bell, Heart,
    Truck, CheckCircle2, Box, Navigation, Copy, Check,
    AlertTriangle, MessageCircle, ExternalLink, RefreshCw, Sparkles,
    Plus, Trash2, ShieldCheck, CheckSquare, Square, Smartphone,
    CheckCheck, Tag, Info, ArrowRight, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');

    // Profile Settings State
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

    // Orders & Consultations State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingConsultations] = useState(true);

    // Addresses State (Prompt 10 CRUD)
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [addressMessage, setAddressMessage] = useState(null);

    // Communication Preferences State (Prompt 10)
    const [communicationPrefs, setCommunicationPrefs] = useState({
        transactional: true,
        marketingWhatsApp: false,
        marketingEmail: false,
        marketingSms: false,
        consentTimestamp: null,
    });
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [prefSuccess, setPrefSuccess] = useState(false);

    // Tracking State
    const [trackingOrderId, setTrackingOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setCity(user.city || '');
            setPostalCode(user.postalCode || '');
            setCountry(user.country || '');
            setAvatar(user.avatar || '');

            if (user.communicationPreferences) {
                setCommunicationPrefs({
                    transactional: true,
                    marketingWhatsApp: Boolean(user.communicationPreferences.marketingWhatsApp),
                    marketingEmail: Boolean(user.communicationPreferences.marketingEmail),
                    marketingSms: Boolean(user.communicationPreferences.marketingSms),
                    consentTimestamp: user.communicationPreferences.consentTimestamp || null,
                });
            }

            fetchOrders();
            fetchConsultations();
            fetchAddresses();
        }
    }, [navigate, user]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(Array.isArray(data) ? data : []);
            setLoadingOrders(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoadingOrders(false);
        }
    };

    const fetchConsultations = async () => {
        try {
            const { data } = await api.get('/doctor-bookings');
            setConsultations(Array.isArray(data) ? data : []);
            setLoadingConsultations(false);
        } catch (error) {
            console.error('Error fetching consultations:', error);
            setLoadingConsultations(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const { data } = await api.get('/addresses');
            setAddresses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
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

    const handleSaveCommunicationPreferences = async (newPrefs) => {
        setSavingPrefs(true);
        setPrefSuccess(false);
        try {
            const payload = {
                communicationPreferences: {
                    transactional: true,
                    marketingWhatsApp: Boolean(newPrefs.marketingWhatsApp),
                    marketingEmail: Boolean(newPrefs.marketingEmail),
                    marketingSms: Boolean(newPrefs.marketingSms),
                }
            };
            const updated = await updateProfile(payload);
            setCommunicationPrefs(prev => ({
                ...prev,
                ...payload.communicationPreferences,
                consentTimestamp: new Date().toISOString(),
            }));
            setPrefSuccess(true);
            setTimeout(() => setPrefSuccess(false), 4000);
        } catch (err) {
            console.error('Failed to update communication preferences:', err);
            alert(err.response?.data?.message || 'Could not save preferences');
        } finally {
            setSavingPrefs(false);
        }
    };

    const handleCreateAddress = async (addressData) => {
        try {
            await api.post('/addresses', addressData);
            await fetchAddresses();
            setAddressMessage({ type: 'success', text: 'Address added successfully!' });
            setTimeout(() => setAddressMessage(null), 3500);
            return true;
        } catch (err) {
            setAddressMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save address' });
            return false;
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await api.put(`/addresses/${addressId}/default`);
            await fetchAddresses();
            setAddressMessage({ type: 'success', text: 'Default address updated!' });
            setTimeout(() => setAddressMessage(null), 3000);
        } catch (err) {
            setAddressMessage({ type: 'error', text: err.response?.data?.message || 'Failed to set default' });
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to remove this address?')) return;
        try {
            await api.delete(`/addresses/${addressId}`);
            await fetchAddresses();
            setAddressMessage({ type: 'success', text: 'Address deleted.' });
            setTimeout(() => setAddressMessage(null), 3000);
        } catch (err) {
            setAddressMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete address' });
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
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={20} />, badge: orders.length > 0 ? orders.length : null },
        { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={20} />, badge: addresses.length > 0 ? addresses.length : null },
        { id: 'wishlist', label: 'My Wishlist', icon: <Heart size={20} />, badge: wishlistCount > 0 ? wishlistCount : null },
        { id: 'consultations', label: 'Consultations', icon: <Stethoscope size={20} />, badge: consultations.length > 0 ? consultations.length : null },
        { id: 'tracking', label: 'Track Shipment', icon: <Truck size={20} /> },
        { id: 'preferences', label: 'Communication Preferences', icon: <ShieldCheck size={20} /> },
        { id: 'settings', label: 'Account Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">My Account</h1>
                        <p className="text-gray-500 text-sm">
                            Welcome back, <span className="font-bold text-gray-800">{name || 'Customer'}</span>
                            {phone && <span className="ml-2 font-mono text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">+91 {phone}</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-2 bg-primary hover:bg-[#07470a] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                        >
                            <ShoppingBag size={14} />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden sticky top-24">
                            {/* User Intro */}
                            <div className="p-8 pb-5 text-center border-b border-gray-50">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-xl overflow-hidden group">
                                        {avatar ? (
                                            <img src={avatar} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-serif font-bold">
                                                {name?.charAt(0).toUpperCase() || 'H'}
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" title="Change Avatar">
                                        <Settings size={14} className="text-gray-500" />
                                        <input type="file" id="avatar-upload" className="hidden" onChange={uploadFileHandler} />
                                    </label>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{name || 'Customer'}</h2>
                                <p className="text-xs text-gray-500 line-clamp-1">{email}</p>
                                <span className="inline-block text-[10px] bg-secondary/20 text-primary font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-2">
                                    {user?.isAdmin ? 'Administrator' : 'Ayurvedic Wellness Member'}
                                </span>
                            </div>

                            {/* Nav List */}
                            <nav className="p-3 space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                                            activeTab === item.id 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <span className={`${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary'} transition-colors shrink-0`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-bold text-xs tracking-wide truncate">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {item.badge !== null && item.badge !== undefined && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            <ChevronRight size={14} className={`transition-transform ${activeTab === item.id ? 'opacity-100' : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'}`} />
                                        </div>
                                    </button>
                                ))}
                                
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-red-600 font-bold text-xs hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
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
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeTab === 'dashboard' && (
                                    <Dashboard 
                                        orders={orders} 
                                        consultations={consultations} 
                                        addressesCount={addresses.length}
                                        name={name} 
                                        wishlistCount={wishlistCount} 
                                        onNavigate={setActiveTab}
                                        onTrack={handleTrackOrder}
                                    />
                                )}
                                {activeTab === 'orders' && (
                                    <OrdersList 
                                        orders={orders} 
                                        loading={loadingOrders} 
                                        onTrack={handleTrackOrder} 
                                    />
                                )}
                                {activeTab === 'addresses' && (
                                    <AddressesView 
                                        addresses={addresses}
                                        loading={loadingAddresses}
                                        onCreate={handleCreateAddress}
                                        onSetDefault={handleSetDefaultAddress}
                                        onDelete={handleDeleteAddress}
                                        message={addressMessage}
                                    />
                                )}
                                {activeTab === 'wishlist' && (
                                    <WishlistView 
                                        wishlist={wishlist}
                                        onRemove={removeFromWishlist}
                                        onAddToCart={addToCart}
                                    />
                                )}
                                {activeTab === 'consultations' && (
                                    <ConsultationsList 
                                        consultations={consultations} 
                                        loading={loadingConsultations} 
                                    />
                                )}
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
                                {activeTab === 'preferences' && (
                                    <PreferencesView 
                                        preferences={communicationPrefs}
                                        onSave={handleSaveCommunicationPreferences}
                                        saving={savingPrefs}
                                        success={prefSuccess}
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

// ================= DASHBOARD TAB =================
const Dashboard = ({ orders, consultations, addressesCount, name, wishlistCount = 0, onNavigate, onTrack }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <button onClick={() => onNavigate('orders')} className="text-left">
                <StatCard icon={<ShoppingBag className="text-primary" size={24} />} label="Total Orders" value={orders.length} color="bg-primary/5 hover:border-primary/30" />
            </button>
            <button onClick={() => onNavigate('addresses')} className="text-left">
                <StatCard icon={<MapPin className="text-emerald-600" size={24} />} label="Saved Addresses" value={addressesCount} color="bg-emerald-50/70 hover:border-emerald-300" />
            </button>
            <button onClick={() => onNavigate('wishlist')} className="text-left">
                <StatCard icon={<Heart className="text-red-500" size={24} />} label="Saved Items" value={wishlistCount} color="bg-rose-50/80 hover:border-rose-300" />
            </button>
            <button onClick={() => onNavigate('consultations')} className="text-left">
                <StatCard icon={<Stethoscope className="text-secondary" size={24} />} label="Consultations" value={consultations.length} color="bg-secondary/10 hover:border-secondary/40" />
            </button>
        </div>

        {/* Quick Tracking & Communication Preference Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#053807] to-[#0a4d0d] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5 mb-2">
                        <Truck size={14} className="text-secondary" /> Wayuvega Express Tracker
                    </span>
                    <h3 className="text-xl font-serif font-black">Track Any Active Order</h3>
                    <p className="text-xs text-emerald-100/90 mt-1 max-w-sm">
                        Enter your Order ID or Courier Waybill (AWB) to view live sorting hub scans.
                    </p>
                </div>
                <div className="mt-5 relative z-10">
                    <button 
                        onClick={() => onNavigate('tracking')} 
                        className="bg-secondary hover:bg-secondary/90 text-primary font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-1.5"
                    >
                        <span>Open Live Tracker</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
                        <ShieldCheck size={14} className="text-primary" /> Privacy & Notifications
                    </span>
                    <h3 className="text-xl font-serif font-black text-gray-900">Communication Preferences</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Control your marketing consent for WhatsApp broadcasts, email newsletters, and SMS alerts.
                    </p>
                </div>
                <div className="mt-5">
                    <button 
                        onClick={() => onNavigate('preferences')} 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                    >
                        <span>Manage Preferences</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-gray-900">Recent Orders</h3>
                {orders.length > 0 && (
                    <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <span>View All ({orders.length})</span>
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>
            {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">No recent orders found.</div>
            ) : (
                <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                        <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/80 rounded-2xl hover:bg-gray-100/60 transition-colors gap-3">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                                    <Package size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • ₹{order.totalPrice?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {order.isDelivered ? 'Delivered' : (order.orderStatus || 'Processing')}
                                </span>
                                <button
                                    onClick={() => onTrack(order._id, order.waybill || order.trackingId)}
                                    className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Track
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const StatCard = ({ icon, label, value, color }) => (
    <div className={`p-6 sm:p-7 rounded-3xl ${color} border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer`}>
        <div className="bg-white p-3 rounded-2xl w-fit shadow-sm mb-3 border border-gray-100/60">{icon}</div>
        <p className="text-2xl sm:text-3xl font-serif font-black text-gray-900">{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">{label}</p>
    </div>
);

// ================= ORDERS LIST TAB =================
const OrdersList = ({ orders, loading, onTrack }) => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
                <h2 className="text-2xl font-serif font-bold text-primary">My Orders</h2>
                <p className="text-xs text-gray-500 mt-0.5">Review previous orders, check delivery progress, or download tax invoices.</p>
            </div>
            <span className="text-xs font-bold font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {orders.length} Order{orders.length === 1 ? '' : 's'}
            </span>
        </div>

        {loading ? (
            <SkeletonLoader />
        ) : orders.length === 0 ? (
            <EmptyState icon={<Package size={32} />} message="You haven't placed any orders yet." link="/shop" linkText="Start Shopping" />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map(order => (
                    <div key={order._id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/20 transition-all duration-300 group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-gray-900 font-mono tracking-tight text-sm">ORDER #{order._id.slice(-8).toUpperCase()}</h4>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                    {order.orderStatus && (
                                        <span className="text-[9px] font-bold text-secondary uppercase tracking-tight">
                                            {order.orderStatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="relative group/img" title={item.name}>
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-white" 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1608248597359-2e061807353f?auto=format&fit=crop&q=80&w=200';
                                            }}
                                        />
                                        <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                            {item.qty}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                                <p className="text-base font-serif font-black text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link 
                                    to={`/order/${order._id}`} 
                                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 hover:text-primary rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                    title="View Invoice & Items Breakdown"
                                >
                                    <Eye size={13} />
                                    <span>Details</span>
                                </Link>
                                <button 
                                    onClick={() => onTrack(order._id, order.waybill || order.trackingId)}
                                    className="bg-primary hover:bg-[#07470a] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                >
                                    <Truck size={13} />
                                    <span>Track</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ================= SAVED ADDRESSES TAB (Prompt 10 CRUD) =================
const AddressesView = ({ addresses, loading, onCreate, onSetDefault, onDelete, message }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        state: '',
        city: '',
        houseNumber: '',
        landmark: '',
        addressType: 'Home',
    });
    const [submitting, setSubmitting] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeStatus, setPincodeStatus] = useState('');

    const handlePincodeChange = async (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pincode: clean }));
        setPincodeStatus('');

        if (clean.length === 6) {
            setPincodeLoading(true);
            try {
                const resp = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
                const data = await resp.json();
                if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
                    const po = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: po.District || po.Division || prev.city,
                        state: po.State || prev.state,
                    }));
                    setPincodeStatus(`Verified: ${po.District}, ${po.State}`);
                } else {
                    setPincodeStatus('Pincode verified');
                }
            } catch (err) {
                console.warn('Pincode lookup error:', err);
            } finally {
                setPincodeLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.mobileNumber || !formData.pincode || !formData.houseNumber || !formData.city || !formData.state) {
            alert('Please fill all required fields');
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        if (formData.pincode.length !== 6) {
            alert('Please enter a 6-digit Indian Pincode');
            return;
        }

        setSubmitting(true);
        const ok = await onCreate(formData);
        setSubmitting(false);
        if (ok) {
            setFormData({
                fullName: '',
                mobileNumber: '',
                pincode: '',
                state: '',
                city: '',
                houseNumber: '',
                landmark: '',
                addressType: 'Home',
            });
            setShowAddForm(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">Saved Addresses</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage delivery addresses for seamless 1-click Ayurvedic checkouts.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-[#07470a] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                    <Plus size={16} />
                    <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <CheckCircle2 size={16} className={message.type === 'success' ? 'text-emerald-600' : 'text-red-500'} />
                    <span>{message.text}</span>
                </div>
            )}

            {/* Add Address Form */}
            {showAddForm && (
                <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-200 mb-8 animate-fade-in">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>Add New Delivery Address</span>
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Recipient Full Name"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">10-Digit Mobile Number *</label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    placeholder="e.g. 9876543210"
                                    value={formData.mobileNumber}
                                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Pincode (6-digit) *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="e.g. 383325"
                                        value={formData.pincode}
                                        onChange={e => handlePincodeChange(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-mono"
                                    />
                                    {pincodeLoading && (
                                        <RefreshCw size={14} className="animate-spin absolute right-3 top-3 text-primary" />
                                    )}
                                </div>
                                {pincodeStatus && (
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1">{pincodeStatus}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">City / District *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">State *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Flat / House No., Building, Street *</label>
                            <input
                                type="text"
                                required
                                placeholder="House / Flat / Street address"
                                value={formData.houseNumber}
                                onChange={e => setFormData({ ...formData, houseNumber: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Landmark (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Near temple, opposite park, etc."
                                    value={formData.landmark}
                                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Address Type</label>
                                <div className="flex gap-3 pt-1">
                                    {['Home', 'Office'].map((type) => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setFormData({ ...formData, addressType: type })}
                                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                formData.addressType === type
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {type === 'Home' ? <Home size={13} /> : <Building2 size={13} />}
                                            <span>{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-primary hover:bg-[#07470a] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? <RefreshCw size={13} className="animate-spin" /> : null}
                                <span>Save Address</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses Grid */}
            {loading ? (
                <SkeletonLoader />
            ) : addresses.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-700">No saved addresses yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your shipping address for fast express deliveries.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div 
                            key={addr._id} 
                            className={`p-5 rounded-2xl border transition-all ${
                                addr.isDefault 
                                    ? 'bg-emerald-50/30 border-emerald-300 shadow-sm' 
                                    : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                        {addr.addressType === 'Office' ? <Building2 size={14} /> : <Home size={14} />}
                                    </span>
                                    <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {addr.addressType || 'Home'}
                                    </span>
                                </div>
                                {addr.isDefault && (
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                                        Default
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed mt-2">
                                {addr.houseNumber}
                                {addr.landmark && `, near ${addr.landmark}`}
                            </p>
                            <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                Mobile: +91 {addr.mobileNumber}
                            </p>

                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs font-bold">
                                {!addr.isDefault ? (
                                    <button
                                        onClick={() => onSetDefault(addr._id)}
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Check size={13} />
                                        <span>Set as Default</span>
                                    </button>
                                ) : (
                                    <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                                        <CheckCheck size={14} />
                                        <span>Primary Address</span>
                                    </span>
                                )}
                                <button
                                    onClick={() => onDelete(addr._id)}
                                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Address"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ================= WISHLIST PREVIEW TAB =================
const WishlistView = ({ wishlist = [], onRemove, onAddToCart }) => {
    const [addedIds, setAddedIds] = useState([]);

    const handleAdd = (product) => {
        onAddToCart(product, 1);
        setAddedIds(prev => [...prev, product._id]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== product._id));
        }, 2000);
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">Saved Wishlist</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your hand-picked Ayurvedic formulations and herbal remedies.</p>
                </div>
                <Link
                    to="/wishlist"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                    <span>Open Full Wishlist Page</span>
                    <ExternalLink size={13} />
                </Link>
            </div>

            {wishlist.length === 0 ? (
                <EmptyState icon={<Heart size={32} />} message="Your wishlist is empty." link="/shop" linkText="Explore Herbal Shop" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlist.map(item => {
                        const isAdded = addedIds.includes(item._id);
                        const discount = item.mrp && item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

                        return (
                            <div key={item._id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between">
                                <div>
                                    <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1608248597359-2e061807353f?auto=format&fit=crop&q=80&w=300';
                                            }}
                                        />
                                        {discount > 0 && (
                                            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                                {discount}% OFF
                                            </span>
                                        )}
                                        <button
                                            onClick={() => onRemove(item._id)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors"
                                            title="Remove from Wishlist"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    <Link to={`/product/${item._id}`} className="hover:text-primary transition-colors">
                                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                    </Link>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{item.category || 'Ayurvedic'}</p>

                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-base font-bold text-gray-900 font-serif">₹{item.price}</span>
                                        {item.mrp && item.mrp > item.price && (
                                            <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                                    <button
                                        onClick={() => handleAdd(item)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                            isAdded
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-primary hover:bg-[#07470a] text-white shadow-sm'
                                        }`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={13} />
                                                <span>Added to Cart</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag size={13} />
                                                <span>Move to Cart</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ================= COMMUNICATION PREFERENCES TAB (Prompt 10) =================
const PreferencesView = ({ preferences, onSave, saving, success }) => {
    const [prefs, setPrefs] = useState({
        transactional: true,
        marketingWhatsApp: false,
        marketingEmail: false,
        marketingSms: false,
    });

    useEffect(() => {
        if (preferences) {
            setPrefs({
                transactional: true,
                marketingWhatsApp: Boolean(preferences.marketingWhatsApp),
                marketingEmail: Boolean(preferences.marketingEmail),
                marketingSms: Boolean(preferences.marketingSms),
            });
        }
    }, [preferences]);

    const handleToggle = (key) => {
        if (key === 'transactional') return; // Always locked
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onSave(prefs);
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-2.5">
                        <ShieldCheck size={26} className="text-primary" />
                        <span>Communication Preferences</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Control how Hridved updates you regarding orders, shipments, wellness tips, and promotions.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>DPDP Compliant & Audited</span>
                </div>
            </div>

            {success && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 mb-6 animate-fade-in">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Your communication preferences have been successfully updated and timestamped!</span>
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Transactional Alerts (Always On) */}
                <div className="p-5 rounded-2xl bg-[#053807]/5 border border-primary/20 relative">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-primary text-white shrink-0 mt-0.5">
                                <Package size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-gray-900">Essential Transactional Notifications</h4>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                                        Always Active
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    Critical notifications including order receipts, GST tax invoices, OTP authentication codes, and real-time Wayuvega live delivery milestones.
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1.5 italic">
                                    * Cannot be disabled as these are required for order fulfillment and account security.
                                </p>
                            </div>
                        </div>

                        {/* Locked Switch */}
                        <div className="shrink-0 pt-1">
                            <div className="w-12 h-6 bg-primary rounded-full relative opacity-80 cursor-not-allowed flex items-center justify-end px-1 shadow-inner">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Marketing Channels */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-l-4 border-secondary pl-3">
                        Optional Marketing & Ayurvedic Wellness Insights
                    </h3>

                    {/* WhatsApp */}
                    <div 
                        onClick={() => handleToggle('marketingWhatsApp')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            prefs.marketingWhatsApp ? 'bg-emerald-50/40 border-emerald-300 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-[#25D366]/20 text-[#128C7E] shrink-0 mt-0.5">
                                <MessageCircle size={18} className="text-[#25D366]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <span>WhatsApp Updates & Offers</span>
                                    {prefs.marketingWhatsApp && (
                                        <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-[#25D366]/20 text-[#128C7E] rounded-full">
                                            Subscribed
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Receive seasonal Ayurvedic tips, dosha balancing remedies, and flash sales directly on WhatsApp.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                                prefs.marketingWhatsApp ? 'bg-[#25D366] justify-end' : 'bg-gray-300 justify-start'
                            }`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                            </div>
                        </div>
                    </div>

                    {/* Email Newsletter */}
                    <div 
                        onClick={() => handleToggle('marketingEmail')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            prefs.marketingEmail ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <span>Email Newsletter & Doctor Guides</span>
                                    {prefs.marketingEmail && (
                                        <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-primary/10 text-primary rounded-full">
                                            Subscribed
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Weekly herbal guides curated by certified Ayurvedic doctors, new formulation launches, and subscriber-only coupons.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                                prefs.marketingEmail ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
                            }`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                            </div>
                        </div>
                    </div>

                    {/* SMS */}
                    <div 
                        onClick={() => handleToggle('marketingSms')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            prefs.marketingSms ? 'bg-blue-50/60 border-blue-300 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <span>Promotional SMS Messages</span>
                                    {prefs.marketingSms && (
                                        <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-blue-100 text-blue-800 rounded-full">
                                            Subscribed
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Occasional SMS alerts for flash discounts, festive gift hampers, and product restock notifications.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                                prefs.marketingSms ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                            }`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consent Timestamp & DPDP Audit Details */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-gray-400 shrink-0" />
                        <span>
                            {preferences?.consentTimestamp ? (
                                <>Last updated: <span className="font-mono font-bold text-gray-700">{new Date(preferences.consentTimestamp).toLocaleString('en-IN')}</span></>
                            ) : (
                                'Consent record will be timestamped upon saving.'
                            )}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-400 italic">
                        Consent choices are audited with IP address & security timestamp.
                    </span>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-[#07470a] text-white px-8 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        <span>{saving ? 'Recording Consent...' : 'Save Communication Preferences'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ================= CONSULTATIONS LIST TAB =================
const ConsultationsList = ({ consultations, loading }) => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8">My Consultations</h2>
        {loading ? (
            <SkeletonLoader />
        ) : consultations.length === 0 ? (
            <EmptyState icon={<Stethoscope size={32} />} message="No consultations booked yet." link="/contact" linkText="Book Doctor Appointment" />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consultations.map(booking => (
                    <div key={booking._id} className="p-6 rounded-3xl border border-gray-100 bg-[#FDFBF7] hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <Stethoscope size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{booking.doctorName || 'Ayurvedic Specialist'}</h4>
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{booking.status || 'Confirmed'}</p>
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
                                <span>Join Consultation</span>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ================= LIVE SHIPMENT TRACKER TAB =================
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

    const latestScan = data?.timeline && data.timeline.length > 0
        ? data.timeline[data.timeline.length - 1]
        : null;
    const currentHub = latestScan?.location || data?.location || `${data?.destinationCity || 'Central'} Sorting Hub`;
    const latestActivity = latestScan?.status || data?.trackingStatus || data?.shippingStatus || 'In Transit';
    const latestRemarks = latestScan?.description || 'Parcel is progressing through courier logistics network';
    const latestScanTime = latestScan?.timestamp || new Date();

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

                        {/* 5-Step Visual Stepper */}
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
                                    <MapPin size={11} className="text-secondary" /> Current Transit Hub
                                </span>
                                <p className="font-bold text-gray-800 mt-0.5 truncate" title={currentHub}>
                                    {currentHub}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                    Status: {latestActivity}
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
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                    Speed: {data.deliveryOption || 'Surface Express'}
                                </p>
                            </div>

                            <div className="bg-white/80 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                    <Truck size={11} className="text-secondary" /> Destination
                                </span>
                                <p className="font-bold text-gray-800 mt-0.5">
                                    {data.destinationCity || 'India'} {data.destinationPincodeMasked ? `(${data.destinationPincodeMasked})` : ''}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                    Recipient: {data.recipientMasked || 'Verified Customer'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dedicated Live Current Hub & Transit Center Card */}
                    <div className="bg-gradient-to-br from-emerald-950 via-[#0a3a14] to-primary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-emerald-400/10 pointer-events-none" />
                        <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-emerald-400/10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                                        Live Courier Hub Radar
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-200/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    <Clock size={11} className="text-emerald-400" />
                                    <span>Last Scan: {formatTime(latestScanTime)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-widest flex items-center gap-1">
                                        <MapPin size={11} className="text-secondary" /> Active Sorting Facility / Hub
                                    </span>
                                    <h4 className="text-xl font-serif font-black text-white mt-0.5">
                                        {currentHub}
                                    </h4>
                                    <div className="text-xs text-emerald-100/90 mt-1.5 flex flex-wrap items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                                        <span className="font-bold text-white">{latestActivity}:</span>
                                        <span className="text-emerald-200">{latestRemarks}</span>
                                    </div>
                                </div>

                                <div className="sm:text-right shrink-0">
                                    <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-widest">
                                        Carrier
                                    </span>
                                    <p className="text-sm font-bold text-white mt-0.5 flex items-center sm:justify-end gap-1.5">
                                        <Truck size={13} className="text-secondary" />
                                        <span>{data.courierName || 'DELHIVERY SURFACE'}</span>
                                    </p>
                                    <p className="text-[10px] text-emerald-200/80 font-mono">
                                        AWB: {data.waybill}
                                    </p>
                                </div>
                            </div>

                            {/* 3-Point Visual Route Flow */}
                            <div className="mt-5 pt-4 border-t border-white/10">
                                <div className="grid grid-cols-3 gap-2 text-center text-xs relative">
                                    <div className="hidden sm:block absolute top-3.5 left-[18%] right-[18%] h-0.5 bg-white/20 -z-0" />

                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-1 relative z-10 border border-white/40">
                                            1
                                        </div>
                                        <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Origin Hub</span>
                                        <span className="text-[10px] text-white/90 font-medium truncate max-w-[100px]">Bayad Facility</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center text-[11px] font-black mb-1 relative z-10 ring-4 ring-secondary/30 shadow-md">
                                            📍
                                        </div>
                                        <span className="text-[9px] font-bold text-secondary uppercase tracking-wider animate-pulse">Current Hub</span>
                                        <span className="text-[10px] text-white font-bold truncate max-w-[110px]">{currentHub}</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-1 relative z-10 border border-white/40">
                                            3
                                        </div>
                                        <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Destination</span>
                                        <span className="text-[10px] text-white/90 font-medium truncate max-w-[100px]">{data.destinationCity || 'Customer City'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Checkpoints */}
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

// ================= ACCOUNT SETTINGS TAB =================
const SettingsForm = ({ formData, setters, onSubmit, message, messageType }) => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8">Account Settings</h2>
        
        {message && (
            <div className={`p-5 rounded-2xl mb-8 flex items-center gap-3 animate-fade-in ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${messageType === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <p className="font-bold text-sm tracking-wide">{message}</p>
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-10">
            <FormSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Full Name" value={formData.name} onChange={e => setters.setName(e.target.value)} icon={<User size={16} />} />
                    <FormInput label="Email Address" value={formData.email} onChange={e => setters.setEmail(e.target.value)} icon={<Mail size={16} />} />
                    <FormInput label="Mobile Number" value={formData.phone} onChange={e => setters.setPhone(e.target.value)} icon={<Phone size={16} />} />
                </div>
            </FormSection>

            <FormSection title="Default Shipping Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Pincode" value={formData.postalCode} onChange={e => setters.setPostalCode(e.target.value)} icon={<MapPin size={16} />} />
                    <FormInput label="City" value={formData.city} onChange={e => setters.setCity(e.target.value)} icon={<Building2 size={16} />} />
                    <FormInput label="House No / Street / Landmark" value={formData.address} onChange={e => setters.setAddress(e.target.value)} icon={<Home size={16} />} containerClass="md:col-span-2" />
                </div>
            </FormSection>

            <FormSection title="Security & Password">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="New Password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setters.setPassword(e.target.value)} icon={<Lock size={16} />} helper="Leave empty to keep existing password" />
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

// UI Helpers
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
