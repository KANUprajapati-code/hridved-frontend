import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const defaults = {
    introEyebrow: 'Authentic Formulations', introTitle: '',
    introText: '', spotlightEyebrow: 'IN THE SPOTLIGHT',
    spotlightTitle: '', spotlightText: '', spotlightProductId: '',
    consultationEyebrow: 'CONSULTATION', consultationTitle: 'Not sure where to begin? Ask us.',
    consultationText: 'Tell us what you are dealing with and what you have tried. We will suggest what suits you.',
    consultationCta: 'Start a consultation', videoConsultationCta: 'Book a video call', videoConsultationLink: '/book', whatsappCta: 'Ask on WhatsApp', whatsappLink: 'https://wa.me/919265401508?text=Hi%2C%20I%20need%20help%20choosing%20a%20product.',
    whyEyebrow: 'WHY SHOP WITH US', whyTitle: 'Care, from the first question to your doorstep',
    whyItems: [
        { title: 'Guidance before you buy', description: 'Ask a question and we help you choose.' },
        { title: 'Secure payment', description: 'Pay securely online using available payment methods.' },
        { title: 'Delivery across India', description: 'Track your order after it is dispatched.' }
    ],
    impactEyebrow: 'OUR WAY', impactTitle: 'ONE ORDER, ONE MEAL',
    impactText: 'Your order can help bring a meal and hope to someone in need.', impactImage: '', impactLink: '/about',
    stepsEyebrow: 'SIMPLE FROM START TO FINISH', stepsTitle: 'How it works',
    steps: [
        { title: 'Tell us your concern', description: 'Browse by concern, or message us and describe what you need.' },
        { title: 'Get a suggestion', description: 'We point you to what suits you and answer your questions.' },
        { title: 'Order in minutes', description: 'Pay securely online and get your order confirmation.' },
        { title: 'We stay in touch', description: 'Track your order and reach us if you need help.' }
    ],
    faqEyebrow: 'GOOD TO KNOW', faqTitle: 'Your Wellness Questions',
    faqs: [
        { question: 'What makes HRIDVED special?', answer: 'We bring Ayurvedic heritage together with thoughtful product quality and clear guidance.' },
        { question: 'How do I choose the right product?', answer: 'Browse by concern or contact us for help choosing.' },
        { question: 'How do I track my order?', answer: 'Use the Track Order page with your order details.' }
    ],
    newsletterEyebrow: 'STAY CLOSE', newsletterTitle: 'Notes on living well, now and then',
    newsletterText: 'New launches, seasonal routines and the occasional offer.'
};

const HomepageSectionsEdit = () => {
    const [copy, setCopy] = useState(defaults);
    const [products, setProducts] = useState([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/content'), api.get('/products?pageSize=100')]).then(([contentResponse, productResponse]) => {
            if (contentResponse.data.homepage?.data) setCopy({ ...defaults, ...contentResponse.data.homepage.data });
            setProducts(productResponse.data.products || []);
        }).catch(() => {});
    }, []);

    const setField = (key, value) => { setCopy((state) => ({ ...state, [key]: value })); setSaved(false); };
    const updateItem = (key, index, field, value) => setField(key, copy[key].map((item, i) => i === index ? { ...item, [field]: value } : item));
    const addItem = (key, item) => setField(key, [...(copy[key] || []), item]);
    const removeItem = (key, index) => setField(key, copy[key].filter((_, i) => i !== index));

    const save = async (event) => {
        event.preventDefault();
        await api.put('/content/homepage', { data: copy });
        setSaved(true);
    };

    const field = (key, label, multiline = false) => (
        <label className="block text-sm font-bold text-gray-700">{label}
            {multiline ? <textarea rows="3" value={copy[key] || ''} onChange={(e) => setField(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" /> : <input value={copy[key] || ''} onChange={(e) => setField(key, e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal" />}
        </label>
    );

    const cardList = (key, heading, leftKey, rightKey, leftLabel, rightLabel) => (
        <section className="bg-white border rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center"><h2 className="font-bold text-primary">{heading}</h2><button type="button" onClick={() => addItem(key, { [leftKey]: '', [rightKey]: '' })} className="flex items-center gap-1 text-sm text-primary"><Plus size={16} /> Add</button></div>
            {(copy[key] || []).map((item, index) => <div key={`${key}-${index}`} className="grid md:grid-cols-2 gap-3 border-t pt-4"><input aria-label={`${heading} ${leftLabel}`} value={item[leftKey] || ''} onChange={(e) => updateItem(key, index, leftKey, e.target.value)} placeholder={leftLabel} className="border rounded-lg p-3" /><div className="flex gap-2"><textarea aria-label={`${heading} ${rightLabel}`} value={item[rightKey] || ''} onChange={(e) => updateItem(key, index, rightKey, e.target.value)} placeholder={rightLabel} rows="2" className="flex-1 border rounded-lg p-3" /><button type="button" onClick={() => removeItem(key, index)} aria-label="Remove item" className="text-red-500"><Trash2 size={18} /></button></div></div>)}
        </section>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={18} /> Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-primary mb-2">Homepage Sections</h1>
            <p className="text-gray-500 mb-6">Edit the homepage copy and the sections shown to customers.</p>
            <form onSubmit={save} className="space-y-5">
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Intro & spotlight</h2>{field('introEyebrow', 'Intro label')}{field('introTitle', 'Intro heading')}{field('introText', 'Intro description', true)}{field('spotlightEyebrow', 'Spotlight label')}{field('spotlightTitle', 'Spotlight heading')}{field('spotlightText', 'Spotlight description', true)}<label className="block text-sm font-bold text-gray-700">Spotlight product<select value={copy.spotlightProductId || ''} onChange={(e) => setField('spotlightProductId', e.target.value)} className="mt-1 w-full border rounded-lg p-3 font-normal"><option value="">First bestseller</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label></section>
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Consultation callout</h2>{field('consultationEyebrow', 'Label')}{field('consultationTitle', 'Heading')}{field('consultationText', 'Description', true)}{field('consultationCta', 'Consultation button')}{field('videoConsultationCta', 'Video call button')}{field('videoConsultationLink', 'Video call link')}{field('whatsappCta', 'WhatsApp button')}{field('whatsappLink', 'WhatsApp link')}</section>
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Bestsellers</h2>{field('bestsellerEyebrow', 'Label')}{field('bestsellerTitle', 'Heading')}{field('bestsellerText', 'Description', true)}{field('bestsellerCta', 'Button text')}</section>
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Video section heading and link</h2>{field('videoEyebrow', 'Label')}{field('videoTitle', 'Heading')}{field('videoText', 'Description', true)}{field('videoCta', 'Button text')}{field('videoLink', 'Button link')}</section>
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Why shop with us</h2>{field('whyEyebrow', 'Label')}{field('whyTitle', 'Heading')}</section>
                {cardList('whyItems', 'Reasons', 'title', 'description', 'Title', 'Description')}
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Our story / impact</h2>{field('impactEyebrow', 'Label')}{field('impactTitle', 'Heading')}{field('impactText', 'Description', true)}{field('impactImage', 'Image URL')}{field('impactLink', 'Button link')}</section>
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">How it works</h2>{field('stepsEyebrow', 'Label')}{field('stepsTitle', 'Heading')}</section>
                {cardList('steps', 'Steps', 'title', 'description', 'Step title', 'Step description')}
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Frequently asked questions</h2>{field('faqEyebrow', 'Label')}{field('faqTitle', 'Heading')}</section>
                {cardList('faqs', 'Questions', 'question', 'answer', 'Question', 'Answer')}
                <section className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-bold text-primary">Newsletter</h2>{field('newsletterEyebrow', 'Label')}{field('newsletterTitle', 'Heading')}{field('newsletterText', 'Description', true)}</section>
                <div className="flex items-center gap-4"><button className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-bold"><Save size={18} /> Save homepage content</button>{saved && <span className="text-green-700">Saved.</span>}</div>
            </form>
        </div>
    );
};

export default HomepageSectionsEdit;
