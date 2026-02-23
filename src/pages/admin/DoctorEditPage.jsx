import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';
import api from '../../utils/api';

const DoctorEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [image, setImage] = useState('');
    const [experience, setExperience] = useState('');
    const [patients, setPatients] = useState('');
    const [languages, setLanguages] = useState('');
    const [fee, setFee] = useState(0);
    const [tags, setTags] = useState('');
    const [quote, setQuote] = useState('');
    const [available, setAvailable] = useState(true);
    const [isVerified, setIsVerified] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const { data } = await api.get(`/doctors/${id}`);
                setName(data.name);
                setSpecialization(data.specialization);
                setImage(data.image);
                setExperience(data.experience);
                setPatients(data.patients);
                setLanguages(data.languages.join(', '));
                setFee(data.fee);
                setTags(data.tags.join(', '));
                setQuote(data.quote);
                setAvailable(data.available);
                setIsVerified(data.isVerified);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedFile = await compressImage(file, { quality: 0.7, maxWidth: 1200 });
            const formData = new FormData();
            formData.append('image', compressedFile);

            const { data } = await api.post('/upload', formData);
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error('Doctor image upload failed:', error);
            alert('Image upload failed. Try a smaller image.');
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/doctors/${id}`, {
                name,
                specialization,
                image,
                experience,
                patients,
                languages: languages.split(',').map((x) => x.trim()),
                fee,
                tags: tags.split(',').map((x) => x.trim()),
                quote,
                available,
                isVerified
            });
            navigate('/admin/doctorlist');
        } catch (error) {
            console.error('Error updating doctor:', error);
            alert('Failed to update doctor');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/admin/doctorlist" className="text-gray-500 hover:text-primary mb-4 flex items-center gap-2 transition-colors">
                <ArrowLeft size={18} /> Go Back
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Edit Doctor</h1>
                    <div className="text-sm text-gray-500">ID: {id}</div>
                </div>

                <div className="p-8">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Specialization */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                                <input
                                    type="text"
                                    placeholder="Enter specialization"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="image-file"
                                        onChange={uploadFileHandler}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image-file"
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 border border-gray-300 flex items-center gap-2 transition-colors"
                                    >
                                        <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload'}
                                    </label>
                                </div>
                            </div>
                            {image && (
                                <div className="mt-4 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Experience */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Experience</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10 Yrs Exp"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Patients */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Patients Count</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 500+ Patients"
                                    value={patients}
                                    onChange={(e) => setPatients(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Fee */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Fee (₹)</label>
                                <input
                                    type="number"
                                    placeholder="Enter fee"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Languages (comma separated)</label>
                            <input
                                type="text"
                                placeholder="English, Hindi, Malayalam"
                                value={languages}
                                onChange={(e) => setLanguages(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Specialization Tags (comma separated)</label>
                            <input
                                type="text"
                                placeholder="Stress Management, Yoga Therapy, Diet"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Quote */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Professional Quote</label>
                            <textarea
                                rows="3"
                                placeholder="Enter a short professional quote or bio"
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            ></textarea>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex gap-6">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={available}
                                    onChange={(e) => setAvailable(e.target.checked)}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-gray-700 font-medium select-none">Available for Consult</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isVerified}
                                    onChange={(e) => setIsVerified(e.target.checked)}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-gray-700 font-medium select-none">Verified Expert</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/30 hover:bg-opacity-90 transition-all flex items-center gap-2"
                            >
                                <Save size={20} /> Update Doctor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorEditPage;
