import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Zap, CheckCircle, ArrowLeft, Video } from 'lucide-react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';

const DoctorBookingPage = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [consultationType, setConsultationType] = useState('video'); // video or clinic
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [issue, setIssue] = useState('');
    const [bookingInProgress, setBookingInProgress] = useState(false);

    const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const { data } = await api.get(`/doctors/${doctorId}`);
                setDoctor(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching doctor:', error);
                if (addToast) addToast('Doctor not found', 'error');
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId, addToast]);

    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    const initiatePayment = async () => {
        if (!selectedDate || !selectedTime || !patientName || !patientPhone || !patientEmail) {
            if (addToast) addToast('Please fill all required fields', 'error');
            return;
        }

        setBookingInProgress(true);

        try {
            // Create booking with pending status
            const bookingData = {
                doctorId,
                doctorName: doctor.name,
                consultationType,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                patientName,
                patientPhone,
                patientEmail,
                issue,
                amount: doctor.fee,
                status: 'pending',
            };

            // Call backend to initiate payment
            const { data } = await api.post('/doctor-bookings/doctor-booking', bookingData);

            if (data.razorpayOrderId) {
                // Open Razorpay payment modal
                const options = {
                    key: data.razorpayKeyId,
                    amount: data.amount,
                    currency: 'INR',
                    name: 'Doctor Consultation',
                    description: `Consultation with Dr. ${doctor.name}`,
                    order_id: data.razorpayOrderId,
                    handler: async (response) => {
                        try {
                            // Verify payment
                            const verifyData = await api.post('/doctor-bookings/verify-doctor-booking', {
                                orderId: data.razorpayOrderId,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            });

                            if (verifyData.data.success) {
                                if (addToast) addToast('Appointment booked successfully!', 'success');
                                setTimeout(() => navigate('/profile'), 2000);
                            } else {
                                if (addToast) addToast('Payment verification failed', 'error');
                            }
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            if (addToast) addToast('Payment verification failed', 'error');
                        }
                    },
                    prefill: {
                        name: patientName,
                        email: patientEmail,
                        contact: patientPhone,
                    },
                    theme: {
                        color: '#22c55e',
                    },
                    config: {
                        display: {
                            hide: [{ method: 'upi', flow: 'qr' }]
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error('Booking error:', error);
            if (addToast) addToast(error.response?.data?.message || 'Failed to initiate booking', 'error');
        } finally {
            setBookingInProgress(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading doctor details...</p>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Doctor not found</h1>
                    <button onClick={() => navigate('/consultation')} className="text-green-600 font-bold hover:underline">
                        Back to doctors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-green-600 font-bold mb-8 hover:text-green-700">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Doctor Details Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-8">
                            {/* Doctor Card */}
                            <div className="text-center mb-6">
                                <img src={doctor.image} alt={doctor.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-green-100" />
                                <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                                <p className="text-green-600 font-bold text-sm mt-2">{doctor.specialization}</p>
                            </div>

                            {/* Details */}
                            <div className="space-y-4 mb-6 border-y border-gray-100 py-6">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Experience</p>
                                    <p className="font-bold text-gray-800">{doctor.experience}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Patients</p>
                                    <p className="font-bold text-gray-800">{doctor.patients}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Languages</p>
                                    <p className="font-bold text-gray-800">{doctor.languages?.join(', ') || 'English'}</p>
                                </div>
                            </div>

                            {/* Quote */}
                            {doctor.quote && (
                                <div className="bg-green-50 rounded-lg p-4 mb-6 border-l-4 border-green-500">
                                    <p className="text-sm italic text-gray-700">&quot;{doctor.quote}&quot;</p>
                                </div>
                            )}

                            {/* Tags */}
                            {doctor.tags && doctor.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {doctor.tags.map((tag) => (
                                        <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Fee Section */}
                            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Consultation Fee</p>
                                <p className="text-4xl font-bold text-green-600 mb-3">₹{doctor.fee}</p>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" /> Instant Prescription
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" /> 30-45 Min Consultation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" /> Digital Reports
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Your Appointment</h1>

                            <div className="space-y-6">
                                {/* Consultation Type */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-4">Consultation Type *</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setConsultationType('video')}
                                            className={`p-4 rounded-lg border-2 transition-all font-bold flex items-center justify-center gap-2 ${consultationType === 'video'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <Video size={18} /> Video Call
                                        </button>
                                        <button
                                            onClick={() => setConsultationType('clinic')}
                                            className={`p-4 rounded-lg border-2 transition-all font-bold flex items-center justify-center gap-2 ${consultationType === 'clinic'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <MapPin size={18} /> In-Clinic
                                        </button>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-green-600" /> Select Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={getMinDate()}
                                        max={getMaxDate()}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none font-bold"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Select from next day to 30 days ahead</p>
                                </div>

                                {/* Time Selection */}
                                {selectedDate && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock size={16} className="text-green-600" /> Select Time *
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`p-3 rounded-lg border-2 transition-all font-bold text-sm ${selectedTime === time
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Patient Details */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users size={18} className="text-green-600" /> Your Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                value={patientName}
                                                onChange={(e) => setPatientName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                                            <input
                                                type="email"
                                                value={patientEmail}
                                                onChange={(e) => setPatientEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={patientPhone}
                                                onChange={(e) => setPatientPhone(e.target.value)}
                                                placeholder="Enter your phone number"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Health Concern</label>
                                            <textarea
                                                value={issue}
                                                onChange={(e) => setIssue(e.target.value)}
                                                placeholder="Describe your health concern (optional)"
                                                rows="4"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                {selectedDate && selectedTime && (
                                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                        <h3 className="font-bold text-gray-900 mb-4">Appointment Summary</h3>
                                        <div className="space-y-2 text-sm mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Doctor:</span>
                                                <span className="font-bold text-gray-900">{doctor.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-bold text-gray-900 capitalize">{consultationType === 'video' ? 'Video Call' : 'In-Clinic Visit'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date & Time:</span>
                                                <span className="font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString()} at {selectedTime}</span>
                                            </div>
                                            <div className="border-t border-green-300 pt-2 mt-2 flex justify-between">
                                                <span className="text-gray-600 font-bold">Total Amount:</span>
                                                <span className="text-xl font-bold text-green-700">₹{doctor.fee}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <button
                                    onClick={initiatePayment}
                                    disabled={bookingInProgress || !selectedDate || !selectedTime}
                                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Zap size={20} /> {bookingInProgress ? 'Processing...' : 'Pay & Book Appointment'}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    By booking, you agree to our Terms & Conditions. Cancellation allowed up to 2 hours before appointment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorBookingPage;
