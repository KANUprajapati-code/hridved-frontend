import { useEffect, useState } from 'react';
import { Activity, Eye, ShoppingCart, Users } from 'lucide-react';
import api from '../../utils/api';

const reasonLabels = {
    shipping_cost: 'Shipping cost', payment_options: 'Payment options', delivery_time: 'Delivery time',
    need_more_info: 'Need more product information', comparing: 'Comparing options', other: 'Other reason',
};

const MarketingInsightsPage = () => {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('/admin/marketing-stats').then(({ data }) => setReport(data))
            .catch((err) => setError(err.response?.data?.message || 'Could not load activity insights.'))
            .finally(() => setLoading(false));
    }, []);
    if (loading) return <div className="p-8 text-gray-500">Loading marketing insights…</div>;
    if (error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;

    const totals = report?.totals || {};
    const cards = [
        { label: 'Consent-based visits', value: totals.sessions || 0, icon: <Users size={20} /> },
        { label: 'Product views', value: totals.productViews || 0, icon: <Eye size={20} /> },
        { label: 'Added to cart', value: totals.addToCart || 0, icon: <ShoppingCart size={20} /> },
        { label: 'Checkout sessions', value: totals.checkoutSessions || 0, icon: <Activity size={20} /> },
    ];

    return <div className="space-y-7">
        <header><h1 className="text-3xl font-bold text-primary">Marketing insights</h1><p className="mt-2 text-sm text-gray-500">Consent-based shopping activity from the last {report?.periodDays || 30} days. Checkout steps show where shoppers stop; only optional survey answers tell us their stated reason.</p></header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-gray-500"><span className="text-sm">{card.label}</span><span className="text-primary">{card.icon}</span></div><p className="mt-4 text-3xl font-bold text-gray-900">{card.value.toLocaleString('en-IN')}</p></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-bold text-gray-900">Checkout progress</h2><div className="space-y-4">{(report?.funnel || []).map((row) => <div key={row.step}><div className="mb-1 flex justify-between text-sm"><span className="capitalize">{row.step}</span><strong>{row.sessions}</strong></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, totals.checkoutSessions ? row.sessions / totals.checkoutSessions * 100 : 0)}%` }} /></div></div>)}</div></section>
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-bold text-gray-900">Products customers explore</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-gray-500"><tr><th className="py-2">Product</th><th className="py-2">Views</th><th className="py-2">Adds</th><th className="py-2">Qty</th></tr></thead><tbody>{(report?.productInterest || []).map((item) => <tr key={item.productId} className="border-t"><td className="py-3 pr-3 font-medium">{item.name}</td><td>{item.views}</td><td>{item.adds}</td><td>{item.quantity}</td></tr>)}</tbody></table>{!report?.productInterest?.length && <p className="py-5 text-sm text-gray-500">No consented product activity recorded yet.</p>}</div></section>
        </div>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-bold text-gray-900">Why shoppers say they are not ready</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(report?.abandonmentReasons || []).map((item) => <div key={item.reason} className="flex justify-between rounded-xl bg-gray-50 p-4 text-sm"><span>{reasonLabels[item.reason] || item.reason}</span><strong>{item.responses}</strong></div>)}</div>{!report?.abandonmentReasons?.length && <p className="text-sm text-gray-500">No optional checkout feedback has been submitted yet.</p>}</section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-bold text-gray-900">Recent activity</h2><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-gray-500"><tr><th className="py-2">Time</th><th>Activity</th><th>Product / step / reason</th><th>Customer</th><th>Quantity</th></tr></thead><tbody>{(report?.recentActivity || []).map((item, index) => <tr key={`${item.createdAt}-${index}`} className="border-t"><td className="py-3">{new Date(item.createdAt).toLocaleString('en-IN')}</td><td className="capitalize">{item.type.replaceAll('_', ' ')}</td><td>{item.productName || item.step || reasonLabels[item.reason] || '—'}</td><td>{item.userName}{item.userEmail && <span className="block text-xs text-gray-500">{item.userEmail}</span>}</td><td>{item.quantity || '—'}</td></tr>)}</tbody></table>{!report?.recentActivity?.length && <p className="py-5 text-sm text-gray-500">New activity will appear after a visitor chooses Allow analytics.</p>}</div></section>
    </div>;
};
export default MarketingInsightsPage;
