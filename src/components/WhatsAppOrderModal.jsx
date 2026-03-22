import { useState, useContext } from 'react';
import { X, MessageCircle, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppOrderModal = ({ product, isOpen, onClose }) => {
    const { addToast } = useContext(ToastContext) || {};
    
    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    
    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    if (!isOpen || !product) return null;

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setApplyingPromo(true);
        setPromoError('');
        try {
            const { data } = await api.post('/coupons/validate', {
                code: promoCode,
                cartTotal: product.price
            });
            setAppliedPromo(data);
            if (addToast) addToast(`Promo code applied successfully!`, 'success');
        } catch (error) {
            setPromoError(error.response?.data?.message || 'Invalid or expired promo code');
            setAppliedPromo(null);
        } finally {
            setApplyingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    // Calculate final price
    let finalPrice = product.price;
    let discountAmount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discountAmount = (product.price * appliedPromo.discount) / 100;
        } else {
            discountAmount = appliedPromo.discount;
        }
        finalPrice = Math.max(0, product.price - discountAmount);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name || !phone || !address) {
            if (addToast) addToast('Please fill all required fields', 'error');
            return;
        }

        const WHATSAPP_NUMBER = '917990411390';
        const productUrl = `${window.location.origin}/product/${product._id}`;
        
        let message = `Hello, I want to order this product:\n\n`;
        message += `🛍 *Product:* ${product.name}\n`;
        message += `💰 *Original Price:* ₹${product.price}\n`;
        
        if (appliedPromo) {
            message += `🎟 *Promo Code:* ${appliedPromo.code}\n`;
            message += `📉 *Discount:* -₹${discountAmount.toFixed(2)}\n`;
            message += `✨ *Final Price:* ₹${finalPrice.toFixed(2)}\n`;
        }
        
        message += `🔗 *Link:* ${productUrl}\n\n`;
        message += `*--- Customer Details ---*\n`;
        message += `👤 *Name:* ${name}\n`;
        message += `📞 *Phone:* ${phone}\n`;
        message += `🏠 *Address:* ${address}\n`;
        message += `💳 *Payment Method:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (Online Payment)'}\n\n`;
        message += `Please confirm my order and share further steps.`;

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-20">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle size={24} className="text-[#25D366]" />
                        Complete Your Order
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Product Summary */}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="font-black text-primary">₹{finalPrice}</span>
                                {appliedPromo && <span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Delivery Details</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number *</label>
                                <input 
                                    type="tel" 
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Complete Address *</label>
                            <textarea 
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows="3"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm resize-none"
                                placeholder="House/Flat No, Street, City, State, Pincode"
                            ></textarea>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Ticket size={16} className="text-primary" /> Promo Code
                        </h4>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                disabled={appliedPromo !== null}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary uppercase font-bold text-sm"
                                placeholder="ENTER CODE"
                            />
                            {appliedPromo ? (
                                <button 
                                    type="button"
                                    onClick={handleRemovePromo}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors"
                                >
                                    Remove
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={handleApplyPromo}
                                    disabled={!promoCode || applyingPromo}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {applyingPromo ? '...' : 'Apply'}
                                </button>
                            )}
                        </div>
                        
                        {promoError && (
                            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                                <AlertCircle size={12} /> {promoError}
                            </p>
                        )}
                        {appliedPromo && (
                            <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> Code applied! You save ₹{discountAmount.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Payment Method</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="COD" 
                                    className="hidden" 
                                    checked={paymentMethod === 'COD'} 
                                    onChange={() => setPaymentMethod('COD')} 
                                />
                                <span className="font-bold text-sm">Cash on Delivery</span>
                            </label>
                            
                            <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'Prepaid' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="Prepaid" 
                                    className="hidden" 
                                    checked={paymentMethod === 'Prepaid'} 
                                    onChange={() => setPaymentMethod('Prepaid')} 
                                />
                                <span className="font-bold text-sm">Prepaid / Online</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 mt-2 border-t border-gray-100">
                        <button 
                            type="submit"
                            className="w-full bg-[#25D366] text-white py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-lg hover:bg-[#1da851] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            <MessageCircle size={22} className="text-white fill-current" />
                            Send Order on WhatsApp
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            You will be redirected to WhatsApp to confirm this order.
                        </p>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default WhatsAppOrderModal;
