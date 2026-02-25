
import { useState } from 'react';
import api from '../utils/api';
import { MapPin, Phone, Mail } from 'lucide-react';

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.post('/contact', { name, email, phone, message });
            setStatus('success');
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Contact Us</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Info */}
                <div className="md:w-1/3 bg-primary text-white p-8 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                    <ul className="space-y-6">
                        <li className="flex items-start space-x-4">
                            <MapPin className="mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">Our Location</h3>
                                <p className="text-gray-300 text-sm">23 VRAJ GARDEN SOCIETY, BAYAD, DIST: ARAVALLI Gujarat 383325</p>
                            </div>
                        </li>
                        <li className="flex items-start space-x-4">
                            <Phone className="mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">Phone</h3>
                                <p className="text-gray-300">+91 79904 11390</p>
                            </div>
                        </li>
                        <li className="flex items-start space-x-4">
                            <Mail className="mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">Email</h3>
                                <p className="text-gray-300">hridvedpharama@gmail.com</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <div className="md:w-2/3 bg-white p-8 rounded-lg shadow-md border">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">Send us a Message</h2>
                    {status === 'success' && <div className="bg-green-100 text-green-700 p-4 rounded mb-6">Message sent successfully! We will get back to you soon.</div>}
                    {status === 'error' && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">Something went wrong. Please try again.</div>}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-bold">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-3 rounded focus:outline-none focus:border-secondary"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-bold">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border p-3 rounded focus:outline-none focus:border-secondary"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-bold">Phone (Optional)</label>
                            <input
                                type="text"
                                className="w-full border p-3 rounded focus:outline-none focus:border-secondary"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-bold">Message</label>
                            <textarea
                                required
                                rows="5"
                                className="w-full border p-3 rounded focus:outline-none focus:border-secondary"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-white py-3 px-8 rounded hover:bg-opacity-90 transition font-bold"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
