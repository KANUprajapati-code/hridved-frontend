import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import api from '../utils/api';

const PaymentButton = ({ amount, orderId, onSuccess, onError, onBeforePayment }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            let currentOrderId = orderId;
            if (onBeforePayment) {
                const result = await onBeforePayment();
                if (!result) return;
                currentOrderId = result._id;
            }

            // 1. Get Razorpay Key
            const { data: keyRes } = await api.get('/razorpay/key');
            const key = keyRes.key;

            // 2. Create Razorpay Order
            const { data: orderRes } = await api.post('/razorpay/order', {
                amount,
                currency: 'INR',
                receipt: `receipt_${currentOrderId}`
            });
            const orderData = orderRes.data;

            // 3. Pre-save Razorpay Order ID to DB so webhook can find the order
            //    This is CRITICAL for QR payments where browser may close before handler fires
            try {
                await api.patch(`/razorpay/pre-save/${currentOrderId}`, {
                    razorpayOrderId: orderData.id
                });
            } catch (preSaveError) {
                console.error('Pre-save Error:', preSaveError);
                // Non-fatal - continue with payment
            }

            // 4. Initialize Razorpay Modal
            const options = {
                key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "HRIDVED",
                description: "Ayurvedic Health & Wellness",
                image: "/logo-asset4.png",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment on Backend
                        const { data: verifyData } = await api.post('/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: currentOrderId
                        });

                        if (verifyData.success) {
                            if (onSuccess) onSuccess(verifyData);
                            window.location.href = `/checkout/success?id=${currentOrderId}`;
                        } else {
                            throw new Error(verifyData.message || "Verification failed");
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        if (onError) onError(err.response?.data?.message || err.message);
                        window.location.href = '/checkout/failed';
                    }
                },
                prefill: {
                    name: "User Name", // Ideally pass from props
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2D5A27" // Brand primary color
                },
                config: {
                    display: {
                        hide: [
                            { method: 'upi', flow: 'qr' },
                            { method: 'qr' }
                        ],
                        blocks: {
                            banks: {
                                name: 'Pay via Card/Netbanking',
                                instruments: [
                                    {
                                        method: 'card'
                                    },
                                    {
                                        method: 'netbanking'
                                    }
                                ]
                            },
                        },
                        sequence: ['block.banks', 'upi'],
                        preferences: {
                            show_default_blocks: true,
                        },
                    },
                    methods: {
                        upi: {
                            flow: ['intent', 'collect'],
                        }
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed:", response.error);
                if (onError) onError(response.error.description);
                window.location.href = '/checkout/failed';
            });

            rzp.open();

        } catch (error) {
            console.error("Payment Initiation Failed:", error);
            if (onError) onError(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedButton
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed border-none"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                </>
            ) : (
                <>
                    Pay ₹{amount.toLocaleString()} <ArrowRight size={20} />
                </>
            )}
        </AnimatedButton>
    );
};

export default PaymentButton;
