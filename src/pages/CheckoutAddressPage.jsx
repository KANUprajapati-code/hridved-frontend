import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import { Plus, Check, MapPin, Phone, User, Home, Building2, Globe } from 'lucide-react';

export default function CheckoutAddressPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart } = useCart();
    const { updateAddress, updateStep, setErrorMessage, clearError, checkoutData } = useCheckout();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        state: '',
        city: '',
        houseNumber: '',
        landmark: '',
        addressType: 'Home',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setLoading(true);
                clearError();
                const { data } = await api.get('/addresses');
                setAddresses(data);
                if (checkoutData.address) {
                    setSelectedAddressId(checkoutData.address._id);
                } else if (data.length > 0) {
                    // Auto-select first address if none selected
                    setSelectedAddressId(data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setErrorMessage('Failed to load addresses');
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            navigate('/login');
            return;
        }

        fetchAddresses();
    }, [user, navigate, clearError, checkoutData.address, setErrorMessage]);

    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
        if (!/^\d{10}$/.test(formData.mobileNumber)) errors.mobileNumber = 'Mobile must be 10 digits';
        if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
        if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.houseNumber.trim()) errors.houseNumber = 'House number/Area is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            clearError();
            const { data } = await api.post('/addresses', formData);
            setAddresses([...addresses, data]);
            setSelectedAddressId(data._id);
            setShowForm(false);
            setFormData({
                fullName: '',
                mobileNumber: '',
                pincode: '',
                state: '',
                city: '',
                houseNumber: '',
                landmark: '',
                addressType: 'Home',
            });
        } catch (error) {
            console.error('Error creating address:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to create address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleContinue = async () => {
        if (!selectedAddressId) {
            setErrorMessage('Please select or add an address');
            return;
        }

        try {
            setSubmitting(true);
            clearError();
            const selectedAddr = addresses.find(a => a._id === selectedAddressId);
            if (selectedAddr) {
                updateAddress(selectedAddr);
                localStorage.setItem('shippingAddress', JSON.stringify(selectedAddr));
                updateStep(2);
                navigate('/checkout/shipping');
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
                            <p className="text-gray-500">Loading addresses...</p>
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
                        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">Delivery Address</h1>

                        {/* Existing Addresses */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" /> Your Saved Addresses
                            </h2>

                            {addresses.length === 0 ? (
                                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 mb-6">
                                    <p>No saved addresses found. Add a new address to continue.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {addresses.map((address, index) => (
                                        <ScrollReveal key={address._id} delay={index * 0.1}>
                                            <div
                                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative h-full flex flex-col justify-between ${selectedAddressId === address._id
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedAddressId(address._id)}
                                            >
                                                {selectedAddressId === address._id && (
                                                    <div className="absolute top-3 right-3 text-primary">
                                                        <div className="bg-primary text-white rounded-full p-1">
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-bold text-gray-900">{address.fullName}</span>
                                                        <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                            {address.addressType}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                                                        <p>{address.houseNumber}, {address.landmark && `${address.landmark}, `}</p>
                                                        <p>{address.city}, {address.state} - {address.pincode}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                        <Phone size={14} /> {address.mobileNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Address Form */}
                        <div className="mb-8">
                            {!showForm ? (
                                <AnimatedButton
                                    onClick={() => setShowForm(true)}
                                    className="w-full border-2 border-dashed border-primary/30 text-primary rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-primary/5 font-bold transition-all"
                                >
                                    <Plus size={20} /> Add New Address
                                </AnimatedButton>
                            ) : (
                                <ScrollReveal>
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-900">Add New Address</h3>
                                            <button
                                                onClick={() => setShowForm(false)}
                                                className="text-gray-500 hover:text-red-500 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitForm} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">Full Name *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter your full name"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.fullName && <span className="text-xs text-red-500">{formErrors.fullName}</span>}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">Mobile Number *</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="mobileNumber"
                                                            value={formData.mobileNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="10-digit mobile number"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.mobileNumber && <span className="text-xs text-red-500">{formErrors.mobileNumber}</span>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">Pincode *</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="pincode"
                                                            value={formData.pincode}
                                                            onChange={handleInputChange}
                                                            placeholder="6-digit pincode"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.pincode ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.pincode && <span className="text-xs text-red-500">{formErrors.pincode}</span>}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">State *</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter state"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.state ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.state && <span className="text-xs text-red-500">{formErrors.state}</span>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">City *</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter city"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.city ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.city && <span className="text-xs text-red-500">{formErrors.city}</span>}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-700 uppercase">House Number / Area *</label>
                                                    <div className="relative">
                                                        <Home className="absolute left-3 top-3 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            name="houseNumber"
                                                            value={formData.houseNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="House number, building name"
                                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.houseNumber ? 'border-red-500' : 'border-gray-300 focus:border-primary'}`}
                                                        />
                                                    </div>
                                                    {formErrors.houseNumber && <span className="text-xs text-red-500">{formErrors.houseNumber}</span>}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700 uppercase">Landmark (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="landmark"
                                                    value={formData.landmark}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., near XYZ store"
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700 uppercase">Address Type *</label>
                                                <div className="flex gap-4 mt-1">
                                                    {['Home', 'Office'].map((type) => (
                                                        <label key={type} className="flex items-center cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="addressType"
                                                                value={type}
                                                                checked={formData.addressType === type}
                                                                onChange={handleInputChange}
                                                                className="mr-2 accent-primary w-4 h-4"
                                                            />
                                                            <span className="text-sm text-gray-700">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <AnimatedButton
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 border-none"
                                            >
                                                {submitting ? 'Adding Address...' : 'Save Address'}
                                            </AnimatedButton>
                                        </form>
                                    </div>
                                </ScrollReveal>
                            )}
                        </div>

                        {/* Price Summary */}
                        {cart?.cartItems && cart.cartItems.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 max-w-md ml-auto">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Price Details</h3>
                                <div className="space-y-2 text-sm">
                                    {cart.cartItems.map((item) => (
                                        <div key={item.product || item._id} className="flex justify-between text-gray-500 text-xs">
                                            <span>{item.name} (x{item.qty})</span>
                                            <span>₹{(item.price * item.qty).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-300 my-2 pt-2"></div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                                        <span>Total</span>
                                        <span>₹{(cart.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-right">* Shipping calculated at next step</p>
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <AnimatedButton
                                onClick={handleContinue}
                                disabled={!selectedAddressId || submitting}
                                className="w-full md:w-auto px-8 bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:bg-gray-300 disabled:cursor-not-allowed border-none"
                            >
                                Continue to Shipping
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
