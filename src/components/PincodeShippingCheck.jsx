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
            const { data } = await api.post('/shipping/serviceability', {
                pincode: parseInt(pincode),
                weight: 0.5,
                cod: productPrice > 0 ? 1 : 0,
            });

            if (data && data.serviceability) {
                setResult({
                    available: true,
                    message: `Delivery available in ${2-4} business days`,
                    estimatedDelivery: '2-4 business days',
                    couriers: data.couriers || ['FedEx', 'DTDC'],
                });
            } else {
                setResult({
                    available: false,
                    message: 'Delivery not available at this pincode',
                });
            }
        } catch (err) {
            setError('Unable to check serviceability. Please try again.');
            console.error('Serviceability check error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
                <Truck size={20} className="text-blue-600" />
                <h4 className="font-bold text-gray-800">Check Delivery Availability</h4>
            </div>

            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => {
                        setPincode(e.target.value.slice(0, 6));
                        setError('');
                    }}
                    maxLength="6"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCheck}
                    disabled={loading || !pincode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader size={16} className="animate-spin" />
                            Checking...
                        </>
                    ) : (
                        'Check'
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className={`p-3 rounded-lg text-sm ${
                    result.available
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <div className="flex items-start gap-2">
                        {result.available ? (
                            <>
                                <Check size={16} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">{result.message}</p>
                                    {result.couriers && (
                                        <p className="mt-1">Available via: {result.couriers.join(', ')}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
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
