import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Phone, Mail, Clock, MessageCircle, 
    CheckCircle2, AlertCircle, Sparkles, Send, 
    HelpCircle, Package, RotateCcw, Stethoscope, 
    Briefcase, ArrowLeft, ShieldCheck
} from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/SEO';

const WHATSAPP_PHONE = '918980411390';

const INQUIRY_CATEGORIES = [
    { id: 'product', label: 'Product Questions', icon: <HelpCircle size={15} />, prefix: 'Product Formulation Question' },
    { id: 'delivery', label: 'Delivery & Shipping', icon: <Package size={15} />, prefix: 'Order & Shipping Issue' },
    { id: 'returns', label: 'Returns & Refunds', icon: <RotateCcw size={15} />, prefix: 'Return / Replacement Request' },
    { id: 'consultation', label: 'Doctor Consultation', icon: <Stethoscope size={15} />, prefix: 'Ayurvedic Vaidya Consultation' },
    { id: 'wholesale', label: 'Bulk & Doctor Enquiry', icon: <Briefcase size={15} />, prefix: 'Clinic / Bulk Purchase Inquiry' },
];

const ContactPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('product');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'

    const activeCatObj = INQUIRY_CATEGORIES.find(c => c.id === selectedCategory) || INQUIRY_CATEGORIES[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);

        try {
            const formattedMessage = `[Category: ${activeCatObj.prefix}]${orderNumber ? ` [Order Ref: #${orderNumber}]` : ''} ${message}`;
            await api.post('/contact', {
                name,
                email,
                phone,
                message: formattedMessage,
            });
            setStatus('success');
            setMessage('');
            setOrderNumber('');
        } catch (error) {
            console.error('Failed to send contact inquiry:', error);
            setStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenWhatsApp = () => {
        const orderPart = orderNumber.trim() ? ` regarding Order #${orderNumber.trim()}` : '';
        const namePart = name.trim() ? ` My name is ${name.trim()}.` : '';
        const text = `Namaste Hridved, I have a ${activeCatObj.prefix}${orderPart}.${namePart} ${message ? `Query: ${message}` : 'Please assist me.'}`;
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-8 sm:py-14">
            <SEO
                title="Contact & Customer Care"
                description="Reach our Ayurvedic wellness desk, track delivery issues, request return assistance, or schedule a Vaidya consultation."
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Contact & Support', path: '/contact' }
                ]}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Back to Home */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </Link>

                {/* Page Heading */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                        <Sparkles size={14} className="text-secondary" /> Dedicated Assistance
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
                        Customer Support & Wellness Desk
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl mx-auto">
                        Whether you need guidance on Ayurvedic rasayanas, tracking support, or clinical advice, our dedicated team is here to assist.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Official Details & WhatsApp Strip */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Instant WhatsApp Priority Box */}
                        <div className="bg-[#053807] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-2 text-secondary text-xs uppercase font-bold tracking-widest mb-2">
                                <MessageCircle size={15} /> Instant Response
                            </div>
                            <h3 className="text-xl font-serif font-bold leading-snug">
                                Chat with Support on WhatsApp
                            </h3>
                            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                                Get instantaneous resolution for order tracking, dosage advice, and prescription questions directly from our desk.
                            </p>

                            <button
                                type="button"
                                onClick={handleOpenWhatsApp}
                                className="mt-5 w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                <MessageCircle size={16} />
                                <span>Open WhatsApp Chat (+91 89804 11390)</span>
                            </button>
                        </div>

                        {/* Verified Contact Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 space-y-5">
                            <h4 className="text-sm uppercase font-bold text-gray-400 tracking-wider">
                                Official Contact Information
                            </h4>

                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-accent/20 text-primary shrink-0 mt-0.5">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-gray-900">Apothecary & Registered Office</h5>
                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                        HRIDVED AYURVEDA, 1st Floor, Girishbhai Hospital Complex, Ahmedabad-Himatnagar Highway, Approach Road, Prantij, Gujarat - 383205
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-accent/20 text-primary shrink-0 mt-0.5">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-gray-900">Direct Customer Helpline</h5>
                                    <p className="text-xs text-primary font-bold mt-0.5 font-mono">
                                        +91 89804 11390
                                    </p>
                                    <p className="text-[11px] text-gray-400">Available on Call & WhatsApp</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-accent/20 text-primary shrink-0 mt-0.5">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-gray-900">Official Email Support</h5>
                                    <a
                                        href="mailto:hridved.customercare@gmail.com"
                                        className="text-xs text-primary font-bold hover:underline mt-0.5 block"
                                    >
                                        hridved.customercare@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 pt-2 border-t border-gray-100">
                                <div className="p-2.5 rounded-xl bg-accent/20 text-primary shrink-0 mt-0.5">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-gray-900">Desk Working Hours</h5>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Monday – Saturday: 9:00 AM – 7:00 PM IST
                                    </p>
                                    <p className="text-[11px] text-gray-400">Closed on Gazetted National Holidays</p>
                                </div>
                            </div>
                        </div>

                        {/* Purity & Trust Assurance */}
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
                            <p className="text-[11px] text-emerald-900 leading-relaxed">
                                All clinical advice is provided by certified Ayurvedic B.A.M.S. practitioners adhering to Classical Ayurvedic texts.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Multi-Category Interactive Form */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-xl font-serif font-bold text-primary">
                                Send a Structured Support Request
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Select an inquiry category so your request routes immediately to the appropriate team.
                            </p>
                        </div>

                        {/* Category Selector Chips */}
                        <div className="mb-6">
                            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Select Inquiry Topic
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {INQUIRY_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all text-left ${
                                            selectedCategory === cat.id
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary'
                                        }`}
                                    >
                                        <span className={selectedCategory === cat.id ? 'text-secondary' : 'text-gray-400'}>
                                            {cat.icon}
                                        </span>
                                        <span className="line-clamp-1">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Banners */}
                        <AnimatePresence>
                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-3"
                                >
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                                    <div>
                                        <span className="font-bold">Thank you! Your message has been received.</span>
                                        <p className="mt-0.5">Our support desk will respond via email or phone within 24 business hours.</p>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-3"
                                >
                                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                                    <span>Failed to submit message. Please try again or chat with us directly on WhatsApp.</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Vaidya / Customer Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Mobile Number (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Order ID (If Applicable)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 672f... or HRD..."
                                        value={orderNumber}
                                        onChange={(e) => setOrderNumber(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Detailed Message *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder={`Please describe your ${activeCatObj.label.toLowerCase()} in detail...`}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
                                />
                            </div>

                            {/* Dual Submit Actions */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-primary hover:bg-[#07470a] text-white py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {submitting ? (
                                        <span>Submitting...</span>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            <span>Submit Support Request</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenWhatsApp}
                                    className="bg-accent/20 hover:bg-accent/30 text-primary border border-primary/20 py-3.5 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    title="Send this query directly via WhatsApp"
                                >
                                    <MessageCircle size={15} className="text-[#25D366]" />
                                    <span>Send via WhatsApp</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
