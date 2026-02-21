import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import { useCart } from '../context/CartContext';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart on success
        if (clearCart) clearCart();
        else localStorage.removeItem('cartItems');
    }, [clearCart]);

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="text-green-600" size={48} />
                    </motion.div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Payment Successful!</h1>
                    <p className="text-gray-500 mb-8">Your order has been placed successfully. Thank you for shopping with us!</p>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex items-center justify-between">
                        <div className="text-left">
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                            <span className="text-sm font-bold text-gray-900">#{orderId?.substring(0, 12)}...</span>
                        </div>
                        <Package className="text-gray-300" size={24} />
                    </div>

                    <div className="space-y-4">
                        <AnimatedButton
                            onClick={() => navigate(`/order/${orderId}`)}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            View Order Details <ArrowRight size={18} />
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

export default PaymentSuccess;
