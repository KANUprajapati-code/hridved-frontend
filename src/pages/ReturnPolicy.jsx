import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';

const ReturnPolicy = () => {
    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <ScrollReveal>
                        <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Return & Refund Policy</h1>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-gray-700 leading-relaxed">
                            <p className="italic text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

                            <section>
                                <h2 className="text-xl font-bold text-primary mb-3">1. Returns</h2>
                                <p>
                                    At HRIDVED, we are committed to providing you with the highest quality Ayurvedic products.
                                    However, if you are not satisfied with your purchase, we are here to help.
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                                    <li>You have <strong>7 calendar days</strong> to return an item from the date you received it.</li>
                                    <li>To be eligible for a return, your item must be unused and in the same condition that you received it.</li>
                                    <li>Your item must be in the original packaging.</li>
                                    <li>Your item must have the receipt or proof of purchase.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-primary mb-3">2. Refunds</h2>
                                <p>
                                    Once we receive your item, we will inspect it and notify you that we have received your returned item.
                                    We will immediately notify you on the status of your refund after inspecting the item.
                                </p>
                                <p className="mt-2">
                                    If your return is approved, we will initiate a refund to your credit card (or original method of payment).
                                    You will receive the credit within a certain amount of days, depending on your card issuer's policies.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-primary mb-3">3. Shipping</h2>
                                <p>
                                    You will be responsible for paying for your own shipping costs for returning your item.
                                    Shipping costs are non-refundable.
                                </p>
                                <p className="mt-2">
                                    If you receive a refund, the cost of return shipping will be deducted from your refund.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-primary mb-3">4. Damaged or Defective Items</h2>
                                <p>
                                    If you received a damaged or defective product, please contact us immediately at <strong>support@hridved.com</strong>
                                    with details of the product and the defect. We will arrange for a replacement or a full refund.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-primary mb-3">5. Contact Us</h2>
                                <p>
                                    If you have any questions on how to return your item to us, contact us.
                                </p>
                            </section>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ReturnPolicy;
