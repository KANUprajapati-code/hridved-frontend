import { useState, useEffect } from 'react';
import { Truck, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const ShippingSettingsPage = () => {
    const [config, setConfig] = useState({
        fshipEnabled: true,
        vamashipEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/config/shipping');
                if (data.success) {
                    setConfig(data.data);
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
                setMessage({ type: 'success', text: 'Shipping settings updated successfully!' });
            }
            setSaving(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Shipping Settings</h1>
                    <p className="text-gray-500 mt-1">Manage active shipping providers and logistics</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Truck size={28} />
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Logistics Providers</h2>
                        <p className="text-sm text-gray-500">Toggle which shipping partners are available during checkout</p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Fship Toggle */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">F</div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Fship Logistics</h3>
                                    <p className="text-sm text-gray-500">Enable Fship for domestic shipping services</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.fshipEnabled}
                                    onChange={(e) => setConfig({ ...config, fshipEnabled: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="h-px bg-gray-50 w-full"></div>

                        {/* Vamaship Toggle */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg">V</div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Vamaship Integration</h3>
                                    <p className="text-sm text-gray-500">Enable Vamaship Multi-carrier shipping services</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.vamashipEnabled}
                                    onChange={(e) => setConfig({ ...config, vamashipEnabled: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800">
                    <div className="flex gap-3">
                        <AlertCircle className="shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold mb-1">Important Note</h4>
                            <p className="text-sm leading-relaxed opacity-90">
                                Disabling a provider will immediately hide its shipping options from the customer checkout page.
                                Ongoing orders already booked with that provider can still be tracked.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ShippingSettingsPage;
