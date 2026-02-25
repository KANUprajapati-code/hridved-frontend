import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';

const ShippingPolicy = () => {
    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background pb-12">
                {/* Header */}
                <div className="bg-primary text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shipping Policy</h1>
                        <p className="text-xl opacity-90">Reliable & Transparent Delivery</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <div className="prose prose-lg text-gray-600 max-w-none">
                            <p className="lead text-xl text-gray-700 font-medium mb-8 text-center">
                                We strive to deliver your Ayurvedic wellness products in the shortest time possible, ensuring they reach you in perfect condition.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-background/50 p-6 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-3 text-primary mb-4">
                                        <Truck size={24} />
                                        <h3 className="text-xl font-serif font-bold m-0 text-primary">Shipping Rates</h3>
                                    </div>
                                    <p className="text-sm">
                                        We offer <strong>FREE SHIPPING</strong> on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹50 is applicable.
                                    </p>
                                </div>

                                <div className="bg-background/50 p-6 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-3 text-primary mb-4">
                                        <Clock size={24} />
                                        <h3 className="text-xl font-serif font-bold m-0 text-primary">Delivery Timeline</h3>
                                    </div>
                                    <p className="text-sm">
                                        Standard delivery takes <strong>3 to 7 business days</strong> across India. Orders are usually dispatched within 24-48 hours.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <MapPin size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">1. Order Tracking</h2>
                                </div>
                                <p>
                                    Once your order is shipped, you will receive an email and SMS with the tracking information. You can also track your order directly on our website using the "Track Order" link in the footer or your account profile.
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <ShieldCheck size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">2. Secure Packaging</h2>
                                </div>
                                <p>
                                    All our Ayurvedic products are packaged with care to prevent any damage during transit. We use eco-friendly materials wherever possible to ensure your products arrive safely and sustainably.
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <HelpCircle size={28} className="hidden" />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">3. Delivery Areas</h2>
                                </div>
                                <p>
                                    We deliver to almost all pincodes across India. If we are unable to deliver to your location due to courier restrictions, we will notify you and provide a full refund.
                                </p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Need Assistance?</h3>
                                <p>
                                    If you have any questions regarding your shipment, please reach out to our support team:
                                </p>
                                <p className="mt-2 text-primary font-bold font-serif">hridvedpharama@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

// Internal HelpCircle fix for the icon used above
const HelpCircle = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export default ShippingPolicy;
