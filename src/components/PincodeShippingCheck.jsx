import { useState } from 'react';
import { Truck, Check, AlertCircle, Loader } from 'lucide-react';
import api from '../utils/api';

const PincodeShippingCheck = ({ productPrice = 0 }) => {
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!pincode || pincode.length < 6) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Still call the API to ensure the backend is touched, 
            // but we will override the serviceability result
            const { data } = await api.post('/shipping/serviceability', {
                pincode: parseInt(pincode),
                weight: 0.5,
                cod: productPrice > 0 ? 1 : 0,
            });

            // Always set available to true as requested by the user
            setResult({
                available: true,
                message: `Delivery available in 2-4 business days`,
                estimatedDelivery: '2-4 business days',
                couriers: (data && data.shippingOptions && data.shippingOptions.length > 0) 
                    ? data.shippingOptions.map(opt => opt.provider) 
                    : ['BlueDart', 'Delhivery', 'FedEx'],
            });
        } catch (err) {
            // Even if API fails, we show as available to satisfy the "always available" requirement
            setResult({
                available: true,
                message: `Delivery available in 2-4 business days`,
                estimatedDelivery: '2-4 business days',
                couriers: ['Standard Delivery'],
            });
            console.error('Serviceability check error (ignored):', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FDFBF7] border border-accent/40 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
                <Truck size={18} className="text-secondary" />
                <h4 className="font-display font-bold text-primary text-sm sm:text-base">Check Delivery & COD Availability</h4>
            </div>

            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Enter 6-digit Pincode (e.g. 110001)"
                    value={pincode}
                    onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                    }}
                    maxLength="6"
                    className="flex-1 px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-xs sm:text-sm font-body text-gray-900 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={loading || pincode.length < 6}
                    className="px-5 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader size={14} className="animate-spin" />
                            Checking...
                        </>
                    ) : (
                        'Verify'
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs mt-2 font-body">
                    <AlertCircle size={15} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className={`p-3 rounded-xl text-xs font-body mt-2 border ${
                    result.available
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <div className="flex items-start gap-2">
                        {result.available ? (
                            <>
                                <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">{result.message}</p>
                                    {result.couriers && (
                                        <p className="mt-0.5 text-[11px] text-emerald-700">Delivered via: {result.couriers.join(', ')}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                                <p>{result.message}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PincodeShippingCheck;
