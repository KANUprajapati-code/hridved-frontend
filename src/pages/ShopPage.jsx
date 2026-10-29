import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { Filter, ChevronDown, ArrowRight, Star, X, Search, PackageOpen, Sparkles, Building2, Check } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import SEO from '../components/SEO';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import Badge from '../components/Badge';
import BulkEnquiryModal from '../components/BulkEnquiryModal';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const ShopPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [minRating, setMinRating] = useState(0);
    const [sortOption, setSortOption] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [shopContent, setShopContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');


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


    const [inStockOnly, setInStockOnly] = useState(false);

    // Category counts logic removed as requested for dynamic sync

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';

    // Initialize state from URL
    useEffect(() => {
        const cat = searchParams.get('category');
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        const rat = searchParams.get('rating');
        const sort = searchParams.get('sort');
        const stock = searchParams.get('inStock');
        const p = searchParams.get('pageNumber');

        if (cat) setSelectedCategories(cat.split(','));
        else setSelectedCategories([]);

        if (minP && !isNaN(minP)) setMinPrice(Number(minP));
        else setMinPrice(0);

        if (maxP && !isNaN(maxP)) setMaxPrice(Number(maxP));
        else setMaxPrice(10000);

        if (rat && !isNaN(rat)) setMinRating(Number(rat));
        else setMinRating(0);

        if (sort) setSortOption(sort);
        else setSortOption('newest');

        if (stock === 'true') setInStockOnly(true);
        else setInStockOnly(false);

        if (p && !isNaN(p)) setPage(Number(p));
        else setPage(1);

        setSearchTerm(keyword);
    }, [location.search, keyword]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            trackWebsiteEvent('search', { query: trimmed });
        }
        updateFilters({ keyword: trimmed });
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        updateFilters({ keyword: '' });
    };

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(location.search);

        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === null || newFilters[key] === undefined || newFilters[key] === '' || newFilters[key] === 0 || (Array.isArray(newFilters[key]) && newFilters[key].length === 0)) {
                params.delete(key);
            } else if (Array.isArray(newFilters[key])) {
                params.set(key, newFilters[key].join(','));
            } else {
                params.set(key, newFilters[key]);
            }
        });

        // Reset page on filter change unless it's a page change
        if (!newFilters.pageNumber) {
            params.delete('pageNumber');
        }

        navigate({ search: params.toString() });
    };

    // Hydrate categories from localStorage and fetch from MongoDB
    useEffect(() => {
        try {
            const cachedCat = localStorage.getItem('hridved_cached_categories');
            if (cachedCat) setCategories(JSON.parse(cachedCat));
        } catch (e) {}

        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                if (data) {
                    setCategories(data);
                    try { localStorage.setItem('hridved_cached_categories', JSON.stringify(data)); } catch (e) {}
                }
            } catch (err) {
                console.error("Error loading categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        // Hydrate initial products from localStorage if browsing default shop
        if (!location.search) {
            try {
                const cached = localStorage.getItem('hridved_cached_shop_products');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.products && parsed.products.length > 0) {
                        setProducts(parsed.products);
                        setTotalPages(parsed.pages || 1);
                        setTotalCount(parsed.count || 0);
                        setLoading(false);
                    }
                }
            } catch (e) {}
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch directly from URL params to ensure sync
                const { data } = await api.get(`/products${location.search || '?'}`);
                setProducts(data.products);
                setTotalPages(data.pages);
                setTotalCount(data.count);
                // Sync page state in case it changed server-side or via URL
                setPage(data.page);
                if (!location.search) {
                    try { localStorage.setItem('hridved_cached_shop_products', JSON.stringify(data)); } catch (e) {}
                }
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
                setShowMobileFilters(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    const handleCategoryToggle = (categoryName) => {
        const newCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter(c => c !== categoryName)
            : [...selectedCategories, categoryName];
        updateFilters({ category: newCategories });
    };

    const handlePriceChange = () => {
        updateFilters({ minPrice, maxPrice });
    };

    const handleRatingChange = (rating) => {
        updateFilters({ rating });
    };

    const handleStockToggle = () => {
        updateFilters({ inStock: !inStockOnly });
    };

    const handlePageChange = (p) => {
        updateFilters({ pageNumber: p });
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setMinPrice(0);
        setMaxPrice(10000);
        setMinRating(0);
        setInStockOnly(false);
        setPage(1);
        setSearchTerm('');
        navigate('/shop');
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

        const fetchShopContent = async () => {
            try {
                const { data } = await api.get('/content');
                setShopContent(data);
            } catch (error) {
                console.error("Error fetching shop content", error);
            }
        };
        fetchShopContent();
    }, []);


    const handleSortChange = (e) => {
        updateFilters({ sort: e.target.value });
    };

    const shopBreadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Apothecary Shop', path: '/shop' }
    ];

    return (
        <AnimatedPage>
            <SEO 
                title="Shop Authentic Ayurvedic Formulations"
                description="Explore classical Ayurvedic medicines, hair oils, skincare, and vitality courses handcrafted in 72-hour copper vessels. 100% vegetarian, Ayush & GMP certified."
                breadcrumbs={shopBreadcrumbs}
                includeSearchAction={true}
            />
            <div className="bg-background min-h-screen font-sans">
                {/* Minimal Header with Breadcrumbs, Search, and Category Quick Chips */}
                <div className="bg-white border-b border-gray-100 py-4 shadow-xs">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-800 font-bold">Shop</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-display font-bold text-primary">Ayurvedic Apothecary</h1>
                                <p className="text-gray-500 mt-2 text-sm max-w-2xl font-body">
                                    Explore our curated range of herbal formulations, oils, and wellness essentials rooted in 100+ years of healing traditions.
                                </p>
                            </div>

                            {/* In-page Real-time Search Input */}
                            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search remedies by name or herb..."
                                        className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            aria-label="Clear search"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Horizontal Quick Category Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto py-3 mt-3 no-scrollbar border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => updateFilters({ category: [] })}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                                    selectedCategories.length === 0
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary'
                                }`}
                            >
                                All Remedies
                            </button>
                            {categories.map((cat) => {
                                const isSelected = selectedCategories.includes(cat.name);
                                return (
                                    <button
                                        key={cat._id || cat.name}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat.name)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary'
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        {isSelected && <Check className="w-3 h-3 text-secondary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto py-8">
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
                        <div 
                            className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:relative md:inset-auto md:z-0 md:bg-transparent md:w-64 lg:w-72 flex-shrink-0 transition-all duration-300 ${showMobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible md:visible md:opacity-100'}`}
                            onClick={() => setShowMobileFilters(false)}
                        >
                            <div 
                                className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 overflow-y-auto md:p-0 md:bg-transparent md:h-auto md:w-full md:max-w-none md:static transform transition-transform duration-300 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-8 md:hidden">
                                    <h3 className="text-xl font-sans font-bold text-primary">Filters</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-primary">
                                        <X size={24} />
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
                                            <label className="flex items-center justify-between cursor-pointer group">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${selectedCategories.length === 0 ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                        {selectedCategories.length === 0 && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedCategories.length === 0}
                                                        onChange={() => updateFilters({ category: [] })}
                                                    />
                                                    <span className={`text-xs md:text-sm ${selectedCategories.length === 0 ? 'text-primary font-bold' : 'text-gray-600'}`}>All Products</span>
                                                </div>
                                            </label>
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
                                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                                onMouseUp={handlePriceChange}
                                                onTouchEnd={handlePriceChange}
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
                                                            onChange={() => handleRatingChange(rating)}
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
                                                    onChange={handleStockToggle}
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
                                            onClick={clearAllFilters}
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
                                <p className="text-gray-500 text-[10px] sm:text-xs">Showing <span className="font-bold text-gray-800">{products.length > 0 ? `${(page - 1) * 12 + 1}-${Math.min(page * 12, totalCount)}` : '0'}</span> of <span className="font-bold text-gray-800">{totalCount}</span> results</p>

                                <div className="flex items-center gap-4 md:gap-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SORT BY:</span>
                                        <div className="relative group">
                                            <select
                                                value={sortOption}
                                                onChange={handleSortChange}
                                                aria-label="Sort products"
                                                className="text-[11px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg hover:border-primary transition-all focus:outline-hidden appearance-none pr-8 cursor-pointer"
                                            >
                                                <option value="featured">Featured / Bestsellers</option>
                                                <option value="newest">Newest Arrivals</option>
                                                <option value="price-asc">Price: Low to High</option>
                                                <option value="price-desc">Price: High to Low</option>
                                                <option value="rating">Top Rated</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(keyword || selectedCategories.length > 0 || minPrice > 0 || maxPrice < 10000 || minRating > 0 || inStockOnly) && (
                                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                                    
                                    {keyword && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-primary text-xs font-bold rounded-full border border-secondary/30">
                                            <span>Search: "{keyword}"</span>
                                            <button onClick={handleClearSearch} aria-label="Clear search" className="hover:text-red-500 cursor-pointer"><X size={14} /></button>
                                        </span>
                                    )}

                                    {selectedCategories.map(cat => (
                                        <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            <span>{cat}</span>
                                            <button onClick={() => handleCategoryToggle(cat)} aria-label={`Remove category ${cat}`} className="hover:text-red-500 cursor-pointer"><X size={14} /></button>
                                        </span>
                                    ))}

                                    {(minPrice > 0 || maxPrice < 10000) && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            <span>₹{minPrice} - ₹{maxPrice}</span>
                                            <button onClick={() => { setMinPrice(0); setMaxPrice(10000); updateFilters({ minPrice: 0, maxPrice: 10000 }); }} aria-label="Reset price" className="hover:text-red-500 cursor-pointer"><X size={14} /></button>
                                        </span>
                                    )}

                                    {minRating > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            <span>{minRating}★ & Up</span>
                                            <button onClick={() => handleRatingChange(0)} aria-label="Reset rating" className="hover:text-red-500 cursor-pointer"><X size={14} /></button>
                                        </span>
                                    )}

                                    {inStockOnly && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                                            <span>In Stock Only</span>
                                            <button onClick={handleStockToggle} aria-label="Clear in stock filter" className="hover:text-red-500 cursor-pointer"><X size={14} /></button>
                                        </span>
                                    )}

                                    <button
                                        onClick={clearAllFilters}
                                        className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 underline uppercase tracking-wider cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    <ProductCardSkeleton count={6} />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-white rounded-3xl shadow-sm border border-accent/40 flex flex-col items-center max-w-lg mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-4">
                                        <PackageOpen size={32} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-primary mb-2">No Formulations Found</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm font-body mb-6 max-w-xs leading-relaxed">
                                        We couldn't find any remedies matching your criteria. Try adjusting your filters or search keywords.
                                    </p>
                                    <button 
                                        onClick={clearAllFilters} 
                                        className="inline-flex items-center gap-2 bg-primary text-white hover:bg-secondary hover:text-primary px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    {products.map((product, index) => (
                                        <ScrollReveal key={product._id} delay={index * 0.05} className="h-full">
                                            <ProductCard product={product} onQuickView={handleQuickView} />
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}

                            {/* B2B / Wholesale Clinical Supply Banner */}
                            <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 border border-accent/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 text-center sm:text-left">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-display font-bold text-primary">Ayurvedic Doctors & Clinic Wholesale</h4>
                                        <p className="text-xs text-gray-500 font-body">Looking for bulk volume pharmacy rates and clinic deliveries?</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(true)}
                                    className="shrink-0 inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    <span>Bulk Inquiries</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12 gap-2">
                                    <AnimatedButton
                                        disabled={page === 1}
                                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                                        className={`w-8 h-8 flex items-center justify-center rounded border border-gray-200 ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'} !p-0`}
                                    >
                                        &lt;
                                    </AnimatedButton>
                                    {[...Array(totalPages).keys()].map(x => (
                                        <AnimatedButton
                                            key={x + 1}
                                            onClick={() => handlePageChange(x + 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded border ${page === x + 1 ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} !p-0`}
                                        >
                                            {x + 1}
                                        </AnimatedButton>
                                    ))}
                                    <AnimatedButton
                                        disabled={page === totalPages}
                                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
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
                                <h2 className="text-3xl md:text-4xl font-sans font-bold text-primary mb-4">
                                    {shopContent?.shopFooter?.title || "Ayurveda for Every Body"}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed max-w-lg">
                                    {shopContent?.shopFooter?.subtitle || "All HRIDVED products are crafted following authentic scriptures and modern quality standards. Whether you're looking for skin radiance, digestion support, or stress relief, our holistic remedies are designed to restore balance to your Doshas."}
                                </p>
                                <Link to="/about" className="inline-flex items-center text-primary font-bold border border-primary px-6 py-2 rounded hover:bg-primary hover:text-white transition-colors">
                                    Learn more about our process <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                            <div className="md:w-1/2 flex justify-center md:justify-end">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-2xl transform rotate-3"></div>
                                    <img 
                                        src={shopContent?.shopFooter?.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"} 
                                        alt="Ayurvedic Bowl" 
                                        className="relative rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500 max-w-xs md:max-w-sm" 
                                    />
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

                {/* Bulk & Wholesale Modal */}
                <BulkEnquiryModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    initialProductName="Ayurvedic Clinic / Institutional Bulk"
                />
            </div>
        </AnimatedPage>
    );
};

export default ShopPage;
