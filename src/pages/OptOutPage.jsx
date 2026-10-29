import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Mail, Phone, BellOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import SEO from '../components/SEO';

const OptOutPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [reason, setReason] = useState('UNSUBSCRIBE');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = identifier.trim();
        if (!trimmed) return;

        setSubmitting(true);
        setStatus(null);

        try {
            const isEmail = trimmed.includes('@');
            const payload = isEmail 
                ? { email: trimmed, reason } 
                : { phone: trimmed.replace(/\D/g, '').slice(-10), reason };

            const { data } = await api.post('/notifications/opt-out', payload);

            setStatus('success');
            setMessage(data.message || 'You have been successfully unsubscribed.');
            setIdentifier('');
        } catch (error) {
            console.error('Opt out error:', error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to register preference. Please try again or contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatedPage>
            <SEO
                title="Communication Preferences & Opt-Out"
                description="Manage your notification preferences or unsubscribe from Hridved promotional and reminder messages."
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Communications Preference', path: '/opt-out' }
                ]}
                noIndex={true}
            />
            <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 font-body">
                <div className="max-w-md mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition"
                    >
                        <ArrowLeft size={14} /> Back to Store
                    </Link>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-secondary/30">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-primary flex items-center justify-center mb-5">
                            <BellOff size={22} className="text-secondary" />
                        </div>

                        <h1 className="text-2xl font-serif font-bold text-primary mb-2">Communication Preferences</h1>
                        <p className="text-xs text-gray-600 leading-relaxed mb-6">
                            Classical Ayurveda values mindful living and tranquility. If you prefer not to receive automated WhatsApp reminders, promotional SMS, or abandoned cart notifications, please enter your details below.
                        </p>

                        {status === 'success' ? (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                                <div className="flex items-center gap-2 font-bold text-emerald-800">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    <span>Preferences Updated</span>
                                </div>
                                <p>{message}</p>
                                <p className="text-[11px] text-emerald-700">
                                    You will continue to receive essential transactional order updates (e.g. verified dispatch and delivery tracking) for any active purchases.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1.5">
                                        Mobile Number or Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="10-digit mobile (e.g. 9876543210) or email"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-gray-900 bg-[#FDFBF7]"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                        Enter the contact detail you used during browsing or checkout.
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1.5">
                                        Reason (Optional)
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-gray-800 bg-[#FDFBF7]"
                                    >
                                        <option value="TOO_FREQUENT">Messages are too frequent</option>
                                        <option value="NOT_INTERESTED">No longer interested in herbal reminders</option>
                                        <option value="ALREADY_PURCHASED">Already purchased in store/clinic</option>
                                        <option value="UNSUBSCRIBE">General unsubscribe</option>
                                    </select>
                                </div>

                                {status === 'error' && (
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-600 shrink-0" />
                                        <span>{message}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting || !identifier.trim()}
                                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? 'Updating Preferences...' : 'Unsubscribe / Opt Out'}
                                </button>

                                <div className="pt-2 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} className="text-secondary" />
                                    <span>Immediate suppression across all automated messaging</span>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default OptOutPage;
