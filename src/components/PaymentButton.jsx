import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import api from '../utils/api';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PaymentButton = ({ 
    amount, 
    orderId, 
    customerDetails = {}, 
    onSuccess, 
    onError, 
    onBeforePayment 
}) => {
    const [loading, setLoading] = useState(false);
    const [rzpKey, setRzpKey] = useState(null);
    const [keyError, setKeyError] = useState(false);

    // Pre-fetch Razorpay Key so it's ready when user clicks
    useEffect(() => {
        const fetchKey = async () => {
            try {
                const { data: keyRes } = await api.get('/razorpay/key');
                if (keyRes && keyRes.success && keyRes.key) {
                    setRzpKey(keyRes.key);
                    setKeyError(false);
                } else {
                    setKeyError(true);
                }
            } catch (err) {
                console.warn("[RAZORPAY] Key endpoint unavailable or unconfigured:", err.message);
                setKeyError(true);
            }
        };
        fetchKey();
    }, []);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Ensure Razorpay script is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded || !window.Razorpay) {
                throw new Error("Unable to load secure payment gateway. Please check your internet connection.");
            }

            let currentOrderId = orderId;
            if (onBeforePayment) {
                const result = await onBeforePayment();
                if (!result) return;
                currentOrderId = result._id;
            }

            // 1. Get Razorpay Key from state (pre-fetched) or fallback fetch
            let key = rzpKey;
            if (!key) {
                const { data: keyRes } = await api.get('/razorpay/key');
                key = keyRes.key;
            }

            if (!key) {
                throw new Error("Razorpay gateway keys are not configured on the server.");
            }

            // 2. Create Razorpay Order on server
            const { data: orderRes } = await api.post('/razorpay/order', {
                amount,
                currency: 'INR',
                receipt: `receipt_${currentOrderId}`
            });
            const orderData = orderRes.data;

            // 3. Pre-save Razorpay Order ID to DB
            try {
                await api.patch(`/razorpay/pre-save/${currentOrderId}`, {
                    razorpayOrderId: orderData.id
                });
            } catch (preSaveError) {
                console.warn('Pre-save reference warning:', preSaveError.message);
            }

            // 4. Initialize Razorpay Modal with locked brand color #053807
            const options = {
                key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "HRIDVED AYURVEDA",
                description: "Holistic Health & Classical Formulations",
                image: "/logo-asset4.png",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 5. Verify Payment Signature on Backend (HMAC-SHA256)
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
                            throw new Error(verifyData.message || "Payment verification failed");
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        if (onError) onError(err.response?.data?.message || err.message);
                        window.location.href = `/payment-failed?id=${currentOrderId}`;
                    }
                },
                prefill: {
                    name: customerDetails.name || "Customer",
                    email: customerDetails.email || "",
                    contact: customerDetails.phone ? customerDetails.phone.replace(/\D/g, '').slice(-10) : ""
                },
                theme: {
                    color: "#053807" // Locked Brand Forest Green
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        console.log("Payment modal dismissed by user.");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed:", response.error);
                if (onError) onError(response.error.description);
                window.location.href = `/payment-failed?id=${currentOrderId}`;
            });

            rzp.open();

        } catch (error) {
            console.error("Payment Initiation Failed:", error);
            const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
            if (onError) onError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (keyError) {
        return (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle size={15} />
                    <span>Razorpay Credentials Required</span>
                </div>
                <p>
                    Server credentials (<code className="bg-amber-100 px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code>) are pending setup in backend <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>. You can complete your order using Cash on Delivery (COD) below.
                </p>
            </div>
        );
    }

    return (
        <AnimatedButton
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed border-none cursor-pointer"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    Initiating Secure Gateway...
                </>
            ) : (
                <>
                    Pay Online ₹{amount.toLocaleString()} <ArrowRight size={18} />
                </>
            )}
        </AnimatedButton>
    );
};

export default PaymentButton;
