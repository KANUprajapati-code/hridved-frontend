import { useState, useEffect } from 'react';
import { Truck, Save, CheckCircle2, AlertCircle, ShieldCheck, DollarSign, Package, Percent, HelpCircle } from 'lucide-react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

const ShippingSettingsPage = () => {
    const { refreshShippingConfig } = useCart();
    const [config, setConfig] = useState({
        isFreeShipping: true,
        shippingFee: 0,
        freeShippingThreshold: 0,
        codFee: 0,
        isCodFeeEnabled: false,
        vamashipEnabled: true,
        fshipEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/config/shipping');
                if (data.success && data.data) {
                    setConfig({
                        isFreeShipping: data.data.isFreeShipping ?? true,
                        shippingFee: data.data.shippingFee ?? 0,
                        freeShippingThreshold: data.data.freeShippingThreshold ?? 0,
                        codFee: data.data.codFee ?? 0,
                        isCodFeeEnabled: data.data.isCodFeeEnabled ?? false,
                        vamashipEnabled: data.data.vamashipEnabled ?? true,
                        fshipEnabled: data.data.fshipEnabled ?? true
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch shipping config:', err);
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const { data } = await api.put('/config/shipping', config);
            if (data.success) {
                setMessage({ type: 'success', text: 'Shipping & Delivery rates updated successfully! Changes are live across website checkout.' });
                if (refreshShippingConfig) {
                    refreshShippingConfig();
                }
            }
            setSaving(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update shipping settings' });
            setSaving(false);
        }
    };

    // Calculate preview fee based on draft inputs
    const getPreviewShipping = (orderVal) => {
        if (config.isFreeShipping || Number(config.shippingFee) === 0) return 0;
        if (Number(config.freeShippingThreshold) > 0 && orderVal >= Number(config.freeShippingThreshold)) return 0;
        return Number(config.shippingFee) || 0;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-12 font-body">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Shipping & Delivery Rates</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Control customer shipping charges, free delivery rules, and Cash on Delivery (COD) fees.
                    </p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-2xl w-fit">
                    <Truck size={28} />
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
                    message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 text-emerald-600" /> : <AlertCircle size={20} className="shrink-0 text-red-600" />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Master Free Shipping Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Package size={20} className="text-emerald-700" />
                                    Free Delivery Master Switch
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Choose whether shipping is completely FREE for all customers or charged conditionally
                                </p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                                config.isFreeShipping 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                                {config.isFreeShipping ? 'Free Delivery Active' : 'Custom Charges Active'}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Toggle Free Delivery on All Orders */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/80 hover:border-primary/40 transition">
                            <div className="pr-4">
                                <h3 className="font-bold text-gray-800 text-sm">Free Delivery on All Orders (सारे ऑर्डर्स पर फ्री डिलीवरी)</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    When ON, customers will NOT be charged ₹50 or any shipping fee at checkout (Free ₹0).
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.isFreeShipping}
                                    onChange={(e) => setConfig({ ...config, isFreeShipping: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Conditional Pricing Inputs */}
                        {!config.isFreeShipping && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 animate-fadeIn">
                                {/* Standard Shipping Fee */}
                                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                                        Standard Shipping Fee (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                            value={config.shippingFee}
                                            onChange={(e) => setConfig({ ...config, shippingFee: Math.max(0, Number(e.target.value) || 0) })}
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1.5">
                                        Amount added to cart checkout when delivery is not free.
                                    </p>
                                </div>

                                {/* Free Shipping Order Threshold */}
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/60">
                                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                                        Free Delivery Above Order Value (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                            value={config.freeShippingThreshold}
                                            onChange={(e) => setConfig({ ...config, freeShippingThreshold: Math.max(0, Number(e.target.value) || 0) })}
                                            placeholder="e.g. 999 (0 means all orders free)"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1.5">
                                        Orders equal to or above this amount get Free Delivery (0 = no threshold).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Cash on Delivery (COD) Extra Fee Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <DollarSign size={20} className="text-primary" />
                            Cash on Delivery (COD) Convenience Fee
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Optionally charge an extra fee when customer chooses Cash on Delivery
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                            <div className="pr-4">
                                <h3 className="font-bold text-gray-800 text-sm">Enable Extra Fee for COD Orders</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    If disabled, COD orders have ₹0 extra charge (Free COD).
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.isCodFeeEnabled}
                                    onChange={(e) => setConfig({ ...config, isCodFeeEnabled: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {config.isCodFeeEnabled && (
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 max-w-sm animate-fadeIn">
                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                                    COD Handling Charge (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        value={config.codFee}
                                        onChange={(e) => setConfig({ ...config, codFee: Math.max(0, Number(e.target.value) || 0) })}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1.5">
                                    Amount added to total when COD is chosen by customer.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Live Customer Experience Preview Card */}
                <div className="bg-gradient-to-br from-[#FDFBF7] to-[#FAF6EE] rounded-2xl border border-accent/60 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck size={18} className="text-secondary" />
                        <h3 className="font-bold text-primary text-sm uppercase tracking-wider">
                            Live Checkout Simulation Preview
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white p-4 rounded-xl border border-accent/40 shadow-xs space-y-2">
                            <div className="font-bold text-gray-800 border-b pb-1.5 flex justify-between">
                                <span>Example Order 1 (Small Cart)</span>
                                <span className="text-primary">Cart: ₹499</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Charge:</span>
                                <span className="font-bold text-emerald-700">
                                    {getPreviewShipping(499) === 0 ? 'FREE (₹0)' : `₹${getPreviewShipping(499)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>COD Convenience:</span>
                                <span className="font-bold">
                                    {config.isCodFeeEnabled && config.codFee > 0 ? `₹${config.codFee}` : 'FREE (₹0)'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-accent/40 shadow-xs space-y-2">
                            <div className="font-bold text-gray-800 border-b pb-1.5 flex justify-between">
                                <span>Example Order 2 (Large Cart)</span>
                                <span className="text-primary">Cart: ₹1,499</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Charge:</span>
                                <span className="font-bold text-emerald-700">
                                    {getPreviewShipping(1499) === 0 ? 'FREE (₹0)' : `₹${getPreviewShipping(1499)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>COD Convenience:</span>
                                <span className="font-bold">
                                    {config.isCodFeeEnabled && config.codFee > 0 ? `₹${config.codFee}` : 'FREE (₹0)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Courier Logistics Provider Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Logistics & Couriers</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Courier API integration settings</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold text-base">V</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Vamaship Multi-Courier</h3>
                                    <p className="text-xs text-gray-500">Automated tracking & waybill generation</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.vamashipEnabled}
                                    onChange={(e) => setConfig({ ...config, vamashipEnabled: e.target.checked })}
                                />
                                <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving Settings...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Shipping Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default ShippingSettingsPage;
