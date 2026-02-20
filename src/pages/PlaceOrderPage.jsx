
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PlaceOrderPage = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [shippingAddress, setShippingAddress] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('Stripe');

    useEffect(() => {
        if (!user) navigate('/login');
        const savedAddress = JSON.parse(localStorage.getItem('shippingAddress'));
        if (!savedAddress) navigate('/shipping');
        setShippingAddress(savedAddress);
    }, [navigate, user]);

    const cartItems = cart?.cartItems || [];

    // Calculate prices
    const addDecimals = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2);
    };

    const itemsPrice = addDecimals(
        cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
    const shippingPrice = addDecimals(itemsPrice > 500 ? 0 : 50);
    const taxPrice = addDecimals(Number((0.05 * itemsPrice).toFixed(2))); // 5% Tax
    const totalPrice = (
        Number(itemsPrice) +
        Number(shippingPrice) +
        Number(taxPrice)
    ).toFixed(2);

    const placeOrderHandler = async () => {
        if (!shippingAddress.houseNumber) {
            alert('Please add a shipping address');
            navigate('/checkout/address');
            return;
        }
        try {
            const { data } = await api.post('/orders', {
                orderItems: cartItems,
                shippingAddress: {
                    ...shippingAddress,
                    addressId: shippingAddress._id
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            });
            clearCart();
            navigate(`/order/${data._id}`);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error placing order');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">Place Order</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3 space-y-8">
                    {/* Shipping */}
                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Shipping</h2>
                        <p className="mb-2"><strong>Address: </strong>
                            {shippingAddress.houseNumber}, {shippingAddress.landmark ? `${shippingAddress.landmark}, ` : ''}
                            {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Method</h2>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Stripe"
                                    checked={paymentMethod === 'Stripe'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-primary w-5 h-5"
                                />
                                <span className="font-medium">Credit/Debit Card (Stripe)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-primary w-5 h-5"
                                />
                                <span className="font-medium">Cash on Delivery (COD)</span>
                            </label>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-6 rounded shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Order Items</h2>
                        {cartItems.length === 0 ? <p>Your cart is empty</p> : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <Link to={`/product/${item.product}`} className="flex-1 hover:text-primary">
                                            {item.name}
                                        </Link>
                                        <div className="text-gray-600">
                                            {item.qty} x ₹{item.price} = <span className="font-bold text-gray-900">₹{item.qty * item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="md:w-1/3">
                    <div className="bg-white p-6 rounded shadow-md border sticky top-24">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Items</span>
                            <span>₹{itemsPrice}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping</span>
                            <span>₹{shippingPrice}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Tax</span>
                            <span>₹{taxPrice}</span>
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t font-bold text-xl text-primary">
                            <span>Total</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-primary text-white py-3 rounded mt-6 hover:bg-opacity-90 transition font-bold"
                            disabled={cartItems.length === 0}
                            onClick={placeOrderHandler}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
