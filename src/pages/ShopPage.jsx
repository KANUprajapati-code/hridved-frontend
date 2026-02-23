import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { Filter, ChevronDown, ArrowRight, Star } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState(10000);
    const [minRating, setMinRating] = useState(0);
    const [sortOption, setSortOption] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/products?keyword=${keyword}&pageNumber=${page}&sort=${sortOption}`;

                if (selectedCategory) {
                    url += `&category=${selectedCategory}`;
                }

                if (priceRange < 10000) {
                    url += `&maxPrice=${priceRange}`;
                }

                if (minRating > 0) {
                    url += `&rating=${minRating}`;
                }

                const { data } = await api.get(url);
                setProducts(data.products);
                setPage(data.page);
                setTotalPages(data.pages);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
                setShowMobileFilters(false);
            }
        };

        fetchProducts();
    }, [keyword, selectedCategory, priceRange, minRating, sortOption, page]);

    const handleQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setPage(1);
    };

    return (
        <AnimatedPage>
            <div className="bg-background min-h-screen font-sans">
                {/* Minimal Header with Breadcrumbs */}
                <div className="bg-white border-b border-gray-100 py-4">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-800 font-bold">Shop</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary">Ayurvedic Apothecary</h1>
                        <p className="text-gray-500 mt-2 text-sm max-w-2xl">
                            Explore our curated range of herbal formulations, oils, and wellness essentials rooted in 100+ years of healing traditions.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Mobile Filter Toggle */}
                        <div className="md:hidden mb-4">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-lg font-bold text-primary shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Filter size={20} />
                                Filter Products
                            </button>
                        </div>

                        {/* Sidebar Filters */}
                        <div className={`fixed inset-0 z-[60] bg-black/50 md:relative md:inset-auto md:z-0 md:bg-transparent transition-opacity duration-300 ${showMobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible md:visible md:opacity-100'}`}>
                            <div className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 overflow-y-auto md:p-0 md:bg-transparent md:h-auto md:w-full md:max-w-none md:static transform transition-transform duration-300 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                                <div className="flex items-center justify-between mb-8 md:hidden">
                                    <h3 className="text-xl font-display font-bold text-primary">Filters</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-primary">
                                        <Filter size={24} className="rotate-90" />
                                    </button>
                                </div>

                                <div className="sticky top-24 space-y-8">
                                    <div className="hidden md:flex items-center gap-2 font-bold text-gray-800 pb-2 border-b border-gray-200">
                                        <Filter size={18} /> Filters
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-3">Categories</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center space-x-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={selectedCategory === ''}
                                                    onChange={() => { setSelectedCategory(''); setPage(1); }}
                                                    className="rounded-full border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <span className={`text-sm ${selectedCategory === '' ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>All Products</span>
                                            </label>
                                            {categories.map((cat) => (
                                                <label key={cat._id} className="flex items-center space-x-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={selectedCategory === cat.name}
                                                        onChange={() => { setSelectedCategory(cat.name); setPage(1); }}
                                                        className="rounded-full border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                    />
                                                    <span className={`text-sm ${selectedCategory === cat.name ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-3">Max Price: ₹{priceRange}</h4>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="100"
                                            value={priceRange}
                                            onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>₹0</span>
                                            <span>₹10000+</span>
                                        </div>
                                    </div>

                                    {/* Rating Filter */}
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-3">Minimum Rating</h4>
                                        <div className="space-y-2">
                                            {[0, 1, 2, 3, 4].map((rating) => (
                                                <label key={rating} className="flex items-center space-x-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="rating"
                                                        checked={minRating === rating}
                                                        onChange={() => { setMinRating(rating); setPage(1); }}
                                                        className="rounded-full border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
                                                        ))}
                                                        <span className={`text-xs ml-1 ${minRating === rating ? 'text-primary font-bold' : 'text-gray-600'}`}>
                                                            {rating === 0 ? 'All' : `${rating} & above`}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <AnimatedButton onClick={() => { setSelectedCategory(''); setPriceRange(10000); setMinRating(0); setSortOption('newest'); setPage(1); }} className="flex-grow py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded hover:bg-gray-200 transition-colors border-none">
                                            Reset
                                        </AnimatedButton>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="md:hidden flex-grow py-2 bg-primary text-white text-sm font-bold rounded hover:bg-opacity-90 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="md:w-3/4">
                            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-[10px] sm:text-xs">Showing <span className="font-bold text-gray-800">{products.length}</span> results (Page {page} of {totalPages})</p>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">SORT BY:</span>
                                        <div className="relative group">
                                            <select
                                                value={sortOption}
                                                onChange={handleSortChange}
                                                className="text-xs font-bold text-gray-700 bg-gray-50 border px-3 py-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="newest">Newest Arrivals</option>
                                                <option value="price-asc">Price: Low to High</option>
                                                <option value="price-desc">Price: High to Low</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                    <p className="text-gray-500">Loading authentic remedies...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                    <p className="text-xl text-gray-500 mb-2">No products found matching your criteria.</p>
                                    <button onClick={() => { setSelectedCategory(''); setPriceRange(10000); }} className="text-primary hover:underline">Clear Filters</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    {products.map((product, index) => (
                                        <ScrollReveal key={product._id} delay={index * 0.1}>
                                            <ProductCard product={product} onQuickView={handleQuickView} />
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12 gap-2">
                                    <AnimatedButton
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className={`w-8 h-8 flex items-center justify-center rounded border border-gray-200 ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'} !p-0`}
                                    >
                                        &lt;
                                    </AnimatedButton>
                                    {[...Array(totalPages).keys()].map(x => (
                                        <AnimatedButton
                                            key={x + 1}
                                            onClick={() => setPage(x + 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded border ${page === x + 1 ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} !p-0`}
                                        >
                                            {x + 1}
                                        </AnimatedButton>
                                    ))}
                                    <AnimatedButton
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className={`w-8 h-8 flex items-center justify-center rounded border border-gray-200 ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'} !p-0`}
                                    >
                                        &gt;
                                    </AnimatedButton>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Banner */}
                    <ScrollReveal>
                        <div className="mt-20 bg-green-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border border-green-100">
                            <div className="md:w-1/2 mb-8 md:mb-0">
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Ayurveda for Every Body</h2>
                                <p className="text-gray-600 mb-6 leading-relaxed max-w-lg">
                                    All HRIDVED products are crafted following authentic scriptures and modern quality standards. Whether you&apos;re looking for skin radiance, digestion support, or stress relief, our holistic remedies are designed to restore balance to your Doshas.
                                </p>
                                <Link to="/about" className="inline-flex items-center text-primary font-bold border border-primary px-6 py-2 rounded hover:bg-primary hover:text-white transition-colors">
                                    Learn more about our process <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                            <div className="md:w-1/2 flex justify-center md:justify-end">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-2xl transform rotate-3"></div>
                                    <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" alt="Ayurvedic Bowl" className="relative rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500 max-w-xs md:max-w-sm" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Quick View Modal */}
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                />
            </div>
        </AnimatedPage>
    );
};

export default ShopPage;
