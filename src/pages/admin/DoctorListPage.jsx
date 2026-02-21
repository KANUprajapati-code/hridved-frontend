import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Video, Eye, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const DoctorListPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/doctors');
                setDoctors(data);
                setFilteredDoctors(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load doctors');
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredDoctors(doctors.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } else {
            setFilteredDoctors(doctors);
        }
    }, [searchQuery, doctors]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                await api.delete(`/doctors/${id}`);
                const updatedDoctors = doctors.filter((doc) => doc._id !== id);
                setDoctors(updatedDoctors);
                // Filter will update via effect
            } catch (err) {
                alert('Failed to delete doctor');
            }
        }
    };

    const createDoctorHandler = async () => {
        try {
            const { data } = await api.post('/doctors');
            navigate(`/admin/doctor/${data._id}/edit`);
        } catch (err) {
            alert('Failed to create doctor');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading doctors...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <button
                        onClick={createDoctorHandler}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} /> Add Doctor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">ID</th>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Specialization</th>
                                <th className="p-4 font-semibold text-gray-600">Experience</th>
                                <th className="p-4 font-semibold text-gray-600">Fee</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDoctors.map((doctor) => (
                                <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-500 font-mono">{doctor._id.substring(0, 8)}...</td>
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                        </div>
                                        {doctor.name}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{doctor.specialization}</td>
                                    <td className="p-4 text-sm text-gray-600">{doctor.experience}</td>
                                    <td className="p-4 text-sm font-bold text-gray-800">₹{doctor.fee}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/admin/doctor/${doctor._id}/edit`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(doctor._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDoctors.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">
                                        No doctors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorListPage;
