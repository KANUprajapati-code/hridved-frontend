import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';

const defaults = {
    announcement: 'Ayurveda for everyday living · Pan-India delivery · Secure online payments',
    deliveryText: 'Delivering to India | Free Shipping above ₹999',
    footerDescription: 'HRIDVED Ayurveda brings the timeless wisdom of Ayurveda into modern everyday wellness.',
    phone: '+91 92654 01508', email: 'hridved.customercare@gmail.com',
    address: 'HRIDVED AYURVEDA, 1st Floor, Girishbhai Hospital Complex, Ahmedabad-Himatnagar Highway, Approach Road, Prantij, Gujarat - 383205',
    instagram: 'https://instagram.com/hridved.in', youtube: 'https://youtube.com/@hridved',
    facebook: '', twitter: ''
};

const SiteSettingsEditPage = () => {
    const [settings, setSettings] = useState(defaults);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/content').then(({ data }) => {
            if (data.siteSettings?.data) setSettings({ ...defaults, ...data.siteSettings.data });
        }).catch(() => {});
    }, []);

    const update = (key, value) => { setSettings((current) => ({ ...current, [key]: value })); setSaved(false); };
    const save = async (event) => {
        event.preventDefault();
        await api.put('/content/siteSettings', { data: settings });
        setSaved(true);
    };

    const fields = [
        ['announcement', 'Announcement strip'], ['deliveryText', 'Delivery message'],
        ['footerDescription', 'Footer description'], ['phone', 'Phone number'],
        ['email', 'Customer care email'], ['address', 'Business address'],
        ['instagram', 'Instagram URL'], ['youtube', 'YouTube URL'],
        ['facebook', 'Facebook URL'], ['twitter', 'X / Twitter URL']
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={18} /> Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-primary mb-2">Website Details</h1>
            <p className="text-gray-500 mb-6">These details appear in the announcement bar, header and footer.</p>
            <form onSubmit={save} className="bg-white border rounded-xl p-6 space-y-4">
                {fields.map(([key, label]) => <label key={key} className="block text-sm font-bold text-gray-700">{label}{key === 'address' || key === 'footerDescription' ? <textarea rows="3" value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" /> : <input value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" />}</label>)}
                <div className="flex items-center gap-4 pt-2"><button className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-bold"><Save size={18} /> Save details</button>{saved && <span className="text-green-700">Saved.</span>}</div>
            </form>
        </div>
    );
};

export default SiteSettingsEditPage;
