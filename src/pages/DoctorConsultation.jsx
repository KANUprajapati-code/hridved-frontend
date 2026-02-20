import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, MapPin, CheckCircle, ShieldCheck, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';

const faqs = [
    {
        question: 'How long does a consultation last?',
        answer: 'A typical first consultation lasts 30-45 minutes, focusing on your Prakriti (constitution) and current health concerns.'
    },
    {
        question: 'Will I get a digital prescription?',
        answer: 'Yes, immediately after the call, a detailed digital prescription including medicine and diet plans will be available in your dashboard.'
    },
    {
        question: 'Can I cancel or reschedule?',
        answer: 'Absolutely. You can reschedule or cancel up to 2 hours before the appointment for a full refund.'
    }
];

const DoctorConsultation = () => {
    const [doctors, setDoctors] = useState([]);
    const [_loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('video'); // video or clinic
    const [filter, setFilter] = useState('All');
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/doctors');
                setDoctors(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch doctors", error);
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const categories = ['All', 'Panchakarma', 'Kayachikitsa', 'Pediatrics', 'Yoga', 'Lifestyle'];

    const filteredDoctors = filter === 'All'
        ? doctors
        : doctors.filter(doc => doc.specialization.includes(filter) || doc.tags.some(tag => tag.includes(filter)));

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Hero Section */}
            <section className="bg-green-50 py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="md:w-1/2 mb-12 md:mb-0">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                            Expert Consultations
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                            Consult India&apos;s Top <br />
                            <span className="text-green-700">Ayurvedic Experts</span>
                        </h1>
                        <p className="text-gray-600 text-lg mb-8 max-w-lg">
                            Experience the authentic Kerala tradition of healing. Connect with our certified doctors for personalized health assessments and natural wellness paths.
                        </p>

                        <div className="flex gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                                    <Video size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Video Consult</p>
                                    <p className="text-xs">From comfort of home</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">In-Clinic Visit</p>
                                    <p className="text-xs">Traditional centers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/3 w-full">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-green-600" /> Select Consultation Type
                            </h3>

                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'video' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('video')}
                                >
                                    <Video size={16} /> Video Call
                                </button>
                                <button
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'clinic' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('clinic')}
                                >
                                    <MapPin size={16} /> In-Clinic
                                </button>
                            </div>

                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" /> Verified Practitioners
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" /> Instant Prescriptions
                                </li>
                                <li className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-green-500" /> 100% Secure & Private
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="bg-white border-b sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4 overflow-x-auto">
                    <div className="flex items-center gap-4 min-w-max">
                        <span className="text-gray-400"><Filter size={18} /></span>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center text-xs text-gray-400 gap-4 hidden md:flex">
                            <span>Showing {filteredDoctors.length} Specialists</span>
                            <button className="text-gray-600 hover:text-green-700">Reset Filters</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctor Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                    <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                                    {doctor.verified && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white" title="Verified Expert">
                                            <CheckCircle size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <ShieldCheck size={12} /> Verified Expert
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">{doctor.name}</h3>
                                    <p className="text-gray-500 text-sm">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-gray-400" /> {doctor.experience}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Video size={14} className="text-gray-400" /> {doctor.patients}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {doctor.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="text-gray-500 text-xs italic mb-6 line-clamp-2">&quot;{doctor.quote}&quot;</p>

                            <div className="flex items-center justify-between mt-auto">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Consultation Fee</p>
                                    <p className="text-green-700 font-bold text-lg">₹{doctor.fee}</p>
                                </div>
                                <Link
                                    to={`/doctor/${doctor._id || doctor.id}/book`}
                                    className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-green-200 shadow-lg hover:bg-green-800 transition-colors inline-block"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-gray-900 text-white py-16 rounded-3xl mx-4 md:mx-8 mb-16 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
                        <div className="p-4">
                            <h3 className="text-4xl font-serif font-bold text-green-400 mb-2">50k+</h3>
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Happy Patients</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-serif font-bold text-green-400 mb-2">100+</h3>
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Expert Doctors</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-serif font-bold text-green-400 mb-2">4.9/5</h3>
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Average Rating</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-serif font-bold text-green-400 mb-2">24/7</h3>
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Care Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="container mx-auto px-4 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Consultation FAQ</h2>
                    <p className="text-gray-500">Everything you need to know about your Ayurvedic journey.</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <button
                                className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                                onClick={() => toggleFaq(index)}
                            >
                                <span className="flex items-center gap-3">
                                    <Clock size={16} className="text-green-500" />
                                    {faq.question}
                                </span>
                                {activeFaq === index ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>
                            {activeFaq === index && (
                                <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm border-t border-gray-100 leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DoctorConsultation;
