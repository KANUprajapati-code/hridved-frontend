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

            const { data: redirectUrl } = await api.post('/payment/create', {
                amount,
                orderId: currentOrderId
            });

            // Redirect to PhonePe
            window.location.href = redirectUrl;
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
