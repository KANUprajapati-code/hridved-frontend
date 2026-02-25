import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import { CheckCircle, Package, Calendar, Home, Phone, ShoppingBag, List, Check, Truck } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkoutData, resetCheckout } = useCheckout();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get('id') || checkoutData.orderId;

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const response = await api.get(`/checkout/order/${orderId}`);
            setOrderDetails(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }
        fetchOrderDetails();
    }, [orderId, navigate, fetchOrderDetails]);

    const calculateEstimatedDelivery = () => {
        if (!orderDetails) return null;

        const days = parseInt(orderDetails.estimatedDeliveryDays?.split('-')[1]) || 5;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);

        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleContinueShopping = () => {
        resetCheckout();
        navigate('/');
    };

    const handleViewOrder = () => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div className="bg-background min-h-screen py-8">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <CheckoutStepIndicator />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading order details...</p>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    if (!orderDetails) {
        return (
            <AnimatedPage>
                <div className="bg-background min-h-screen py-8">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <CheckoutStepIndicator />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-red-500">
                            <p>Order details not found</p>
                            <AnimatedButton
                                onClick={() => navigate('/')}
                                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg"
                            >
                                Return Home
                            </AnimatedButton>
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

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-6">
                                <CheckCircle size={48} strokeWidth={3} />
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                            <p className="text-gray-600 text-lg">Thank you for your purchase. We&apos;ve received your order.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ScrollReveal>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <Package size={20} className="text-primary" /> Order Details
                                    </h3>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Order ID</span>
                                            <span className="font-mono font-bold text-gray-900">{orderDetails._id}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Order Date</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Payment Status</span>
                                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${orderDetails.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {orderDetails.isPaid ? 'PAID' : 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Shipping Mode</span>
                                            <span className="font-medium text-gray-900">{orderDetails.shippingProvider}</span>
                                        </div>
                                        {orderDetails.waybill && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Waybill</span>
                                                <span className="font-mono font-bold text-primary">{orderDetails.waybill}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Shipping Status</span>
                                            <span className={`font-bold px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700`}>
                                                {orderDetails.shippingStatus || 'Processing'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Estimated Delivery</span>
                                            <span className="font-bold text-primary flex items-center gap-1">
                                                <Calendar size={14} /> {calculateEstimatedDelivery()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase">
                                            <Home size={16} /> Delivery Address
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="font-bold text-gray-900 mb-1">{orderDetails.shippingAddress.fullName}</div>
                                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mb-2 inline-block">
                                                {orderDetails.shippingAddress.addressType}
                                            </span>
                                            <p>{orderDetails.shippingAddress.houseNumber}{orderDetails.shippingAddress.landmark && `, ${orderDetails.shippingAddress.landmark}`}</p>
                                            <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}</p>
                                            <div className="flex items-center gap-2 pt-2 text-gray-700 font-medium">
                                                <Phone size={14} /> {orderDetails.shippingAddress.mobileNumber}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={0.1}>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-primary" /> Items Summary
                                    </h3>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <div className="space-y-4 mb-6">
                                            {orderDetails.orderItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">Qty: {item.qty}</div>
                                                    </div>
                                                    <div className="font-bold text-gray-900 text-sm">
                                                        ₹{(item.price * item.qty).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 text-sm pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₹{orderDetails.itemsPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Shipping</span>
                                                <span>₹{orderDetails.shippingPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                                                <span>Total Paid</span>
                                                <span>₹{orderDetails.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Order Timeline */}
                        <ScrollReveal delay={0.2} className="mt-12">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">What Happens Next?</h3>
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden md:block z-0"></div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                                    {[
                                        { title: 'Confirmed', desc: 'Order placed & confirmed', icon: Check, active: true },
                                        { title: 'Processing', desc: 'We are packing your order', icon: Package, active: false },
                                        { title: 'Shipped', desc: 'On the way to you', icon: Truck, active: false },
                                        { title: 'Delivered', desc: 'Arrives at your doorstep', icon: Home, active: false },
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center bg-white p-4 md:p-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border-4 ${step.active ? 'bg-primary border-primary/30 text-white' : 'bg-gray-100 border-white text-gray-400'}`}>
                                                <step.icon size={20} />
                                            </div>
                                            <div className="font-bold text-gray-900 mb-1">{step.title}</div>
                                            <div className="text-xs text-gray-500 max-w-[150px]">{step.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 pt-8 border-t border-gray-100">
                            <AnimatedButton
                                onClick={handleContinueShopping}
                                className="px-8 py-3 rounded-xl font-bold text-primary border-2 border-primary hover:bg-primary/5 transition-all text-center"
                            >
                                Continue Shopping
                            </AnimatedButton>
                            <AnimatedButton
                                onClick={handleViewOrder}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-primary shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <List size={20} /> View Order Details
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
