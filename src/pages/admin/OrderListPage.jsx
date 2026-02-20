
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { X, Check } from 'lucide-react';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-6">Orders</h1>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="py-3 px-4 font-bold text-gray-700">ID</th>
                            <th className="py-3 px-4 font-bold text-gray-700">USER</th>
                            <th className="py-3 px-4 font-bold text-gray-700">DATE</th>
                            <th className="py-3 px-4 font-bold text-gray-700">TOTAL</th>
                            <th className="py-3 px-4 font-bold text-gray-700">PAID</th>
                            <th className="py-3 px-4 font-bold text-gray-700">DELIVERED</th>
                            <th className="py-3 px-4 font-bold text-gray-700">DETAILS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="py-3 px-4 text-sm">{order._id}</td>
                                <td className="py-3 px-4 text-sm">{order.user && order.user.name}</td>
                                <td className="py-3 px-4 text-sm">{order.createdAt.substring(0, 10)}</td>
                                <td className="py-3 px-4 text-sm">₹{order.totalPrice}</td>
                                <td className="py-3 px-4 text-sm">
                                    {order.isPaid ? (
                                        <span className="text-green-600 font-bold">{order.paidAt.substring(0, 10)}</span>
                                    ) : (
                                        <X size={20} className="text-red-500" />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    {order.isDelivered ? (
                                        <span className="text-green-600 font-bold">{order.deliveredAt.substring(0, 10)}</span>
                                    ) : (
                                        <X size={20} className="text-red-500" />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <Link to={`/order/${order._id}`} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-bold">
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderListPage;
