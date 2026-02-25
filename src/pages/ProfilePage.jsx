
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Package, LogOut, MapPin, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');

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

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Tracking State
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
        if (password !== confirmPassword) {
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
            // If waybill is provided, use it. Otherwise, use orderId (logic in controller handles it)
            const identifier = waybill || orderId;
            const { data } = await api.get(`/shipping/track/${identifier}`);
            setTrackingData(data);
        } catch (err) {
            setTrackingError(err.response?.data?.message || 'Tracking information not found. Make sure your order is shipped.');
        } finally {
            setLoadingTracking(false);
        }
    };

    const handleManualTrack = (e) => {
        e.preventDefault();
        if (trackingOrderId) {
            // Assuming the input could be orderId or waybill
            handleTrackOrder('', trackingOrderId);
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
        { id: 'tracking', label: 'Track Order', icon: <MapPin size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
                    {/* Sidebar */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-primary/5 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-primary mb-3 overflow-hidden border-4 border-white shadow-md relative">
                                    {avatar ? (
                                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold font-serif">
                                            {name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 line-clamp-1">{name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">{email}</p>
                            </div>
                            <nav className="p-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 text-sm font-medium ${activeTab === tab.id
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-50 mt-2"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-3/4">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
                                <h2 className="text-2xl font-serif font-bold text-primary mb-6">Account Settings</h2>

                                {message && (
                                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    {/* Avatar Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                                {avatar ? (
                                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    id="avatar-upload"
                                                    className="hidden"
                                                    onChange={uploadFileHandler}
                                                />
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors inline-block"
                                                >
                                                    {uploading ? 'Uploading...' : 'Change Photo'}
                                                </label>
                                                <p className="text-xs text-gray-400 mt-1">Allowed JPG, GIF or PNG. Max size of 800K</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Personal Information */}
                                        <div className="md:col-span-2">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Personal Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="+91 98765 43210"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        <div className="md:col-span-2">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Address Book</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                                                    <input
                                                        type="text"
                                                        placeholder="123 Wellness Street"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Mumbai"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        placeholder="400001"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={postalCode}
                                                        onChange={(e) => setPostalCode(e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                                                    <input
                                                        type="text"
                                                        placeholder="India"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={country}
                                                        onChange={(e) => setCountry(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Change */}
                                        <div className="md:col-span-2">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Security</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Leave blank to keep same"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all duration-300 shadow-lg shadow-primary/20"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
                                <h2 className="text-2xl font-serif font-bold text-primary mb-6">My Orders</h2>
                                {loadingOrders ? (
                                    <p className="text-center text-gray-500 py-10">Loading orders...</p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
                                        <Link to="/shop" className="text-primary font-bold hover:underline">Start Shopping</Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-6 text-sm font-medium text-gray-900 font-mono">
                                                            #{order._id.substring(0, 8).toUpperCase()}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-bold text-gray-900">
                                                            ₹{order.totalPrice.toLocaleString()}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit uppercase tracking-tighter ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                                                </span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit uppercase tracking-tighter ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/order/${order._id}`}
                                                                    className="text-primary hover:text-secondary font-bold bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                                                                >
                                                                    View
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleTrackOrder(order._id, order.waybill)}
                                                                    className="text-secondary hover:text-primary font-bold bg-secondary/5 hover:bg-secondary/10 px-3 py-1.5 rounded-lg transition-colors"
                                                                >
                                                                    Track
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tracking' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
                                <h2 className="text-2xl font-serif font-bold text-primary mb-6">Track Your Shipment</h2>

                                <form onSubmit={handleManualTrack} className="flex flex-col md:flex-row gap-4 mb-8">
                                    <input
                                        type="text"
                                        placeholder="Enter Order ID (e.g. 65db...)"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                        value={trackingOrderId}
                                        onChange={(e) => setTrackingOrderId(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loadingTracking}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
                                    >
                                        {loadingTracking ? 'Searching...' : 'Track Package'}
                                    </button>
                                </form>

                                {trackingError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 flex items-center gap-2">
                                        <AlertCircle size={18} /> {trackingError}
                                    </div>
                                )}

                                {trackingData ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
                                                <p className="text-primary font-bold">{trackingData.status || 'In Transit'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Last Location</p>
                                                <p className="text-gray-800 font-bold">{trackingData.location || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Courier</p>
                                                <p className="text-gray-800 font-bold">{trackingData.courier_name || trackingData.fulfilledby || 'Fship'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Waybill</p>
                                                <p className="text-primary font-mono font-bold">{trackingData.waybill || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {trackingData.remark && (
                                            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                                <h4 className="text-[10px] font-black text-primary uppercase mb-2">Latest Remark</h4>
                                                <p className="text-sm text-gray-800 italic">"{trackingData.remark}"</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Last Scan Date</p>
                                            <p className="text-sm font-medium text-gray-600">{trackingData.lastscanned || 'Updating...'}</p>
                                        </div>
                                    </div>
                                ) : !loadingTracking && !trackingError && (
                                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Package size={32} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-500">Wait for your order to be marked as &quot;Shipped&quot; to see real-time updates.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
