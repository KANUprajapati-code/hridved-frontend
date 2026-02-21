
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { Trash2, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

const ContactListPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await api.get('/contact');
                setContacts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

            {contacts.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map((contact) => (
                        <div key={contact._id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{contact.name}</h3>
                            <div className="text-gray-600 text-sm space-y-1 mb-4">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} /> <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
                                </div>
                                {contact.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} /> <span>{contact.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} /> <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded text-gray-700 italic">
                                &quot;{contact.message}&quot;
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactListPage;
