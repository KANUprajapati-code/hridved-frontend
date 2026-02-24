import { useState } from 'react';
import api from '../utils/api';
import { Search, Truck, Package, CheckCircle, Circle } from 'lucide-react';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTrackingData(null);

        try {
            const { data } = await api.get(`/shipping/track/${orderId}`);
            setTrackingData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to track order. Please check Order ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl font-serif font-bold text-center text-primary mb-8">Track Your Order</h1>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleTrack} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter Order ID"
                            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:border-primary"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Tracking...' : <><Search size={18} /> Track</>}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
                </div>

                {trackingData && (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Truck className="text-primary" /> Tracking Details
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${trackingData.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {trackingData.current_status || trackingData.status || "In Transit"}
                            </span>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-100 mb-8">
                            {trackingData.scans && trackingData.scans.length > 0 ? (
                                trackingData.scans.map((scan, idx) => (
                                    <div key={idx} className="relative pl-12">
                                        <div className={`absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white z-10 ${idx === 0 ? 'bg-primary' : 'bg-gray-300'
                                            }`} />
                                        <div>
                                            <h4 className={`font-bold ${idx === 0 ? 'text-primary' : 'text-gray-700'}`}>{scan.status}</h4>
                                            <p className="text-sm text-gray-600">{scan.location}</p>
                                            <p className="text-xs text-gray-400 mt-1">{scan.date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="relative pl-12">
                                    <div className="absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white z-10 bg-primary" />
                                    <div>
                                        <h4 className="font-bold text-primary">Order Processed</h4>
                                        <p className="text-sm text-gray-600">Your order is being prepared for shipment.</p>
                                        <p className="text-xs text-gray-400 mt-1">Updates will appear once the courier scans the package.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Courier Partner</p>
                                <p className="font-bold text-gray-800">{trackingData.courier_name || "Fship Logistics"}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">AWB Number</p>
                                <p className="font-mono font-bold text-primary">{trackingData.awb_number || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
