import React from 'react';
import { FileText, Shield, AlertCircle, HelpCircle } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';

const TermsAndConditions = () => {
    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background pb-12">
                {/* Header */}
                <div className="bg-primary text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Terms and Conditions</h1>
                        <p className="text-xl opacity-90">Effective Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <div className="prose prose-lg text-gray-600 max-w-none">
                            <p className="lead text-xl text-gray-700 font-medium mb-8">
                                Welcome to HRIDVED. These terms and conditions outline the rules and regulations for the use of HRIDVED's Website, located at hridved.in.
                            </p>

                            <div className="mb-8 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <FileText size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">1. Acceptable Use</h2>
                                </div>
                                <p>
                                    By accessing this website, we assume you accept these terms and conditions. Do not continue to use HRIDVED if you do not agree to take all of the terms and conditions stated on this page.
                                </p>
                            </div>

                            <div className="mb-8 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Shield size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">2. Intellectual Property</h2>
                                </div>
                                <p>
                                    Unless otherwise stated, HRIDVED and/or its licensors own the intellectual property rights for all material on HRIDVED. All intellectual property rights are reserved. You may access this from HRIDVED for your own personal use subjected to restrictions set in these terms and conditions.
                                </p>
                                <p className="mt-4">You must not:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-2">
                                    <li>Republish material from HRIDVED</li>
                                    <li>Sell, rent or sub-license material from HRIDVED</li>
                                    <li>Reproduce, duplicate or copy material from HRIDVED</li>
                                    <li>Redistribute content from HRIDVED</li>
                                </ul>
                            </div>

                            <div className="mb-8 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <AlertCircle size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">3. User Obligations</h2>
                                </div>
                                <p>
                                    You must be at least 18 years of age to use this website. By using this website and by agreeing to these terms and conditions, you warrant and represent that you are at least 18 years of age.
                                </p>
                                <p className="mt-4">
                                    You agree to provide true, accurate, current, and complete information about yourself as prompted by the checkout process.
                                </p>
                            </div>

                            <div className="mb-8 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <HelpCircle size={28} />
                                    <h2 className="text-2xl font-serif font-bold m-0 text-primary">4. Governing Law</h2>
                                </div>
                                <p>
                                    These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Kerala.
                                </p>
                            </div>

                            <div className="mt-12 pt-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Liability Disclaimer</h3>
                                <p className="text-sm">
                                    HRIDVED shall not be held responsible for any damage or loss caused by the use of products purchased from this website. Ayurvedic products should be used under the guidance of a qualified expert.
                                </p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Contact Us</h3>
                                <p>
                                    If you have any questions about our Terms and Conditions, please contact us at:
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

export default TermsAndConditions;
