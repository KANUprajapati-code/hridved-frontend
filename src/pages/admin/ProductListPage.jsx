
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data.products);
        } catch (err) {
            setError('Error fetching products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                alert('Error deleting product');
            }
        }
    };

    const createProductHandler = async () => {
        try {
            const { data } = await api.post('/products');
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            alert('Error creating product');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-primary">Products</h1>
                <button
                    onClick={createProductHandler}
                    className="bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition flex items-center gap-2"
                >
                    <Plus size={20} /> Create Product
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="py-3 px-4 font-bold text-gray-700">ID</th>
                            <th className="py-3 px-4 font-bold text-gray-700">NAME</th>
                            <th className="py-3 px-4 font-bold text-gray-700">PRICE</th>
                            <th className="py-3 px-4 font-bold text-gray-700">CATEGORY</th>
                            <th className="py-3 px-4 font-bold text-gray-700">BRAND</th>
                            <th className="py-3 px-4 font-bold text-gray-700">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="py-3 px-4 text-sm">{product._id}</td>
                                <td className="py-3 px-4 text-sm font-medium">{product.name}</td>
                                <td className="py-3 px-4 text-sm">₹{product.price}</td>
                                <td className="py-3 px-4 text-sm">{product.category}</td>
                                <td className="py-3 px-4 text-sm">HRIDVED</td>
                                <td className="py-3 px-4 text-sm flex gap-3">
                                    <Link to={`/admin/product/${product._id}/edit`} className="text-blue-600 hover:text-blue-800">
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default ProductListPage;
