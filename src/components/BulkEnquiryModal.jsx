import React, { useState } from 'react';
import { X, Building2, Stethoscope, CheckCircle2, MessageCircle, Send, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const BulkEnquiryModal = ({ isOpen, onClose, initialProductName = '' }) => {
    const [formData, setFormData] = useState({
        organizationName: '',
        contactPerson: '',
        designation: 'Ayurvedic Doctor / BAMS',
        phone: '',
        email: '',
        city: '',
        state: '',
        productInterest: initialProductName || 'Full Ayurvedic Formulation Range',
        estimatedUnits: '50-100 units',
        licenseOrGst: '',
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            setErrorMessage('Please provide a valid 10-digit Indian mobile number.');
            return;
        }

        if (!formData.organizationName.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
            setErrorMessage('Please complete all required clinic and contact fields.');
            return;
        }

        try {
            setIsSubmitting(true);
            const detailedMessage = `[WHOLESALE / CLINIC BULK ENQUIRY]
Organization / Clinic: ${formData.organizationName}
Contact Person: ${formData.contactPerson} (${formData.designation})
City & State: ${formData.city}, ${formData.state}
Product of Interest: ${formData.productInterest}
Estimated Volume: ${formData.estimatedUnits}
AYUSH Registration / GST: ${formData.licenseOrGst || 'Pending verification'}
Clinical Notes: ${formData.notes || 'None provided'}`;

            await api.post('/contact', {
                name: `${formData.contactPerson} (${formData.organizationName})`,
                email: formData.email.trim(),
                phone: `+91${cleanPhone}`,
                category: 'Wholesale / Clinic Bulk',
                source: 'web_bulk_modal',
                message: detailedMessage
            });

            setSubmitSuccess(true);
        } catch (err) {
            console.error('Error submitting bulk inquiry:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to submit enquiry. Please try again or connect via WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsAppEscalation = () => {
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        const text = encodeURIComponent(
            `Namaste Hridved Ayurveda,\n\nI would like to inquire about Doctor/Clinic Wholesale Bulk Orders.\n\n` +
            `• Organization / Clinic: ${formData.organizationName || 'N/A'}\n` +
            `• Contact Doctor / Lead: ${formData.contactPerson || 'Ayurvedic Practitioner'}\n` +
            `• Location: ${formData.city || 'India'}\n` +
            `• Product: ${formData.productInterest}\n` +
            `• Estimated Volume: ${formData.estimatedUnits}\n` +
            `• Mobile: ${cleanPhone ? `+91 ${cleanPhone}` : 'N/A'}\n\n` +
            `Please share clinic verification procedure and wholesale pricing catalogue.`
        );
        window.open(`https://wa.me/919265401508?text=${text}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E5D3B3] flex flex-col relative">
                {/* Header */}
                <div className="p-6 bg-[#053807] text-[#FDFBF7] relative rounded-t-3xl">
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                        aria-label="Close wholesale modal"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                                Practitioner & Clinic Direct
                            </span>
                            <h3 className="text-xl font-serif font-bold text-white">
                                Wholesale & Bulk Enquiries
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                        Supplying authenticated Ayurvedic clinics, wellness resorts, and certified BAMS practitioners directly from our 72-hour classical copper preparation units.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 bg-[#FDFBF7] flex-1">
                    {/* Compliance & Verification Guardrail Notice */}
                    <div className="mb-5 bg-[#053807]/5 border border-[#053807]/15 rounded-2xl p-3.5 flex items-start gap-3">
                        <ShieldCheck size={18} className="text-[#053807] shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-700 leading-relaxed">
                            <span className="font-bold text-[#053807]">Practitioner Verification Notice: </span>
                            Wholesale pricing is subject to Ayush practitioner or clinic GST verification. Custom pricing is never guaranteed until official license confirmation.
                        </div>
                    </div>

                    {submitSuccess ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                                <CheckCircle2 size={36} />
                            </div>
                            <h4 className="text-xl font-serif font-bold text-[#053807]">
                                Enquiry Logged Successfully
                            </h4>
                            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                                Our Ayurvedic wholesale desk has received your details for <strong>{formData.organizationName}</strong>. A dedicated relationship manager will reach out within 24 business hours to verify credentials and share volume terms.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    type="button"
                                    onClick={handleWhatsAppEscalation}
                                    className="px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#1da851] transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <MessageCircle size={16} />
                                    Expedite via WhatsApp Desk
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-[#053807] text-[#FDFBF7] rounded-xl text-xs font-bold hover:bg-[#053807]/90 transition cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {errorMessage && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                                    <AlertTriangle size={16} className="shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Organization / Clinic Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        required
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        placeholder="e.g. AyurVeda Healing Center"
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] focus:ring-1 focus:ring-[#053807] bg-white outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Contact Person & Role *
                                    </label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        required
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        placeholder="e.g. Dr. Rajesh Sharma"
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] focus:ring-1 focus:ring-[#053807] bg-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Professional Designation
                                    </label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                    >
                                        <option value="Ayurvedic Doctor / BAMS">Ayurvedic Doctor / BAMS / MD</option>
                                        <option value="Clinic / Hospital Administrator">Clinic / Hospital Administrator</option>
                                        <option value="Wellness Resort / Spa Director">Wellness Resort / Spa Director</option>
                                        <option value="Licensed Ayurvedic Pharmacy">Licensed Ayurvedic Pharmacy</option>
                                        <option value="Distributor / Wholesale Partner">Distributor / Wholesale Partner</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        10-Digit Mobile Number *
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-bold">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            maxLength={10}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            className="w-full text-xs p-3 rounded-r-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Official Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="doctor@ayurclinic.com"
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        City & State *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Pune, Maharashtra"
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Product of Interest
                                    </label>
                                    <input
                                        type="text"
                                        name="productInterest"
                                        value={formData.productInterest}
                                        onChange={handleChange}
                                        placeholder="Product name or full catalog"
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Estimated Initial Volume
                                    </label>
                                    <select
                                        name="estimatedUnits"
                                        value={formData.estimatedUnits}
                                        onChange={handleChange}
                                        className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                    >
                                        <option value="25-50 units">25 - 50 units (Small Clinic)</option>
                                        <option value="50-100 units">50 - 100 units (Standard Clinic)</option>
                                        <option value="100-250 units">100 - 250 units (Wellness Center)</option>
                                        <option value="250-500 units">250 - 500 units (Hospital / Pharmacy)</option>
                                        <option value="500+ units">500+ units (Regional Distribution)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    AYUSH Practitioner Reg. No. or GSTIN (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="licenseOrGst"
                                    value={formData.licenseOrGst}
                                    onChange={handleChange}
                                    placeholder="e.g. AYUSH-MH-12345 or 27AAAAA0000A1Z5"
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Clinical Requirements / Special Instructions
                                </label>
                                <textarea
                                    name="notes"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Specify formulation strengths, patient requirements, or delivery schedule..."
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#053807] bg-white outline-none"
                                />
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 bg-[#053807] text-[#FDFBF7] font-bold text-xs rounded-xl hover:bg-[#053807]/90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <Send size={15} />
                                    {isSubmitting ? 'Submitting Enquiry...' : 'Submit Wholesale Enquiry'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleWhatsAppEscalation}
                                    className="py-3 px-4 bg-[#25D366] text-white font-bold text-xs rounded-xl hover:bg-[#1da851] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <MessageCircle size={15} />
                                    WhatsApp Desk
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkEnquiryModal;
