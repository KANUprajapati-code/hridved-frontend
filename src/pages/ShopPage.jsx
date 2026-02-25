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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState(10000);
    const [minRating, setMinRating] = useState(0);
    const [sortOption, setSortOption] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Accordion states
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        ratings: true,
        availability: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [inStockOnly, setInStockOnly] = useState(false);

    // Mock category counts (in a real app, these would come from the API or be calculated)
    const categoryCounts = {
        'Hair Care': 24,
        'Skin Care': 32,
        'Immunity': 18,
        'Pain Relief': 15,
        'Digestion': 21,
        'Wellness': 40
    };

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        const catFromUrl = searchParams.get('category');
        if (catFromUrl) {
            setSelectedCategories([catFromUrl]);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/products?keyword=${keyword}&pageNumber=${page}&sort=${sortOption}`;

                if (selectedCategories.length > 0) {
                    url += `&category=${selectedCategories.join(',')}`;
                }

                if (minPrice > 0) {
                    url += `&minPrice=${minPrice}`;
                }

                if (maxPrice < 10000) {
                    url += `&maxPrice=${maxPrice}`;
                }

                if (minRating > 0) {
                    url += `&rating=${minRating}`;
                }

                if (inStockOnly) {
                    url += `&inStock=true`;
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
    }, [keyword, selectedCategories, minPrice, maxPrice, minRating, sortOption, page, inStockOnly]);

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
        setPage(1);
    };

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

                                <div className="sticky top-24 space-y-4">
                                    <div className="hidden md:flex items-center gap-2 font-bold text-gray-800 pb-2 border-b border-gray-100">
                                        <Filter size={18} /> Filters
                                    </div>

                                    {/* Categories Accordion */}
                                    <div className="border-b border-gray-100 pb-4">
                                        <button
                                            onClick={() => toggleSection('categories')}
                                            className="flex items-center justify-between w-full py-2 group text-left"
                                        >
                                            <h4 className="font-bold text-sm text-gray-900">Categories</h4>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${openSections.categories ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`space-y-2 mt-2 transition-all duration-300 overflow-hidden ${openSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {categories.map((cat) => (
                                                <label key={cat._id} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${selectedCategories.includes(cat.name) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                            {selectedCategories.includes(cat.name) && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedCategories.includes(cat.name)}
                                                            onChange={() => handleCategoryToggle(cat.name)}
                                                        />
                                                        <span className={`text-xs md:text-sm ${selectedCategories.includes(cat.name) ? 'text-primary font-bold' : 'text-gray-600'}`}>{cat.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">({categoryCounts[cat.name] || 0})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range Accordion */}
                                    <div className="border-b border-gray-100 pb-4">
                                        <button
                                            onClick={() => toggleSection('price')}
                                            className="flex items-center justify-between w-full py-2 group text-left"
                                        >
                                            <h4 className="font-bold text-sm text-gray-900">Price Range</h4>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`mt-4 transition-all duration-300 overflow-hidden ${openSections.price ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="relative flex-grow">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                                    <input
                                                        type="number"
                                                        value={minPrice}
                                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                                        className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <span className="text-gray-300">-</span>
                                                <div className="relative flex-grow">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                                    <input
                                                        type="number"
                                                        value={maxPrice}
                                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                                        className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="10000"
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10000"
                                                step="100"
                                                value={maxPrice}
                                                onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                                                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Customer Ratings Accordion */}
                                    <div className="border-b border-gray-100 pb-4">
                                        <button
                                            onClick={() => toggleSection('ratings')}
                                            className="flex items-center justify-between w-full py-2 group text-left"
                                        >
                                            <h4 className="font-bold text-sm text-gray-900">Customer Ratings</h4>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${openSections.ratings ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`space-y-2 mt-3 transition-all duration-300 overflow-hidden ${openSections.ratings ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {[4, 3, 2, 1].map((rating) => (
                                                <label key={rating} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${minRating === rating ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                            {minRating === rating && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="rating"
                                                            className="hidden"
                                                            checked={minRating === rating}
                                                            onChange={() => { setMinRating(rating); setPage(1); }}
                                                        />
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={10} fill={i < rating ? "#D4AF37" : "none"} className={i < rating ? "text-secondary" : "text-gray-200"} />
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-1">& Up</span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Availability Accordion */}
                                    <div className="border-b border-gray-100 pb-4">
                                        <button
                                            onClick={() => toggleSection('availability')}
                                            className="flex items-center justify-between w-full py-2 group text-left"
                                        >
                                            <h4 className="font-bold text-sm text-gray-900">Availability</h4>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${openSections.availability ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`space-y-3 mt-3 transition-all duration-300 overflow-hidden ${openSections.availability ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${inStockOnly ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                    {inStockOnly && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={inStockOnly}
                                                    onChange={() => { setInStockOnly(!inStockOnly); setPage(1); }}
                                                />
                                                <span className="text-xs md:text-sm text-gray-600">In Stock Only</span>
                                            </label>
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors border-gray-300 group-hover:border-primary`}>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                />
                                                <span className="text-xs md:text-sm text-gray-600">On Pre-order</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => {
                                                setSelectedCategories([]);
                                                setMinPrice(0);
                                                setMaxPrice(10000);
                                                setMinRating(0);
                                                setSortOption('newest');
                                                setInStockOnly(false);
                                                setPage(1);
                                            }}
                                            className="w-full py-2.5 bg-green-50 text-primary text-xs font-bold rounded-lg hover:bg-green-100 transition-colors border border-green-100 text-center uppercase tracking-wider"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="md:w-3/4">
                            <div className="flex flex-wrap justify-between items-center mb-6 bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                                <p className="text-gray-500 text-[10px] sm:text-xs">Showing <span className="font-bold text-gray-800">1-12</span> of <span className="font-bold text-gray-800">145</span> results</p>

                                <div className="flex items-center gap-4 md:gap-8">
                                    <div className="hidden sm:flex items-center gap-2 border-r border-gray-100 pr-4">
                                        <button className="p-1 px-2 bg-green-50 text-primary border border-green-100 rounded text-[10px] flex items-center gap-1">
                                            <div className="w-3 h-3 border border-current"></div>
                                            <div className="w-3 h-3 border border-current"></div>
                                        </button>
                                        <button className="p-1 px-2 text-gray-300 hover:text-gray-500 transition-colors">
                                            <div className="w-4 h-0.5 bg-current mb-0.5"></div>
                                            <div className="w-4 h-0.5 bg-current mb-0.5"></div>
                                            <div className="w-4 h-0.5 bg-current"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SORT BY:</span>
                                        <div className="relative group">
                                            <select
                                                value={sortOption}
                                                onChange={handleSortChange}
                                                className="text-[11px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg hover:border-primary transition-all focus:outline-none appearance-none pr-8 cursor-pointer"
                                            >
                                                <option value="newest">Recommended</option>
                                                <option value="price-asc">Price: Low to High</option>
                                                <option value="price-desc">Price: High to Low</option>
                                                <option value="rating">Best Rating</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Filter Bar */}
                            <div className="flex overflow-x-auto pb-4 mb-6 gap-4 no-scrollbar scroll-smooth items-center border-b border-gray-100">
                                <button
                                    onClick={() => { setSelectedCategories([]); setPage(1); }}
                                    className={`flex flex-col items-center gap-2 group flex-shrink-0 min-w-[70px] ${selectedCategories.length === 0 ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 ${selectedCategories.length === 0 ? 'border-secondary bg-secondary/10 shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                                        <div className="text-[10px] font-black text-primary">ALL</div>
                                    </div>
                                    <span className={`text-[10px] md:text-xs font-bold uppercase ${selectedCategories.length === 0 ? 'text-primary' : 'text-gray-500'}`}>All</span>
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryToggle(cat.name)}
                                        className={`flex flex-col items-center gap-2 group flex-shrink-0 min-w-[70px] ${selectedCategories.includes(cat.name) ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                                    >
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${selectedCategories.includes(cat.name) ? 'border-secondary shadow-md scale-105' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <img src={cat.image || cat.img} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase whitespace-nowrap ${selectedCategories.includes(cat.name) ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</span>
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                    <p className="text-gray-500">Loading authentic remedies...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                    <p className="text-xl text-gray-500 mb-2">No products found matching your criteria.</p>
                                    <button onClick={() => { setSelectedCategory(''); setPage(1); }} className="text-primary hover:underline">Clear Filters</button>
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
