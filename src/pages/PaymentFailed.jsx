import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <XCircle className="text-red-500" size={48} />
                    </motion.div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Payment Failed</h1>
                    <p className="text-gray-500 mb-8">We couldn't process your payment. Please try again or use a different payment method.</p>

                    <div className="bg-orange-50 rounded-2xl p-4 mb-8 border border-orange-100 flex items-center gap-3 text-left">
                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                        <p className="text-xs text-orange-700 font-medium">Don't worry, if your money was debited, it will be refunded within 5-7 business days.</p>
                    </div>

                    <div className="space-y-4">
                        <AnimatedButton
                            onClick={() => navigate('/checkout/payment')}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <RefreshCcw size={18} /> Retry Payment
                        </AnimatedButton>
                        <AnimatedButton
                            onClick={() => navigate('/')}
                            className="w-full bg-white text-gray-600 border border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            <Home size={18} /> Back to Home
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default PaymentFailed;
