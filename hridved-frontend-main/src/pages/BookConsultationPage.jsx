import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import api from '../utils/api';

const dateInputValue = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
};

const BookConsultationPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState('');
    const [date, setDate] = useState(dateInputValue());
    const [time, setTime] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', phone: '', issue: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const doctor = doctors.find((item) => item._id === doctorId);

    useEffect(() => {
        api.get('/doctors').then(({ data }) => {
            const availableDoctors = (data || []).filter((item) => item.available);
            setDoctors(availableDoctors);
            if (availableDoctors[0]) setDoctorId(availableDoctors[0]._id);
        }).catch(() => setMessage('We could not load available consultation times. Please contact us.'));
    }, []);

    useEffect(() => {
        if (!doctorId || !date) return;
        api.get(`/doctor-bookings/booked-slots/${doctorId}/${date}`).then(({ data }) => setBookedSlots(data || [])).catch(() => setBookedSlots([]));
    }, [doctorId, date]);

    const submit = async (event) => {
        event.preventDefault();
        if (!doctor || !time) return;
        setLoading(true);
        setMessage('');
        try {
            const { data } = await api.post('/doctor-bookings/doctor-booking', {
                doctorId: doctor._id,
                doctorName: doctor.name,
                consultationType: 'video',
                appointmentDate: date,
                appointmentTime: time,
                patientName: form.name,
                patientEmail: form.email,
                patientPhone: form.phone,
                issue: form.issue,
                amount: doctor.fee || 0
            });
            setMessage(data.message || 'Your video consultation is booked.');
            setTime('');
            setForm({ name: '', email: '', phone: '', issue: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'We could not complete the booking. Please choose another time or contact us.');
        } finally {
            setLoading(false);
        }
    };

    const slots = doctor?.timeSlots?.length ? doctor.timeSlots : ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

    return (
        <main className="bg-[#faf9f5] min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/consult" className="inline-flex items-center gap-2 text-primary mb-6"><ArrowLeft size={17} /> Back to consultation</Link>
                <div className="bg-white rounded-3xl border p-6 md:p-10 shadow-sm">
                    <div className="flex items-center gap-3 text-primary"><Video size={24} /><p className="text-xs font-bold tracking-[.25em] text-secondary">VIDEO CONSULTATION</p></div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mt-3">Choose a time that suits you</h1>
                    <p className="text-gray-600 mt-2 mb-7">Select a practitioner and available time, then share your contact details.</p>
                    {message && <p role="status" className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-5">{message}</p>}
                    {doctors.length === 0 ? <p className="text-gray-600">No practitioners are available right now. <Link to="/contact" className="underline text-primary">Contact us</Link> and we will help.</p> : (
                        <form onSubmit={submit} className="space-y-5">
                            <label className="block text-sm font-bold text-gray-700">Practitioner<select value={doctorId} onChange={(e) => { setDoctorId(e.target.value); setTime(''); }} className="mt-1 w-full border rounded-lg p-3 font-normal">{doctors.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.specialization}</option>)}</select></label>
                            {doctor && <p className="text-sm text-gray-500">Consultation fee: ₹{doctor.fee || 0}</p>}
                            <label className="block text-sm font-bold text-gray-700">Date<input required type="date" min={dateInputValue()} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                            <fieldset><legend className="text-sm font-bold text-gray-700 mb-2">Available times</legend><div className="flex flex-wrap gap-2">{slots.map((slot) => { const unavailable = bookedSlots.includes(slot); return <button key={slot} type="button" disabled={unavailable} onClick={() => setTime(slot)} className={`px-4 py-2 rounded-full border text-sm ${time === slot ? 'bg-primary text-white border-primary' : unavailable ? 'text-gray-300 border-gray-100 line-through' : 'text-primary border-gray-200 hover:border-primary'}`}>{slot}</button>; })}</div></fieldset>
                            <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-bold text-gray-700">Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label><label className="block text-sm font-bold text-gray-700">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label></div>
                            <label className="block text-sm font-bold text-gray-700">Mobile number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                            <label className="block text-sm font-bold text-gray-700">What would you like help with? (optional)<textarea maxLength={500} rows="3" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1 w-full border rounded-lg p-3 font-normal" /></label>
                            <button disabled={loading || !doctorId || !time} className="w-full bg-primary text-white rounded-full p-3 font-bold disabled:opacity-50">{loading ? 'Booking…' : 'Book video consultation'}</button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default BookConsultationPage;
