
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ShippingPage = () => {
    const [address, setAddress] = useState('Flat, House no., Building, Company, Apartment');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [state, setState] = useState('');

    // Split name for form matching the design
    const [firstName, setFirstName] = useState('Sitaram');
    const [lastName, setLastName] = useState('Ayurveda');
    const [phone, setPhone] = useState('+91 98765 43210');

    const navigate = useNavigate();
    const { cart } = useCart();
    const cartItems = cart?.cartItems || [];

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const shipping = subtotal > 499 ? 0 : 50;
    const total = subtotal + shipping;

    const submitHandler = (e) => {
        e.preventDefault();
        localStorage.setItem('shippingAddress', JSON.stringify({
            address, city, postalCode, country: 'India',
            firstName, lastName, phone, state
        }));
        navigate('/placeorder');
    };

    return (
        <div className="bg-background min-h-screen animate-fade-in pb-12">
            {/* Top Bar for Checkout */}
            <div className="bg-primary text-white text-center py-2 text-sm font-medium tracking-wide">
                Free Shipping Above ₹499
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header with Back Button */}
                <div className="flex items-center mb-8">
                    <button onClick={() => navigate('/cart')} className="flex items-center text-gray-500 hover:text-primary transition mr-4">
                        <ArrowLeft size={16} className="mr-2" /> Back to Cart
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Secure Checkout</h1>
                </div>

                {/* Stepper */}
                <div className="flex justify-center mb-12 relative">
                    <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                    <div className="flex justify-between w-full max-w-2xl px-8">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2 shadow-lg ring-4 ring-white">
                                <MapPin size={18} />
                            </div>
                            <span className="text-xs font-bold text-primary">Address</span>
                        </div>
                        <div className="flex flex-col items-center opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center font-bold mb-2">
                                <Truck size={18} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center font-bold mb-2">
                                <CreditCard size={18} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Address Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                                <h2 className="text-xl font-serif font-bold text-gray-900">Shipping Address</h2>
                            </div>

                            <form onSubmit={submitHandler} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Flat, House no., Building, Company, Apartment"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all transform hover:-translate-y-1"
                                >
                                    Deliver to this Address
                                </button>
                            </form>
                        </div>

                        {/* Disabled Steps Visuals */}
                        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 opacity-60 pointer-events-none">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-xl font-serif font-bold text-gray-400">Shipping Method</h2>
                            </div>
                        </div>
                        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 opacity-60 pointer-events-none">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">3</div>
                                <h2 className="text-xl font-serif font-bold text-gray-400">Payment Method</h2>
                            </div>
                        </div>

                        {/* Trust Footer */}
                        <div className="mt-8 flex justify-center gap-8 text-gray-400 text-xs font-bold uppercase tracking-widest border-t border-gray-200 pt-8">
                            <span className="flex items-center gap-2"><Lock size={14} /> Secure Payment</span>
                            <span className="flex items-center gap-2"><Truck size={14} /> Free Shipping</span>
                            <span className="flex items-center gap-2"><ShieldCheck size={14} /> Natural Heritage</span>
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif font-bold text-gray-900">Order Summary</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{cartItems.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                            </div>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.product} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Qty: {item.qty}</span>
                                                <span className="font-bold text-primary">₹{item.price * item.qty}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Shipping</span>
                                    <span className="font-bold text-green-600">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>GST (5%)</span>
                                    <span className="font-bold text-gray-900">₹{(subtotal * 0.05).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-primary">₹{(total + subtotal * 0.05).toFixed(2)}</span>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    className="flex-grow border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-200 transition">Apply</button>
                            </div>

                            <div className="mt-6 text-center">
                                <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Secure SSL Encrypted Checkout
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
