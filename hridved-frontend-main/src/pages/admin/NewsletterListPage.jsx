import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../../utils/api';

const NewsletterListPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/newsletter').then(({ data }) => setSubscribers(data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const toggleStatus = async (subscriber) => {
        const { data } = await api.patch(`/newsletter/${subscriber._id}`, { isSubscribed: !subscriber.isSubscribed });
        setSubscribers((current) => current.map((item) => item._id === data._id ? data : item));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={18} /> Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-primary mb-6">Newsletter Subscribers</h1>
            {loading ? <p>Loading subscribers…</p> : subscribers.length === 0 ? <p>No subscribers yet.</p> : <div className="overflow-x-auto bg-white rounded-xl border"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber._id} className="border-t"><td className="p-4"><a href={`mailto:${subscriber.email}`} className="inline-flex gap-2 items-center text-primary"><Mail size={15} />{subscriber.email}</a></td><td className="p-4">{new Date(subscriber.createdAt).toLocaleDateString()}</td><td className="p-4">{subscriber.isSubscribed ? 'Subscribed' : 'Unsubscribed'}</td><td className="p-4"><button onClick={() => toggleStatus(subscriber)} className="text-primary underline">{subscriber.isSubscribed ? 'Unsubscribe' : 'Resubscribe'}</button></td></tr>)}</tbody></table></div>}
        </div>
    );
};

export default NewsletterListPage;
