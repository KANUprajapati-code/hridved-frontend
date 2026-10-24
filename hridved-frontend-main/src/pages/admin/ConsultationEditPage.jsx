import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const initial = {
    eyebrow: 'CONSULTATION', title: 'Talk to us before you choose.',
    description: 'Tell us what you are looking for. We listen, ask a few questions and point you to what suits you.',
    phone: '+919265401508', whatsapp: '919265401508',
    whatsappMessage: 'Hi! I would like a consultation before I choose a product.',
    disclaimer: 'Consultations offer general wellness guidance. They do not replace a medical diagnosis or emergency care.',
    ways: [
        { title: 'Chat on WhatsApp', description: 'Type your question, send a photo if it helps, and carry on the conversation at your own pace.' },
        { title: 'Video consultation', description: 'Pick a time that suits you and speak with our team.' },
        { title: 'Speak on the phone', description: 'Prefer to talk? Call us during working hours.' }
    ],
    steps: [
        { title: 'Share your concern', description: 'Tell us what you need in your own words.' },
        { title: 'We ask a few questions', description: 'About your routine, what you already use and what you would like to change.' },
        { title: 'You get a suggestion', description: 'We explain what may suit you and how to use it.' },
        { title: 'Order when you are ready', description: 'There is no obligation to buy.' }
    ],
    faqs: [
        { title: 'Do I have to buy something after a consultation?', description: 'No. The consultation helps you choose. Whether and when you order is up to you.' },
        { title: 'What should I keep ready?', description: 'Share what you are looking for and the routine or products you already use.' },
        { title: 'Is this a replacement for seeing a doctor?', description: 'No. It is general wellness guidance and does not replace medical advice.' }
    ]
};

const ConsultationEditPage = () => {
    const [settings, setSettings] = useState(initial);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/content').then(({ data }) => {
            if (data.consultation?.data) setSettings({ ...initial, ...data.consultation.data });
        }).catch(() => {});
    }, []);

    const update = (key, value) => { setSettings((current) => ({ ...current, [key]: value })); setSaved(false); };
    const updateItem = (key, index, field, value) => update(key, settings[key].map((item, i) => i === index ? { ...item, [field]: value } : item));
    const addItem = (key) => update(key, [...settings[key], { title: '', description: '' }]);
    const removeItem = (key, index) => update(key, settings[key].filter((_, i) => i !== index));

    const save = async (event) => {
        event.preventDefault();
        await api.put('/content/consultation', { data: settings });
        setSaved(true);
    };

    const textField = (key, label, multiline = false) => (
        <label className="block text-sm font-bold text-gray-700">{label}
            {multiline ? <textarea rows="3" value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" /> : <input value={settings[key] || ''} onChange={(e) => update(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" />}
        </label>
    );

    const itemEditor = (key, title) => (
        <section className="bg-white rounded-xl border p-5 space-y-4">
            <div className="flex justify-between items-center"><h2 className="font-bold text-primary">{title}</h2><button type="button" onClick={() => addItem(key)} className="text-sm text-primary flex items-center gap-1"><Plus size={16} /> Add</button></div>
            {(settings[key] || []).map((item, index) => (
                <div key={`${key}-${index}`} className="grid md:grid-cols-2 gap-3 border-t pt-4">
                    <input aria-label={`${title} title ${index + 1}`} value={item.title || ''} onChange={(e) => updateItem(key, index, 'title', e.target.value)} className="border rounded-lg p-3" placeholder="Title" />
                    <div className="flex gap-2"><textarea aria-label={`${title} description ${index + 1}`} value={item.description || ''} onChange={(e) => updateItem(key, index, 'description', e.target.value)} className="border rounded-lg p-3 flex-1" placeholder="Description" rows="2" /><button type="button" onClick={() => removeItem(key, index)} aria-label="Remove item" className="text-red-500"><Trash2 size={18} /></button></div>
                </div>
            ))}
        </section>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={18} /> Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-primary mb-2">Edit Consultation Page</h1>
            <p className="text-gray-500 mb-6">Update the public consultation page and its contact details.</p>
            <form onSubmit={save} className="space-y-5">
                <section className="bg-white rounded-xl border p-5 grid md:grid-cols-2 gap-4">
                    {textField('eyebrow', 'Eyebrow')}{textField('title', 'Page title')}
                    {textField('description', 'Intro text', true)}{textField('disclaimer', 'Guidance note', true)}
                    {textField('phone', 'Phone number')}{textField('whatsapp', 'WhatsApp number (country code, digits only)')}
                    <div className="md:col-span-2">{textField('whatsappMessage', 'WhatsApp opening message')}</div>
                </section>
                {itemEditor('ways', 'Ways to consult')}
                {itemEditor('steps', 'Consultation steps')}
                {itemEditor('faqs', 'Consultation questions')}
                <div className="flex items-center gap-4"><button className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-bold"><Save size={18} /> Save changes</button>{saved && <span className="text-green-700">Saved.</span>}</div>
            </form>
        </div>
    );
};

export default ConsultationEditPage;
