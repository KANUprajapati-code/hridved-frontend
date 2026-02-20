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
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Truck className="text-primary" /> Tracking Details
                        </h2>

                        {/* Mock UI if API data structure is unknown, assuming standard list */}
                        <div className="space-y-6 relative border-l-2 border-gray-200 ml-4 pl-8">
                            {/* This is a generic timeline visualization */}
                            <div className="relative">
                                <span className="absolute -left-10 bg-green-500 text-white rounded-full p-1"><CheckCircle size={14} /></span>
                                <h4 className="font-bold text-gray-800">Current Status</h4>
                                <p className="text-green-600 font-medium">{trackingData.current_status || "Processing"}</p>
                                <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                            </div>

                            {/* If Fship returns a timeline array, map it here. For now, just showing raw data or simple info */}
                            {trackingData.scans && trackingData.scans.map((scan, idx) => (
                                <div key={idx} className="relative">
                                    <span className="absolute -left-10 bg-gray-200 text-gray-600 rounded-full p-1"><Circle size={14} /></span>
                                    <h4 className="font-bold text-gray-700">{scan.status}</h4>
                                    <p className="text-sm text-gray-600">{scan.location}</p>
                                    <p className="text-xs text-gray-500">{scan.date}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded border">
                            <p><strong>Courier:</strong> {trackingData.courier_name || "Fship Partner"}</p>
                            <p><strong>AWB:</strong> {trackingData.awb_number || "N/A"}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
