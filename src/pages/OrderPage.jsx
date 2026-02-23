
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
                            {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
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

                    {user && user.isAdmin && !order.isDelivered && (
                        <div className="bg-white p-6 rounded shadow-md border mt-4">
                            <button
                                onClick={deliverHandler}
                            >
                                Mark As Delivered
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
