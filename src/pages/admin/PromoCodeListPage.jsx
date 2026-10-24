import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Plus, ArrowLeft, Check, X, Tag } from 'lucide-react';
import api from '../../utils/api';

const PromoCodeListPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            try {
                await api.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                alert('Error deleting coupon');
            }
        }
    };

    const toggleStatusHandler = async (coupon) => {
        try {
            await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
            fetchCoupons();
        } catch (error) {
            console.error('Error updating coupon status:', error);
            alert('Error updating coupon status');
        }
    };

    if (loading) return <div className="text-center py-20 font-serif text-xl">Loading Promo Codes...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-2">
                    <Tag size={28} /> Promo Codes
                </h1>
                <Link
                    to="/admin/promocode/add"
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition shadow-md font-bold"
                >
                    <Plus size={20} /> Add New Code
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Code</th>
                                <th className="py-4 px-6">Discount</th>
                                <th className="py-4 px-6">Type</th>
                                <th className="py-4 px-6">Min Order</th>
                                <th className="py-4 px-6">Expiry</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-md font-bold border border-primary/20">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 capitalize">
                                        {coupon.type}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        ₹{coupon.minOrderAmount}
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className={new Date(coupon.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-600'}>
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            onClick={() => toggleStatusHandler(coupon)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${coupon.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {coupon.isActive ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                to={`/admin/promocode/${coupon._id}/edit`}
                                                className="text-blue-500 hover:text-blue-700 transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(coupon._id)}
                                                className="text-red-400 hover:text-red-600 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-gray-400 italic">
                                        No promo codes found. Click "Add New Code" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PromoCodeListPage;
