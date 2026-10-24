import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const CategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
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

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (err) {
                alert('Error deleting category');
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary">Categories</h1>
                    <p className="text-gray-500 mt-1">Manage product categories and images</p>
                </div>
                <Link
                    to="/admin/category/add"
                    className="bg-primary text-white py-2.5 px-6 rounded-full hover:bg-opacity-90 transition flex items-center gap-2 shadow-lg"
                >
                    <Plus size={20} /> Add Category
                </Link>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 font-bold text-gray-700 text-sm">IMAGE</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-sm">NAME</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-sm">SLUG</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-sm">DESCRIPTION</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-sm text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                                <td className="py-4 px-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-gray-900">{category.name}</td>
                                <td className="py-4 px-6 text-sm text-gray-500 font-mono italic">{category.slug}</td>
                                <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate">{category.description || 'No description'}</td>
                                <td className="py-4 px-6 text-sm text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link
                                            to={`/admin/category/${category._id}/edit`}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Edit Category"
                                        >
                                            <Edit2 size={16} />
                                        </Link>
                                        <button
                                            onClick={() => deleteHandler(category._id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-gray-500 italic text-sm">
                                    No categories found. Click "Add Category" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default CategoryListPage;
