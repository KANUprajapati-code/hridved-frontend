import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import { Sparkles, ShieldCheck, Leaf, ArrowLeft, Filter, ChevronDown, CheckCircle, Info } from 'lucide-react';

// Hardcoded fallback metadata for approved categories and concerns
const CATEGORY_META = {
    'child-care': {
        name: 'Child Care',
        badge: 'Classical Bal Sanskar',
        description: 'Time-honoured Ayurvedic formulations crafted specifically for infants and children (0-16 yrs). Made with 24K Swarna Bhasma, Medhya Brahmi, and pure Desi Cow Ghee to nurture daily immunity, vitality, and memory.',
        relatedConcerns: ['Bal Rasayana (Child Immunity & Growth)']
    },
    'skin-care': {
        name: 'Skin Care',
        badge: 'Classical Varnya Vidhi',
        description: 'Authentic botanical facial oils and micro-pulverized herbal cleansers formulated with pure Kashmiri saffron, sandalwood, and kumkumadi herbs to support natural skin radiance and blemish clarity.',
        relatedConcerns: ['Varnya Care (Skin Radiance & Clarity)']
    },
    'hair-care': {
        name: 'Hair Care',
        badge: 'Classical Keshya Rasayana',
        description: 'Cold-pressed Ayurvedic hair treatments slowly infused for 72 hours with Rosemary, Saffron, and cooling botanical herbs to nourish follicles, strengthen roots, and protect scalp balance.',
        relatedConcerns: ['Keshya Care (Hair Fall & Scalp Health)']
    },
    'immunity': {
        name: 'Immunity',
        badge: 'Vedic Rasayana & Ojas',
        description: 'Classical Ayurvedic vitality tonics, pure A2 Bilona Cow Ghee, and targeted herbal oils to kindle digestive fire (Agni) and support natural physical resistance and joint comfort.',
        relatedConcerns: ['Rasayana (Daily Vitality & Ojas)', 'Sandhi Care (Joint & Muscle Comfort)']
    }
};

const CONCERN_META = {
    'bal-rasayana': {
        name: 'Bal Rasayana (Child Immunity & Growth)',
        category: 'Child care',
        badge: 'Classical Bal Sanskar',
        description: 'Classical Ayurvedic paediatric rasayana traditionally administered to foster physical growth, Ojas (immunity), memory, and cognitive vitality in growing children.',
    },
    'keshya-care': {
        name: 'Keshya Care (Hair Fall & Scalp Health)',
        category: 'Hair care',
        badge: 'Classical Keshya Rasayana',
        description: 'Ancient Ayurvedic botanical oils infused with Rosemary, Saffron, and cooling herbs designed to nourish follicles, strengthen roots, and restore natural scalp shine.',
    },
    'varnya-care': {
        name: 'Varnya Care (Skin Radiance & Clarity)',
        category: 'Skin care',
        badge: 'Classical Varnya Vidhi',
        description: 'Time-tested classical Ayurvedic herbal blends like Kumkumadi and micro-pulverized natural cleansers to promote clear, balanced, and radiant complexion.',
    },
    'rasayana-vitality': {
        name: 'Rasayana (Daily Vitality & Ojas)',
        category: 'Immunity',
        badge: 'Pure A2 Bilona Rasayana',
        description: 'Classical Ayurvedic rejuvenators and pure Vedic A2 Bilona Cow Ghee prepared according to traditional texts to kindle digestive fire (Agni) and support natural vitality.',
    },
    'sandhi-care': {
        name: 'Sandhi Care (Joint & Muscle Comfort)',
        category: 'Immunity',
        badge: 'Classical Vata Hara',
        description: 'Penetrating Ayurvedic herbal oils specifically formulated to pacify aggravated Vata dosha, easing muscle stiffness and supporting flexible, comfortable joint movement.',
    }
};

const CategoryLandingPage = () => {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isConcernMode = location.pathname.startsWith('/concern');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('featured');
    const [activeConcernFilter, setActiveConcernFilter] = useState('');
    const [categoryDetails, setCategoryDetails] = useState(null);

    // Resolve meta based on mode
    const currentMeta = isConcernMode
        ? (CONCERN_META[slug] || {
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            badge: 'Ayurvedic Concern',
            description: 'Classical Ayurvedic formulations supporting holistic vitality and daily balance.'
        })
        : (CATEGORY_META[slug] || {
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            badge: 'Ayurvedic Category',
            description: 'Pure Ayurvedic formulations crafted in strict accordance with classical texts.'
        });

    useEffect(() => {
        let isCancelled = false;
        setLoading(true);

        const fetchData = async () => {
            try {
                if (isConcernMode) {
                    // Try fetch from concerns API first
                    const { data } = await api.get(`/concerns/slug/${slug}`).catch(() => ({ data: null }));
                    if (!isCancelled && data && data.products) {
                        setCategoryDetails(data.concern);
                        setProducts(data.products);
                        setLoading(false);
                        return;
                    }
                    // Fallback to product query by concern
                    const prodRes = await api.get(`/products?concern=${encodeURIComponent(currentMeta.name)}`);
                    if (!isCancelled) {
                        setProducts(prodRes.data?.products || []);
                        setLoading(false);
                    }
                } else {
                    // Category mode
                    const catName = currentMeta.name;
                    const cleanSlugName = slug ? slug.replace(/-/g, ' ') : '';
                    const queryCategories = Array.from(new Set([catName, cleanSlugName, catName.toLowerCase()])).filter(Boolean).join(',');
                    const prodRes = await api.get(`/products?category=${encodeURIComponent(queryCategories)}`);
                    if (!isCancelled) {
                        setProducts(prodRes.data?.products || []);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load category/concern products', err);
                if (!isCancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, [slug, isConcernMode, currentMeta.name]);

    // Apply sorting
    const sortedProducts = [...products].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortOption === 'bestseller') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        return 0; // default featured
    });

    const breadcrumbs = [
        { label: 'Shop', path: '/shop' },
        ...(isConcernMode ? [{ label: 'Shop by Concern', path: '/shop' }] : []),
        { label: currentMeta.name }
    ];

    return (
        <AnimatedPage>
            <SEO
                title={`${currentMeta.name} — Authentic Ayurvedic Formulations`}
                description={currentMeta.description}
            />

            <div className="min-h-screen bg-background pb-16">
                {/* Header Container */}
                <div className="bg-gradient-to-b from-[#053807]/10 via-transparent to-transparent border-b border-gray-100">
                    <div className="container mx-auto px-4 pt-4 pb-10 max-w-7xl">
                        {/* Breadcrumbs */}
                        <Breadcrumbs items={breadcrumbs} />

                        {/* Title Banner */}
                        <div className="mt-4 max-w-3xl">
                            <span className="inline-flex items-center gap-1.5 bg-secondary text-primary font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wider mb-3 shadow-xs">
                                <Sparkles size={12} className="text-primary" />
                                {currentMeta.badge}
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-primary mb-4 leading-tight">
                                {currentMeta.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                                {currentMeta.description}
                            </p>
                        </div>

                        {/* Micro Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-gray-200/60 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1 text-primary">
                                <Leaf size={14} className="text-secondary" /> 100% Classical Ayurveda
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary">
                                <ShieldCheck size={14} className="text-secondary" /> Lab-Tested Quality
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary">
                                <CheckCircle size={14} className="text-secondary" /> Small Batch Handcrafted
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content & Product Grid */}
                <div className="container mx-auto px-4 max-w-7xl pt-8">
                    {/* Controls Row: Results count + Sorting */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-8">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">
                            Showing <strong className="text-primary">{sortedProducts.length}</strong> authentic Ayurvedic {sortedProducts.length === 1 ? 'formulation' : 'formulations'}
                        </p>

                        <div className="flex items-center gap-3">
                            <label htmlFor="sort-select" className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                Sort By:
                            </label>
                            <select
                                id="sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
                            >
                                <option value="featured">Featured</option>
                                <option value="bestseller">Bestsellers First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto w-full">
                            {[...Array(4)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto w-full">
                            {sortedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center max-w-md mx-auto">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                <Leaf size={28} className="text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold font-serif text-primary mb-2">
                                New Batches Being Handcrafted
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 font-light">
                                Authentic formulations for this category are currently slow-brewing in our Gujarat pharmacy.
                            </p>
                            <Link to="/shop">
                                <button className="bg-primary text-white hover:bg-secondary hover:text-primary px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md">
                                    Explore All Available Products →
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Non-Diagnostic AYUSH Educational Statement */}
                    <div className="mt-16 p-6 rounded-2xl bg-[#F9F6F0] border border-[#E5D3B3]/60 flex items-start gap-4 shadow-xs">
                        <Info size={20} className="text-primary shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-600 leading-relaxed font-light">
                            <strong className="text-primary font-bold block mb-1">
                                Classical Ayurvedic Knowledge Notice (AYUSH Compliance)
                            </strong>
                            The classical herbs, formulations, and traditional preparations described on this page are referenced in classical Ayurvedic compendiums for supporting balanced doshas and constitutional well-being. These formulations are not intended to diagnose, treat, cure, or prevent any clinical disease. For personalized advice, please seek guidance from a qualified Ayurvedic physician or pediatrician.
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CategoryLandingPage;

