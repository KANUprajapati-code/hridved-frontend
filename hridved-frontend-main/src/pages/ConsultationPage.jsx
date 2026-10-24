import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Video, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const defaults = {
    eyebrow: 'CONSULTATION',
    title: 'Talk to us before you choose.',
    description: 'Tell us what you are looking for. We listen, ask a few questions and point you to what suits you.',
    phone: '+919265401508',
    whatsapp: '919265401508',
    whatsappMessage: 'Hi! I would like a consultation before I choose a product.',
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
    ],
    disclaimer: 'Consultations offer general wellness guidance. They do not replace a medical diagnosis or emergency care.'
};

const ConsultationPage = () => {
    const [settings, setSettings] = useState(defaults);
    const [form, setForm] = useState({ name: '', email: '', phone: '', concern: '', duration: '', age: '', details: '', reachBy: 'WhatsApp chat', preferredTime: '' });
    const [status, setStatus] = useState('');
    const [activeFaq, setActiveFaq] = useState(0);

    useEffect(() => {
        api.get('/content').then(({ data }) => {
            if (data.consultation?.data) setSettings((current) => ({ ...current, ...data.consultation.data }));
        }).catch(() => {});
    }, []);

    const submitRequest = async (event) => {
        event.preventDefault();
        setStatus('sending');
        try {
            await api.post('/contact', {
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: `Consultation request\nConcern: ${form.concern}\nSince when: ${form.duration || 'Not specified'}\nAge: ${form.age || 'Not specified'}\nPreferred contact: ${form.reachBy}\nPreferred time: ${form.preferredTime || 'Not specified'}\nDetails: ${form.details}`
            });
            setForm({ name: '', email: '', phone: '', concern: '', duration: '', age: '', details: '', reachBy: 'WhatsApp chat', preferredTime: '' });
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    };

    const whatsappUrl = `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(settings.whatsappMessage || defaults.whatsappMessage)}`;

    return (
        <main className="bg-[#faf9f5] min-h-screen">
            <section className="bg-primary text-white px-4 py-16 md:py-24">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-secondary text-xs font-bold tracking-[.25em] mb-4">{settings.eyebrow}</p>
                    <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">{settings.title}</h1>
                    <p className="text-white/75 text-lg mt-5 max-w-2xl">{settings.description}</p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold"><MessageCircle size={18} /> Start chat</a>
                        <a href={`tel:${String(settings.phone).replace(/\s/g, '')}`} className="inline-flex items-center gap-2 border border-white/40 px-6 py-3 rounded-full font-bold"><Phone size={18} /> Call us</a>
                        <a href="#consult-form" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold">Fill the short form <ArrowRight size={18} /></a>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-14 md:py-20">
                <div className="grid md:grid-cols-3 gap-5">
                    {(settings.ways || defaults.ways).map((way, index) => (
                        <article key={`${way.title}-${index}`} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="w-11 h-11 rounded-full bg-[#f0eee5] text-primary flex items-center justify-center mb-4">{index === 0 ? <MessageCircle /> : index === 1 ? <Video /> : <Phone />}</div>
                            <h2 className="font-bold text-xl text-primary">{way.title}</h2>
                            <p className="text-gray-600 mt-2 leading-relaxed">{way.description}</p>
                            {index === 0 ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-4">Start chat <ArrowRight size={15} /></a> : index === 1 ? <Link to="/book" className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-4">Book a video call <ArrowRight size={15} /></Link> : <a href={`tel:${String(settings.phone).replace(/\s/g, '')}`} className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-4">Call now <ArrowRight size={15} /></a>}
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-white py-14 md:py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <p className="text-center text-xs text-secondary font-bold tracking-[.25em]">WHAT TO EXPECT</p>
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-primary mt-3 mb-10">How a consultation goes</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(settings.steps || defaults.steps).map((step, index) => (
                            <article key={`${step.title}-${index}`} className="border-t-2 border-secondary pt-4">
                                <p className="text-xs text-gray-400 font-bold">STEP {index + 1}</p>
                                <h3 className="font-bold text-primary text-lg mt-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{step.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="consult-form" className="container mx-auto px-4 py-14 md:py-20 max-w-3xl">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
                    <p className="text-xs text-secondary font-bold tracking-[.25em]">TELL US ABOUT YOU</p>
                    <h2 className="text-3xl font-bold text-primary mt-2">Request a consultation</h2>
                    <p className="text-gray-500 mt-2 mb-7">Share a few details and our team will get back to you.</p>
                    {status === 'sent' && <p role="status" className="bg-green-50 text-green-800 p-3 rounded-lg mb-4">Your request was sent. We will be in touch soon.</p>}
                    {status === 'error' && <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">We could not send your request. Please try again or message us on WhatsApp.</p>}
                    <form onSubmit={submitRequest} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <label className="text-sm font-semibold text-gray-700">Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                            <label className="text-sm font-semibold text-gray-700">Mobile number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                        </div>
                        <label className="block text-sm font-semibold text-gray-700">Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                        <label className="block text-sm font-semibold text-gray-700">What is it about?<select required value={form.concern} onChange={(e) => setForm({ ...form, concern: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal"><option value="">Choose one</option>{['Skin', 'Hair & scalp', 'Digestion', 'Sleep & stress', 'Joints & mobility', 'Seasonal care', 'General wellness', 'Something else'].map((option) => <option key={option}>{option}</option>)}</select></label>
                        <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-semibold text-gray-700">Since when? (optional)<select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal"><option value="">Choose one</option>{['A few days', 'A few weeks', 'A few months', 'More than a year'].map((option) => <option key={option}>{option}</option>)}</select></label><label className="block text-sm font-semibold text-gray-700">Age (optional)<input type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label></div>
                        <label className="block text-sm font-semibold text-gray-700">Tell us a little more<textarea required rows="4" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                        <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-semibold text-gray-700">How should we reach you?<select value={form.reachBy} onChange={(e) => setForm({ ...form, reachBy: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal">{['WhatsApp chat', 'Video call', 'Phone call'].map((option) => <option key={option}>{option}</option>)}</select></label><label className="block text-sm font-semibold text-gray-700">A good time (optional)<select value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal"><option value="">Choose one</option>{['Morning', 'Afternoon', 'Evening'].map((option) => <option key={option}>{option}</option>)}</select></label></div>
                        <button disabled={status === 'sending'} className="w-full bg-primary text-white rounded-full p-3 font-bold disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Send my request'}</button>
                    </form>
                    <p className="text-xs text-gray-500 mt-5 flex gap-2"><CheckCircle2 size={15} className="shrink-0" />{settings.disclaimer || defaults.disclaimer}</p>
                </div>
            </section>

            <section className="bg-white py-14 md:py-18">
                <div className="container mx-auto px-4 max-w-3xl"><p className="text-center text-xs text-secondary font-bold tracking-[.25em]">GOOD TO KNOW</p><h2 className="text-center text-3xl font-bold text-primary mt-3 mb-8">Before you consult</h2><div className="divide-y border-y">{(settings.faqs || defaults.faqs).map((faq, index) => <div key={`${faq.title}-${index}`}><button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="w-full text-left py-4 font-bold text-primary flex justify-between gap-4">{faq.title}<span>{activeFaq === index ? '−' : '+'}</span></button>{activeFaq === index && <p className="pb-5 text-gray-600 leading-relaxed">{faq.description}</p>}</div>)}</div></div>
            </section>
        </main>
    );
};

export default ConsultationPage;
