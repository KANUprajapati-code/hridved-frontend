
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Upload, ArrowLeft } from 'lucide-react';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [isBestseller, setIsBestseller] = useState(false);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setIsBestseller(data.isBestseller || false);
                setImages(data.images || []);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProduct();
    }, [id]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await api.post('/upload', formData, config);
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const uploadMultipleHandler = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await api.post('/upload/multiple', formData, config);
            setImages(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${id}`, {
                name,
                price,
                image,
                brand,
                category,
                description,
                countInStock,
                isBestseller,
                images,
            });
            navigate('/admin/productlist');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link to="/admin/productlist" className="text-gray-500 hover:text-primary mb-4 flex items-center gap-2 transition-colors">
                <ArrowLeft size={18} /> Go Back
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-md border">
                <h1 className="text-2xl font-serif font-bold text-primary mb-6">Edit Product</h1>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Price</label>
                        <input
                            type="number"
                            required
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    {/* Image Upload */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Image</label>
                        <input
                            type="text"
                            required
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
                    {/* Multiple Images Upload */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Additional Images (Max 5)</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary mb-2"
                            value={images.join(', ')}
                            onChange={(e) => setImages(e.target.value.split(',').map(url => url.trim()))}
                            placeholder="Enter image URLs comma separated"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                id="multiple-images-file"
                                className="hidden"
                                multiple
                                onChange={uploadMultipleHandler}
                            />
                            <label htmlFor="multiple-images-file" className="cursor-pointer bg-gray-100 py-2 px-4 rounded border hover:bg-gray-200 inline-flex items-center gap-2">
                                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Images'}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Category</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Brand</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Count In Stock</label>
                        <input
                            type="number"
                            required
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isBestseller"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={isBestseller}
                            onChange={(e) => setIsBestseller(e.target.checked)}
                        />
                        <label htmlFor="isBestseller" className="ml-2 block text-gray-700 font-bold">
                            Is Bestseller?
                        </label>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea
                            required
                            rows="4"
                            className="w-full border p-2 rounded focus:outline-none focus:border-secondary"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition font-bold"
                    >
                        Update Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductEditPage;
