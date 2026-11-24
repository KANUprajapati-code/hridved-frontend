import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { X, Check, ArrowLeft, Search, CheckCircle2, Truck, RefreshCw } from 'lucide-react';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveringId, setDeliveringId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handler to manually mark an order as Delivered
    const markAsDeliveredHandler = async (orderId) => {
        if (!window.confirm(`Are you sure you want to mark Order #${orderId?.slice(-8).toUpperCase()} as Delivered?`)) {
            return;
        }

        try {
            setDeliveringId(orderId);
            const { data } = await api.put(`/orders/${orderId}/deliver`);
            setOrders(prev =>
                prev.map(o => (o._id === orderId ? {
                    ...o,
                    ...data,
                    isDelivered: true,
                    deliveredAt: data.deliveredAt || new Date().toISOString(),
                    shippingStatus: 'Delivered',
                    orderStatus: 'Delivered',
                    trackingStatus: 'Delivered'
                } : o))
            );
        } catch (err) {
            console.error('Error marking order as delivered:', err);
            alert(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setDeliveringId(null);
        }
    };

    // Filter and search logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const isDelivered = Boolean(
                order.isDelivered ||
                order.shippingStatus === 'Delivered' ||
                order.orderStatus === 'Delivered' ||
                (order.trackingStatus && order.trackingStatus.toLowerCase().includes('deliver'))
            );

            if (statusFilter === 'DELIVERED' && !isDelivered) return false;
            if (statusFilter === 'PENDING' && isDelivered) return false;
            if (statusFilter === 'UNPAID' && order.isPaid) return false;

            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const idMatch = String(order._id || '').toLowerCase().includes(q);
                const userMatch = String(order.user?.name || '').toLowerCase().includes(q) ||
                    String(order.shippingAddress?.fullName || '').toLowerCase().includes(q);
                const phoneMatch = String(order.shippingAddress?.mobileNumber || '').includes(q);
                const cityMatch = String(order.shippingAddress?.city || '').toLowerCase().includes(q);
                const awbMatch = String(order.waybill || '').toLowerCase().includes(q);
                return idMatch || userMatch || phoneMatch || cityMatch || awbMatch;
            }

            return true;
        });
    }, [orders, statusFilter, searchTerm]);

    const deliveredCount = orders.filter(o =>
        Boolean(o.isDelivered || o.shippingStatus === 'Delivered' || o.orderStatus === 'Delivered')
    ).length;

    const pendingCount = orders.length - deliveredCount;

    if (loading && orders.length === 0) {
        return <div className="text-center py-24 text-gray-500 font-bold">Loading Orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors text-xs font-bold uppercase tracking-wider">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Customer Orders</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage order fulfillment, delivery confirmations, and live status.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Orders
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${statusFilter === 'ALL'
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('DELIVERED')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${statusFilter === 'DELIVERED'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                    >
                        Delivered ({deliveredCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('PENDING')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${statusFilter === 'PENDING'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                    >
                        Pending Delivery ({pendingCount})
                    </button>
                </div>

                <div className="relative min-w-[260px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, Customer, Phone, AWB..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Order ID</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Customer</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Date</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Total</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Payment</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Delivery Status</th>
                            <th className="py-3.5 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-12 text-center text-gray-400 text-sm font-medium">
                                    No orders found matching the filter.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const isDelivered = Boolean(
                                    order.isDelivered ||
                                    order.shippingStatus === 'Delivered' ||
                                    order.orderStatus === 'Delivered' ||
                                    (order.trackingStatus && order.trackingStatus.toLowerCase().includes('deliver'))
                                );

                                const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
                                const customerPhone = order.shippingAddress?.mobileNumber || '';
                                const customerCity = order.shippingAddress?.city || '';

                                return (
                                    <tr key={order._id} className="hover:bg-gray-50/70 transition">
                                        {/* Order ID */}
                                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-gray-900">
                                            #{order._id?.slice(-8).toUpperCase()}
                                            {order.waybill && (
                                                <span className="block text-[10px] font-mono text-gray-400 font-normal mt-0.5">
                                                    AWB: {order.waybill}
                                                </span>
                                            )}
                                        </td>

                                        {/* Customer */}
                                        <td className="py-3.5 px-4 text-sm">
                                            <div className="font-bold text-gray-900 leading-tight">{customerName}</div>
                                            <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                {customerPhone} {customerCity ? `• ${customerCity}` : ''}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="py-3.5 px-4 text-xs text-gray-500 font-medium">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : ''}
                                        </td>

                                        {/* Total */}
                                        <td className="py-3.5 px-4 text-sm font-bold text-gray-900">
                                            ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                                        </td>

                                        {/* Payment */}
                                        <td className="py-3.5 px-4 text-xs">
                                            {order.isPaid ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                                                    <Check size={12} strokeWidth={3} /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                    Unpaid ({order.paymentMethod || 'COD'})
                                                </span>
                                            )}
                                        </td>

                                        {/* Delivery Status */}
                                        <td className="py-3.5 px-4 text-xs">
                                            {isDelivered ? (
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                                                        <CheckCircle2 size={13} className="text-emerald-700" />
                                                        <span>Delivered</span>
                                                    </span>
                                                    {order.deliveredAt && (
                                                        <span className="text-[10px] text-gray-400 font-medium pl-1">
                                                            on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                                        <Truck size={12} />
                                                        <span>{order.shippingStatus || order.orderStatus || 'Processing'}</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsDeliveredHandler(order._id)}
                                                        disabled={deliveringId === order._id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs cursor-pointer disabled:opacity-50 text-[11px]"
                                                        title="Mark this order as Delivered"
                                                    >
                                                        <Check size={12} strokeWidth={3} />
                                                        <span>{deliveringId === order._id ? 'Saving...' : 'Mark Delivered'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-xs text-right">
                                            <Link
                                                to={`/order/${order._id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition shadow-xs"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderListPage;
