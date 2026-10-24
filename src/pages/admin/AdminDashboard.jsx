import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, Calendar, AlertCircle, ArrowRight, Package, Settings } from 'lucide-react';
import api from '../../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><p className="text-gray-500 animate-pulse">Loading Dashboard Insights...</p></div>;
    if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>;

    const { stats: mainStats, monthlyData, lowStockProducts, recentOrders } = stats;

    return (
        <div>
            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{mainStats.totalRevenue.toLocaleString('en-IN')}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="flex items-center text-green-600 text-xs font-bold gap-1">
                        <span>Paid Orders</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{mainStats.activeOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="flex items-center text-blue-600 text-xs font-bold gap-1">
                        <span>Lifetime</span>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{mainStats.totalCustomers}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="flex items-center text-purple-600 text-xs font-bold gap-1">
                        <span>Registered Users</span>
                    </div>
                </div>

                {/* Consultations Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Consultations</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{mainStats.totalConsultations}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className="flex items-center text-orange-600 text-xs font-bold gap-1">
                        <span>Doctor Bookings</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Sales Performance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Sales Performance</h3>
                            <p className="text-gray-500 text-sm">Revenue trends over the last 6 months</p>
                        </div>
                    </div>

                    <div className="h-64 w-full flex items-end justify-between px-4 pb-8 border-b border-gray-100 relative pt-10">
                        {monthlyData.map((data, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative h-full justify-end">
                                <div
                                    className="w-12 bg-primary/20 hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                                    style={{ height: `${(data.revenue / Math.max(...monthlyData.map(d => d.revenue || 1))) * 100}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        ₹{data.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-500" /> Low Stock Alerts
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {lowStockProducts.length > 0 ? lowStockProducts.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-400">{item.sku}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-sm font-bold ${item.left === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                        {item.left} left
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 text-sm py-10">All stock levels are healthy.</p>
                        )}
                    </div>
                    <Link to="/admin/productlist" className="block w-full text-center mt-6 py-2 border border-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/5 transition">
                        View All Inventory
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                        <p className="text-gray-500 text-sm">Latest transactions from our store</p>
                    </div>
                    <Link to="/admin/orderlist" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                        View All Orders <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                <th className="pb-3 font-medium">Order ID</th>
                                <th className="pb-3 font-medium">Customer</th>
                                <th className="pb-3 font-medium">Product</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentOrders.map((order, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                    <td className="py-4 font-bold text-primary">{order.id}</td>
                                    <td className="py-4 text-gray-700">{order.name}</td>
                                    <td className="py-4 text-gray-600 truncate max-w-[200px]">{order.product}</td>
                                    <td className="py-4 text-gray-500">{order.date}</td>
                                    <td className="py-4 font-bold text-gray-800">{order.amount}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.isDelivered ? 'bg-green-100 text-green-700' :
                                                order.isPaid ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
