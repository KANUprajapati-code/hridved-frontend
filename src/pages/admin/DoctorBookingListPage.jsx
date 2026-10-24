import { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Clock as ClockIcon, Video } from 'lucide-react';
import api from '../../utils/api';
import { ToastContext } from '../../context/ToastContext';

const DoctorBookingListPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useContext(ToastContext) || {};

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/doctor-bookings/admin/all');
            setBookings(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (addToast) addToast('Failed to load bookings', 'error');
            setLoading(false);
        }
    };

    const updateBookingStatus = async (id, status) => {
        try {
            await api.put(`/doctor-bookings/admin/${id}`, { status });
            if (addToast) addToast(`Booking ${status} successfully`, 'success');
            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
            if (addToast) addToast('Failed to update status', 'error');
        }
    };

    const addMeetLink = async (id) => {
        const link = prompt('Enter Google Meet Link:');
        if (!link) return;

        try {
            await api.put(`/doctor-bookings/admin/${id}`, { googleMeetLink: link, meetingStatus: 'scheduled' });
            if (addToast) addToast('Meet link added successfully', 'success');
            fetchBookings();
        } catch (error) {
            console.error('Error adding link:', error);
            if (addToast) addToast('Failed to add link', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Bookings...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Doctor Bookings</h1>
                    <p className="text-gray-500 text-sm">Manage patient appointments and consultations</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100 uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Patient Details</th>
                                <th className="px-6 py-4 font-medium">Doctor</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Consultation</th>
                                <th className="px-6 py-4 font-medium">Meet Link</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{booking.patientName}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Phone size={10} /> {booking.patientPhone}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Mail size={10} /> {booking.patientEmail}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">{booking.doctorName}</div>
                                        <div className="text-xs text-green-600 font-bold">{booking.doctorId?.specialization}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700 font-medium flex items-center gap-1 text-xs">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(booking.appointmentDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-gray-500 flex items-center gap-1 mt-1 text-xs">
                                            <ClockIcon size={14} className="text-gray-400" />
                                            {booking.appointmentTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className="flex items-center gap-1">
                                            {booking.consultationType === 'video' ? <Video size={14} className="text-blue-500" /> : <ClockIcon size={14} className="text-orange-500" />}
                                            {booking.consultationType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.googleMeetLink ? (
                                            <a href={booking.googleMeetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs overflow-hidden max-w-[100px] truncate">
                                                <Video size={14} /> Link
                                            </a>
                                        ) : (
                                            <button onClick={() => addMeetLink(booking._id)} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase">
                                                Add Link
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirm">
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {booking.status !== 'cancelled' && (
                                                <button onClick={() => updateBookingStatus(booking._id, 'cancelled')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancel">
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button onClick={() => updateBookingStatus(booking._id, 'completed')} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Complete">
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {bookings.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No bookings found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorBookingListPage;
