import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const DoctorCategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/doctor-categories');
            setCategories(data);
        } catch (err) {
            setError('Error fetching categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategoryHandler = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        try {
            await api.post('/doctor-categories', { name: newCategoryName });
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding category');
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure? This may affect doctors assigned to this category.')) {
            try {
                await api.delete(`/doctor-categories/${id}`);
                fetchCategories();
            } catch (err) {
                alert('Error deleting category');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-primary font-bold">Loading categories...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consultation Categories</h1>
                    <p className="text-gray-500 mt-1">Manage categories for doctor consultations (Yoga, Panchkarma, etc.)</p>
                </div>
            </div>

            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={addCategoryHandler} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter new category name (e.g. Yoga Therapy)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newCategoryName}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        <Plus size={20} /> Add Category
                    </button>
                </form>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-8 font-bold text-gray-700 text-sm uppercase tracking-wider">Category Name</th>
                            <th className="py-4 px-8 font-bold text-gray-700 text-sm uppercase tracking-wider">Created At</th>
                            <th className="py-4 px-8 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-5 px-8 text-sm font-bold text-gray-900">{category.name}</td>
                                <td className="py-5 px-8 text-sm text-gray-500 font-medium">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-5 px-8 text-sm text-right">
                                    <button
                                        onClick={() => deleteHandler(category._id)}
                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete Category"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="3" className="py-20 text-center text-gray-400 italic text-sm">
                                    No categories found. Add one above to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorCategoryListPage;
