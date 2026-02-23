import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Upload, ArrowLeft } from 'lucide-react';

const TipEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            try {
                const { data } = await api.get(`/tips/${id}`);
                setTitle(data.title);
                setDescription(data.description);
                setImage(data.image);
                setCategory(data.category);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchTip();
    }, [id]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', formData);
            // Fix path to use forward slashes
            const normalizedPath = data.replace(/\\/g, '/');
            setImage(normalizedPath);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tips/${id}`, {
                title,
                description,
                image,
                category,
            });
            navigate('/admin/tiplist');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link to="/admin/tiplist" className="text-gray-500 hover:text-primary mb-4 flex items-center gap-2 transition-colors">
                <ArrowLeft size={18} /> Go Back
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-md border">
                <h1 className="text-2xl font-serif font-bold text-primary mb-6">Edit Tip</h1>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter tip title"
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Category</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Wellness, Nutrition, Yoga"
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Image</label>
                        <input
                            type="text"
                            required
                            placeholder="Image URL or Upload"
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary mb-2"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                        <div className="relative">
                            <input
                                type="file"
                                id="image-file"
                                className="hidden"
                                onChange={uploadFileHandler}
                            />
                            <label htmlFor="image-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-flex items-center gap-2">
                                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea
                            required
                            rows="6"
                            placeholder="Write your tip content here..."
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition font-bold"
                    >
                        Update Tip
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TipEditPage;
