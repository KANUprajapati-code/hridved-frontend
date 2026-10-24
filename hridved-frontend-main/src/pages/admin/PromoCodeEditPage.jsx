import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag, Calendar, Layout } from 'lucide-react';
import api from '../../utils/api';

const PromoCodeEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount: 0,
        type: 'percentage',
        expiryDate: '',
        minOrderAmount: 0,
        isActive: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchCoupon = async () => {
                try {
                    const { data } = await api.get(`/coupons`);
                    const coupon = data.find(c => c._id === id);
                    if (coupon) {
                        setFormData({
                            code: coupon.code,
                            discount: coupon.discount,
                            type: coupon.type,
                            expiryDate: coupon.expiryDate.split('T')[0],
                            minOrderAmount: coupon.minOrderAmount,
                            isActive: coupon.isActive
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching coupon:', error);
                    setLoading(false);
                }
            };
            fetchCoupon();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/coupons/${id}`, formData);
            } else {
                await api.post('/coupons', formData);
            }
            navigate('/admin/promocodelist');
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert(error.response?.data?.message || 'Error saving coupon');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-serif text-xl">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link to="/admin/promocodelist" className="text-gray-500 hover:text-primary mb-6 flex items-center gap-2 transition-colors">
                <ArrowLeft size={18} /> Back to Promo Codes
            </Link>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-primary p-6 text-white">
                    <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
                        {isEdit ? <Tag size={24} /> : <Tag size={24} />}
                        {isEdit ? 'Edit Promo Code' : 'Create New Promo Code'}
                    </h1>
                    <p className="text-primary-foreground/80 text-sm mt-1">
                        Define discounts and constraints for your customers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Code */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Tag size={16} className="text-primary" /> Coupon Code
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="E.G. WELLNESS20"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition uppercase font-bold tracking-widest"
                                required
                                disabled={isEdit}
                            />
                        </div>

                        {/* Discount Amount */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Discount Value</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                required
                                min="0"
                            />
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={16} className="text-primary" /> Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                required
                            />
                        </div>

                        {/* Min Order Amount */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Min. Order Amount (₹)</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 accent-primary cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Promo code is active and can be used immediately
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none"
                    >
                        {saving ? 'Processing...' : (
                            <>
                                <Save size={20} />
                                {isEdit ? 'Update Promo Code' : 'Save Promo Code'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PromoCodeEditPage;
