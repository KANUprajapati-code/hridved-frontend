import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Privacy Policy</h1>
                    <p className="text-xl opacity-90">Effective Date: October 26, 2023</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

                    <div className="prose prose-lg text-gray-600 max-w-none">
                        <p className="lead text-xl text-gray-700 font-medium mb-8">
                            At HRIDVED, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or purchase our Ayurvedic products.
                        </p>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <Eye size={28} />
                                <h2 className="text-2xl font-serif font-bold m-0">1. Information We Collect</h2>
                            </div>
                            <p>We collect information that you provide securely to us, such as:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Personal identification information (Name, email address, phone number, etc.)</li>
                                <li>Shipping and billing addresses.</li>
                                <li>Payment information (processed securely through our payment partners).</li>
                                <li>Order history and preferences.</li>
                            </ul>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <FileText size={28} />
                                <h2 className="text-2xl font-serif font-bold m-0">2. How We Use Your Information</h2>
                            </div>
                            <p>We use your data to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Process and fulfill your orders.</li>
                                <li>Communicate with you regarding your order status.</li>
                                <li>Send you promotional emails and newsletters (only if subscribed).</li>
                                <li>Improve our website and customer service.</li>
                            </ul>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <Shield size={28} />
                                <h2 className="text-2xl font-serif font-bold m-0">3. Data Protection</h2>
                            </div>
                            <p>
                                We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <Lock size={28} />
                                <h2 className="text-2xl font-serif font-bold m-0">4. Third-Party Disclosure</h2>
                            </div>
                            <p>
                                We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Contact Us</h3>
                            <p>
                                If there are any questions regarding this privacy policy, you may contact us using the information below:
                            </p>
                            <p className="mt-2 text-primary font-bold">support@hridved.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
