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
            setError(err.response?.data?.message || 'Failed to track order. Please check Waybill Number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl font-serif font-bold text-center text-primary mb-8 tracking-tight">Track Your Journey</h1>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Enter your Waybill Number"
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-opacity-90 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : <><Search size={20} /> Locate Order</>}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-sm text-center font-medium">{error}</p>}
                </div>

                {trackingData && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Truck className="text-primary" size={24} /> Shipment Status
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Waybill: {trackingData.waybill}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${trackingData.status === 'Delivered'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {trackingData.status || "In Transit"}
                            </span>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Current Location</p>
                                <p className="font-bold text-gray-800">{trackingData.location || "Processing Hub"}</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Last Updated</p>
                                <p className="font-bold text-gray-800">{trackingData.lastscanned || "Recently"}</p>
                            </div>
                        </div>

                        {/* Remark Section */}
                        {trackingData.remark && (
                            <div className="mb-10 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                <h4 className="text-xs font-black text-primary uppercase mb-2">Latest Remark</h4>
                                <p className="text-sm text-gray-800 font-medium italic">"{trackingData.remark}"</p>
                            </div>
                        )}

                        <div className="p-6 bg-gray-900 rounded-2xl text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Courier Partner</p>
                                    <p className="font-bold">{trackingData.fulfilledby || "Fship Logistics"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Order Ref</p>
                                    <p className="font-mono font-bold text-primary">#{trackingData.orderid || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
