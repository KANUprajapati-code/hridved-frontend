import { useEffect, useState } from 'react';
import { Eye, ShoppingCart, CreditCard, Users, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

const fmt = (value) => Number(value || 0).toLocaleString('en-IN');
export default function WebsiteAnalyticsPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const load = () => api.get('/website-events/admin/summary?days=30').then(({ data: result }) => { setData(result); setError(''); }).catch((e) => setError(e.response?.data?.message || 'Analytics could not be loaded.'));
    useEffect(() => { load(); }, []);
    const cards = data ? [
        ['Anonymous visits', data.uniqueSessions, Users], ['Product views', data.productViews, Eye],
        ['Add to cart', data.addToCart, ShoppingCart], ['Checkout started', data.checkoutStarted, CreditCard],
        ['Orders created after consent', data.ordersCreated, CreditCard], ['Visit to order created', `${data.conversionRate}%`, RefreshCw],
    ] : [];
    return <div className="p-4 md:p-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Growth</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Website funnel</h1><p className="mt-1 text-sm text-gray-500">Last 30 days · anonymous events from visitors who allowed analytics.</p></div><button onClick={load} className="rounded-lg border px-4 py-2 text-sm">Refresh</button></div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!data && !error && <p className="text-sm text-gray-500">Loading website funnel…</p>}
        {data && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon]) => <article key={label} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-gray-500"><span>{label}</span><Icon size={18} className="text-emerald-800" /></div><p className="mt-3 text-3xl font-bold text-gray-900">{typeof value === 'number' ? fmt(value) : value}</p></article>)}</div><section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><b>What this means:</b> browsers that decline analytics are not included. This page does not identify visitors or show an abandoned cart’s contents. For a personal WhatsApp recovery message, collect a separate, explicit WhatsApp marketing opt-in during checkout and connect an approved WhatsApp Business provider.</section></>}
    </div>;
}
