import { useState, useContext } from 'react';
import { X, MessageCircle, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppOrderModal = ({ product, isOpen, onClose }) => {
    const { addToast } = useContext(ToastContext) || {};
    
    // Form State
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        mobileNumber: '',
        email: '',
        houseNumber: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!shippingDetails.fullName.trim()) errors.fullName = 'Required';
        if (!shippingDetails.mobileNumber.trim()) errors.mobileNumber = 'Required';
        else if (!/^\d{10}$/.test(shippingDetails.mobileNumber)) errors.mobileNumber = 'Invalid';
        if (!shippingDetails.houseNumber.trim()) errors.houseNumber = 'Required';
        if (!shippingDetails.city.trim()) errors.city = 'Required';
        if (!shippingDetails.state.trim()) errors.state = 'Required';
        if (!shippingDetails.pincode.trim()) errors.pincode = 'Required';
        else if (!/^\d{6}$/.test(shippingDetails.pincode)) errors.pincode = 'Invalid';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            if (addToast) addToast('Please fill all required fields correctly', 'error');
            return;
        }

        setIsProcessingOrder(true);
        try {
            const orderData = {
                orderItems: [{
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    qty: 1, // Assuming 1 for quick order. UI doesn't have qty picker here.
                    weight: product.weight || 0.5
                }],
                shippingAddress: {
                    fullName: shippingDetails.fullName,
                    mobileNumber: shippingDetails.mobileNumber,
                    houseNumber: shippingDetails.houseNumber,
                    landmark: shippingDetails.landmark,
                    city: shippingDetails.city,
                    state: shippingDetails.state,
                    pincode: shippingDetails.pincode
                },
                email: shippingDetails.email,
                itemsPrice: product.price,
                taxPrice: 0, // Quick order might not calc exact taxes here or assume included
                shippingPrice: finalPrice > 999 ? 0 : 50,
                totalPrice: finalPrice + (finalPrice > 999 ? 0 : 50),
                discountAmount: discountAmount
            };

            const { data } = await api.post('/orders/whatsapp', orderData);

            const WHATSAPP_NUMBER = '919537166547';
            const productUrl = `${window.location.origin}/product/${product._id}`;
            const shipping = finalPrice > 999 ? 0 : 50;
            const total = finalPrice + shipping;
            
            let message = `Hello, I want to order this product:\n\n`;
            message += `🛍 *Product:* ${product.name}\n`;
            message += `💰 *Original Price:* ₹${product.price}\n`;
            
            if (appliedPromo) {
                message += `🎟 *Promo Code:* ${appliedPromo.code}\n`;
                message += `📉 *Discount:* -₹${discountAmount.toFixed(2)}\n`;
            }
            if (shipping > 0) message += `🚚 *Shipping:* ₹${shipping}\n`;
            message += `✨ *Final Price:* ₹${total.toFixed(2)}\n\n`;
            
            message += `🔗 *Link:* ${productUrl}\n\n`;
            message += `📦 *Shipping Details:*\n`;
            message += `Name: ${shippingDetails.fullName}\n`;
            message += `Phone: ${shippingDetails.mobileNumber}\n`;
            if (shippingDetails.email) message += `Email: ${shippingDetails.email}\n`;
            message += `Address: ${shippingDetails.houseNumber}${shippingDetails.landmark ? ', ' + shippingDetails.landmark : ''}\n`;
            message += `City: ${shippingDetails.city}\n`;
            message += `State: ${shippingDetails.state}\n`;
            message += `Pincode: ${shippingDetails.pincode}\n\n`;
            message += `💳 *Payment Method:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (Online Payment)'}\n\n`;
            
            if (data._id) {
                message += `📄 Order Ref: ${data._id}\n`;
            }

            message += `Please confirm my order and share further steps.`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
            if (addToast) addToast('Order placed! Redirecting to WhatsApp...', 'success');
            onClose();
        } catch (error) {
            console.error('WhatsApp Checkout Error:', error);
            if (addToast) addToast('Failed to process order. Please try again.', 'error');
        } finally {
            setIsProcessingOrder(false);
        }
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
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name *"
                                    value={shippingDetails.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full border ${formErrors.fullName ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    placeholder="Phone Number *"
                                    value={shippingDetails.mobileNumber}
                                    onChange={handleInputChange}
                                    className={`w-full border ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email (Optional)"
                                    value={shippingDetails.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="houseNumber"
                                    placeholder="Address Line 1 *"
                                    value={shippingDetails.houseNumber}
                                    onChange={handleInputChange}
                                    className={`w-full border ${formErrors.houseNumber ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="landmark"
                                    placeholder="Address Line 2 (Optional)"
                                    value={shippingDetails.landmark}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City *"
                                        value={shippingDetails.city}
                                        onChange={handleInputChange}
                                        className={`w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State *"
                                        value={shippingDetails.state}
                                        onChange={handleInputChange}
                                        className={`w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                    />
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="pincode"
                                    placeholder="Pincode *"
                                    value={shippingDetails.pincode}
                                    onChange={handleInputChange}
                                    className={`w-full border ${formErrors.pincode ? 'border-red-500' : 'border-gray-200'} bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary`}
                                />
                            </div>
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
                            disabled={isProcessingOrder}
                            className="w-full bg-[#25D366] text-white py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-lg hover:bg-[#1da851] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            <MessageCircle size={22} className="text-white fill-current" />
                            {isProcessingOrder ? 'Processing...' : 'Send Order on WhatsApp'}
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
