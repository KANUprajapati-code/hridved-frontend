import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import { Truck, MapPin, Check, ChevronLeft, ArrowRight } from 'lucide-react';

export default function CheckoutShippingPage() {
    const navigate = useNavigate();
    const { cart } = useCart();
    const { checkoutData, updateShippingMethod, updateStep, setErrorMessage, clearError, setShippingOptions } = useCheckout();

    const [selectedMethod, setSelectedMethod] = useState(checkoutData.shippingMethod || null);
    const [shippingOptions, setLocalShippingOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!checkoutData.address) {
            navigate('/checkout/address');
            return;
        }

        fetchShippingRates();
    }, [checkoutData.address, navigate]);

    const fetchShippingRates = React.useCallback(async () => {
        try {
            setLoading(true);
            clearError();
            const { data } = await api.post('/shipping/serviceability', {
                pincode: checkoutData.address.pincode,
                weight: 0.5,
            });
            setLocalShippingOptions(data.shippingOptions || []);
            setShippingOptions(data.shippingOptions || []);

            // Auto-select first option
            if (data.shippingOptions && data.shippingOptions.length > 0) {
                if (!checkoutData.shippingMethod) {
                    setSelectedMethod(data.shippingOptions[0].type);
                }
            }
        } catch (error) {
            console.error('Error fetching shipping rates:', error);
            setErrorMessage('Failed to load shipping options');
            // Set default options on error
            const defaultOptions = [
                {
                    type: 'Standard',
                    days: '3-5',
                    charge: 40,
                    description: 'Standard Delivery (3-5 days)',
                },
                {
                    type: 'Express',
                    days: '1-2',
                    charge: 100,
                    description: 'Express Delivery (1-2 days)',
                }
            ];
            setLocalShippingOptions(defaultOptions);
            setShippingOptions(defaultOptions);
            if (!checkoutData.shippingMethod) {
                setSelectedMethod('Standard');
            }
        } finally {
            setLoading(false);
        }
    }, [checkoutData.address, checkoutData.shippingMethod, clearError, setErrorMessage, setShippingOptions]);

    const handleContinue = async () => {
        if (!selectedMethod) {
            setErrorMessage('Please select a shipping method');
            return;
        }

        try {
            setSubmitting(true);
            clearError();

            const selectedShipping = shippingOptions.find(s => s.type === selectedMethod);
            if (selectedShipping) {
                updateShippingMethod(selectedMethod, selectedShipping.charge);
                updateStep(3);
                navigate('/checkout/payment');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Failed to proceed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div className="bg-background min-h-screen py-8">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <CheckoutStepIndicator />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading shipping options...</p>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="bg-background min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <CheckoutStepIndicator />

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">Shipping Method</h1>

                        {/* Delivery Address Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 md:p-6 mb-8 border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                    <MapPin size={16} /> Delivering to:
                                </h3>
                                <div>
                                    <div className="font-bold text-gray-900">{checkoutData.address?.fullName}</div>
                                    <div className="text-sm text-gray-600">
                                        {checkoutData.address?.houseNumber}
                                        {checkoutData.address?.landmark && `, ${checkoutData.address.landmark}`},
                                        {checkoutData.address?.city}, {checkoutData.address?.state} - {checkoutData.address?.pincode}
                                    </div>
                                </div>
                            </div>
                            <AnimatedButton
                                onClick={() => navigate('/checkout/address')}
                                className="text-primary font-bold text-sm hover:underline border-none p-0 bg-transparent flex items-center gap-1"
                            >
                                Change
                            </AnimatedButton>
                        </div>

                        {/* Shipping Methods */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Truck size={18} className="text-primary" /> Select Shipping Method
                            </h2>

                            {shippingOptions.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center text-yellow-800">
                                    <p>No shipping options available for this pincode.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {shippingOptions.map((option, index) => (
                                        <ScrollReveal key={option.type} delay={index * 0.1}>
                                            <div
                                                className={`border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all flex items-center gap-4 ${selectedMethod === option.type
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedMethod(option.type)}
                                            >
                                                <div className="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300">
                                                    {selectedMethod === option.type && (
                                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{option.description}</div>
                                                            <div className="text-sm text-gray-500">Estimated delivery in {option.days} days</div>
                                                        </div>
                                                        <div className="text-xl font-bold text-primary">
                                                            {option.charge === 0 ? 'Free' : `₹${option.charge}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        {cart?.cartItems && cart.cartItems.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 max-w-md ml-auto">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Price Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className={checkoutData.shippingCost === 0 ? 'text-green-600' : ''}>
                                            {checkoutData.shippingCost === 0 ? 'Free' : `₹${checkoutData.shippingCost}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (18%)</span>
                                        <span>₹{(Math.round(cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) * 0.18 * 100) / 100).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                                        <span>Total</span>
                                        <span>₹{(cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) + (checkoutData.shippingCost || 0) + (Math.round(cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) * 0.18 * 100) / 100)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex flex-col-reverse md:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
                            <AnimatedButton
                                onClick={() => navigate('/checkout/address')}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200 flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={20} /> Back to Address
                            </AnimatedButton>

                            <AnimatedButton
                                onClick={handleContinue}
                                disabled={!selectedMethod || submitting}
                                className="px-8 bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:bg-gray-300 disabled:cursor-not-allowed border-none flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
