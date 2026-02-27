
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';


import { Truck } from 'lucide-react';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ orderId, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order/${orderId}`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else {
            // Re-fetch order status to confirm
            setMessage('Payment Processed');
            onSuccess();
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />
            {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full bg-primary text-white py-3 rounded mt-4 hover:bg-opacity-90 transition font-bold disabled:opacity-50"
            >
                <span id="button-text">
                    {isProcessing ? "Processing ... " : "Pay Now"}
                </span>
            </button>
        </form>
    );
};

const OrderPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Stripe State
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);

                // If order is not paid and method is Stripe, setup Stripe
                if (!data.isPaid && data.paymentMethod === 'Stripe') {
                    // Get Publishable Key
                    const { data: publishableKey } = await api.get('/config/stripe');
                    setStripePromise(loadStripe(publishableKey));

                    // Create Payment Intent
                    const { data: intentData } = await api.post('/payment/create-payment-intent', {
                        amount: Math.round(data.totalPrice * 100), // Amount in smallest currency unit
                        currency: 'inr'
                    });
                    setClientSecret(intentData.clientSecret);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handlePaymentSuccess = async () => {
        try {
            await api.put(`/orders/${order._id}/pay`, {});
            setOrder({ ...order, isPaid: true, paidAt: new Date().toISOString() });
            alert('Payment Successful');
        } catch (error) {
            console.error(error);
            alert('Error updating order status');
        }
    };

    const deliverHandler = async () => {
        try {
            await api.put(`/orders/${order._id}/deliver`);
            setOrder({ ...order, isDelivered: true, deliveredAt: new Date().toISOString() });
            alert('Order Delivered');
        } catch (error) {
            console.error(error);
            alert('Error updating order');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!order) return <div className="text-center py-20">Order not found</div>;

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#053807',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-4">Order {order._id}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3 space-y-8">
                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">Shipping</h2>
                        <p className="mb-2"><strong>Name: </strong> {order.user.name}</p>
                        <p className="mb-2"><strong>Email: </strong> <a href={`mailto:${order.user.email}`} className="text-secondary">{order.user.email}</a></p>
                        <p className="mb-4">
                            <strong>Address: </strong>
                            {order.shippingAddress.houseNumber}, {order.shippingAddress.landmark ? `${order.shippingAddress.landmark}, ` : ''}
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        <p className="mb-2"><strong>Provider: </strong> {order.shippingProvider || 'Fship'}</p>
                        {order.waybill && (
                            <p className="mb-4 text-primary"><strong>Waybill: </strong> <span className="font-mono font-bold">{order.waybill}</span></p>
                        )}
                        {order.shippingStatus && (
                            <p className="mb-4"><strong>Status: </strong> <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase">{order.shippingStatus}</span></p>
                        )}
                        {order.isDelivered ? (
                            <div className="bg-green-100 text-green-700 p-2 rounded">Delivered on {order.deliveredAt.substring(0, 10)}</div>
                        ) : (
                            <div className="bg-red-100 text-red-700 p-2 rounded">Not Delivered</div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                        <p className="mb-4"><strong>Method: </strong> {order.paymentMethod}</p>
                        {order.isPaid ? (
                            <div className="bg-green-100 text-green-700 p-2 rounded">Paid on {order.paidAt.substring(0, 10)}</div>
                        ) : (
                            <div className="bg-red-100 text-red-700 p-2 rounded">Not Paid</div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        {order.orderItems.length === 0 ? <p>Order is empty</p> : (
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <Link to={`/product/${item.product}`} className="flex-1 hover:text-primary">{item.name}</Link>
                                        <div className="text-gray-600">
                                            {item.qty} x ₹{item.price} = <span className="font-bold text-gray-900">₹{item.qty * item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:w-1/3">
                    <div className="bg-white p-6 rounded shadow-md border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Items</span>
                            <span>₹{order.itemsPrice}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping</span>
                            <span>₹{order.shippingPrice}</span>
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t font-bold text-xl text-primary mb-4">
                            <span>Total</span>
                            <span>₹{order.totalPrice}</span>
                        </div>

                        {!order.isPaid && order.paymentMethod === 'Stripe' && clientSecret && (
                            <div className="border-t pt-4">
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm orderId={order._id} amount={order.totalPrice} onSuccess={handlePaymentSuccess} />
                                </Elements>
                            </div>
                        )}
                        {!order.isPaid && order.paymentMethod === 'COD' && (
                            <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-center font-bold">
                                Cash on Delivery
                            </div>
                        )}
                        {!order.isPaid && (
                            <div className="bg-red-100 p-4 rounded text-red-700 font-bold mb-4">
                                Not Paid
                            </div>
                        )}

                        {order.trackingId && (
                            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
                                <h3 className="font-bold text-blue-800 mb-2">Shipment Tracking</h3>
                                <p className="text-sm text-gray-700">Courier: <strong>{order.courierName}</strong></p>
                                <p className="text-sm text-gray-700">AWB: <strong>{order.trackingId}</strong></p>
                                <button
                                    onClick={() => window.open(`/track-order?orderId=${order._id}`, '_blank')}
                                    className="mt-2 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 w-fit"
                                >
                                    <Truck size={14} /> Track Shipment
                                </button>
                            </div>
                        )}
                    </div>

                    {user && user.isAdmin && (
                        <div className="bg-white p-6 rounded shadow-md border mt-8">
                            <h2 className="text-xl font-bold mb-6 border-b pb-4 flex items-center gap-2 text-primary">
                                <Truck size={24} /> Fship Shipping Control
                            </h2>

                            <div className="space-y-4">
                                {/* Row 1: Create & Pickup */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Create Fship Shipment?')) {
                                                try {
                                                    const { data } = await api.post('/shipping/create-shipment', { orderId: order._id });
                                                    alert('Shipment Created: ' + data.waybill);
                                                    window.location.reload();
                                                } catch (err) {
                                                    alert('Error: ' + (err.response?.data?.message || err.message));
                                                }
                                            }
                                        }}
                                        disabled={order.waybill}
                                        className={`px-4 py-3 rounded-lg font-bold transition-all ${order.waybill ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-opacity-90 shadow-md'}`}
                                    >
                                        Create Shipment
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Register Pickup for this Waybill?')) {
                                                try {
                                                    const { data } = await api.post('/shipping/register-pickup', { waybills: [order.waybill] });
                                                    alert('Pickup Registered!');
                                                    window.location.reload();
                                                } catch (err) {
                                                    alert('Error: ' + (err.response?.data?.message || err.message));
                                                }
                                            }
                                        }}
                                        disabled={!order.waybill || order.pickupOrderId}
                                        className={`px-4 py-3 rounded-lg font-bold transition-all ${(!order.waybill || order.pickupOrderId) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-secondary text-primary hover:bg-opacity-90 shadow-md'}`}
                                    >
                                        Register Pickup
                                    </button>
                                </div>

                                {/* Row 2: Labels & Reverse */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { data } = await api.post('/shipping/labels', { pickupOrderId: [order.pickupOrderId] });
                                                if (data.labelfile) window.open(data.labelfile, '_blank');
                                                else alert('Label file not found');
                                            } catch (err) {
                                                alert('Error: ' + (err.response?.data?.message || err.message));
                                            }
                                        }}
                                        disabled={!order.pickupOrderId}
                                        className={`px-4 py-3 rounded-lg font-bold transition-all ${!order.pickupOrderId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                                    >
                                        Download Labels
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Create Reverse Order?')) {
                                                try {
                                                    const { data } = await api.post('/shipping/reverse-order', { waybill: order.waybill });
                                                    alert('Reverse Order Created!');
                                                } catch (err) {
                                                    alert('Error: ' + (err.response?.data?.message || err.message));
                                                }
                                            }
                                        }}
                                        disabled={!order.waybill}
                                        className={`px-4 py-3 rounded-lg font-bold transition-all ${!order.waybill ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
                                    >
                                        Reverse Order
                                    </button>
                                </div>

                                {/* Status Mark */}
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={deliverHandler}
                                        className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-gray-800 text-white hover:bg-black'}`}
                                        disabled={order.isDelivered}
                                    >
                                        {order.isDelivered ? 'Order Delivered' : 'Manual Mark as Delivered'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default OrderPage;
