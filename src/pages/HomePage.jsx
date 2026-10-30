
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Star, Truck, ShieldCheck, Leaf, Users, Award, Heart, History, 
    CheckCircle, Droplets, Sun, Sparkles, Play, VolumeX, ChevronLeft, ChevronRight, 
    X, Instagram, ExternalLink, MessageCircle, ChevronDown, ChevronUp, Mail, 
    Compass, HelpCircle, Send, Check, ShoppingCart, Zap, Flame, Shield, CheckCheck
} from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedImage from '../components/AnimatedImage';
import AnimatedButton from '../components/AnimatedButton';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import Badge from '../components/Badge';
import { useCart } from '../context/CartContext';
import { useFlyingElement } from '../hooks/useFlyingElement';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { addToCart } = useCart();
    const { animateAddToCart } = useFlyingElement();
    const { user, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const heroImageRef = useRef(null);

    const [content, setContent] = useState(() => {
        try {
            const cached = localStorage.getItem('hridved_cached_content');
            return cached ? JSON.parse(cached) : null;
        } catch { return null; }
    });
    const [bestsellers, setBestsellers] = useState(() => {
        try {
            const cached = localStorage.getItem('hridved_cached_bestsellers');
            return cached ? JSON.parse(cached) : [];
        } catch { return []; }
    });
    const [tips, setTips] = useState(() => {
        try {
            const cached = localStorage.getItem('hridved_cached_tips');
            return cached ? JSON.parse(cached) : [];
        } catch { return []; }
    });
    const [categories, setCategories] = useState(() => {
        try {
            const cached = localStorage.getItem('hridved_cached_categories');
            return cached ? JSON.parse(cached) : [];
        } catch { return []; }
    });
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isHeroLoaded, setIsHeroLoaded] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState('idle');
    const [newsletterMsg, setNewsletterMsg] = useState('');
    const [selectedPackIndex, setSelectedPackIndex] = useState(1); // 1 = 200ml Twin Pack (Most Popular)

    const isYouTubeUrl = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v');
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    };

    const isInstagramUrl = (url) => {
        if (!url) return false;
        return /instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i.test(url) || url.includes('instagram.com');
    };

    const getInstagramEmbedUrl = (url) => {
        if (!url) return '';
        const iframeMatch = url.match(/src=["']([^"']+)["']/);
        if (iframeMatch) {
            url = iframeMatch[1];
        }
        const match = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
            return `https://www.instagram.com/reel/${match[1]}/embed/`;
        }
        if (url.includes('/embed')) return url;
        return url;
    };

    const defaultSlides = [
        {
            badge: "PREMIUM WELLNESS",
            title: content?.hero?.title || "Ancient Wisdom. Masterfully Pure.",
            subtitle: content?.hero?.subtitle || "Experience the pinnacle of Ayurvedic excellence. Pure formulations handcrafted for your modern lifestyle.",
            image: getImageUrl(content?.hero?.image) || "",
            ctaText: content?.hero?.ctaText || "Shop Collection",
            link: content?.hero?.ctaLink || "/shop"
        },
        ...(content?.hero2?.image ? [{
            badge: "HAIR CARE RITUAL",
            title: content?.hero2?.title || "Unlock the Secret to Healthier Hair",
            subtitle: content?.hero2?.subtitle || "A luxurious Ayurvedic hair oil infused with Rosemary & Saffron for deep nourishment.",
            image: getImageUrl(content?.hero2?.image) || "",
            ctaText: content?.hero2?.ctaText || "Try Hridved",
            link: content?.hero2?.ctaLink || "/shop"
        }] : []),
        {
            badge: "100% PURE & CERTIFIED",
            title: content?.hero3?.title || "Handcrafted in Small Batches.",
            subtitle: content?.hero3?.subtitle || "Slow-cooked for 72 hours in traditional vessels. Lab-tested against 140+ safety parameters.",
            image: getImageUrl(content?.hero3?.image) || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format",
            ctaText: content?.hero3?.ctaText || "Our Purity Story",
            link: content?.hero3?.ctaLink || "/about"
        }
    ];

    const slides = defaultSlides.filter(s => !!s.image).length > 0
        ? defaultSlides.filter(s => !!s.image)
        : defaultSlides;

    const currentSlide = slides[activeSlide % slides.length] || slides[0];

    useEffect(() => {
        if (!slides.length) return;
        const slideInterval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 7000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    // Fast Stale-While-Revalidate caching: 0ms load from localStorage + background update from MongoDB
    useEffect(() => {
        try {
            const cachedContent = localStorage.getItem('hridved_cached_content');
            if (cachedContent) setContent(JSON.parse(cachedContent));

            const cachedBestsellers = localStorage.getItem('hridved_cached_bestsellers');
            if (cachedBestsellers) setBestsellers(JSON.parse(cachedBestsellers));

            const cachedTips = localStorage.getItem('hridved_cached_tips');
            if (cachedTips) setTips(JSON.parse(cachedTips));

            const cachedCategories = localStorage.getItem('hridved_cached_categories');
            if (cachedCategories) setCategories(JSON.parse(cachedCategories));
        } catch (e) {
            console.warn("Could not read localStorage cache", e);
        }

        const fetchData = async () => {
            try {
                const [contentRes, productsRes, tipsRes, categoriesRes] = await Promise.all([
                    api.get('/content'),
                    api.get('/products?isBestseller=true'),
                    api.get('/tips'),
                    api.get('/categories')
                ]);

                if (contentRes.data) {
                    setContent(contentRes.data);
                    try { localStorage.setItem('hridved_cached_content', JSON.stringify(contentRes.data)); } catch (e) {}
                }
                if (productsRes.data?.products) {
                    setBestsellers(productsRes.data.products);
                    try { localStorage.setItem('hridved_cached_bestsellers', JSON.stringify(productsRes.data.products)); } catch (e) {}
                }
                if (tipsRes.data) {
                    setTips(tipsRes.data);
                    try { localStorage.setItem('hridved_cached_tips', JSON.stringify(tipsRes.data)); } catch (e) {}
                }
                if (categoriesRes.data) {
                    setCategories(categoriesRes.data);
                    try { localStorage.setItem('hridved_cached_categories', JSON.stringify(categoriesRes.data)); } catch (e) {}
                }
                setIsLoadingCategories(false);
                setIsHeroLoaded(true);
            } catch (error) {
                console.error("Failed to load data from MongoDB", error);
                setIsLoadingCategories(false);
                setIsHeroLoaded(true);
            }
        };
        fetchData();
    }, []);

    // Listen to ESC and Arrow keys for reel modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActiveVideoUrl(null);
            if (e.key === 'ArrowRight' && activeVideoUrl) handleNextReel();
            if (e.key === 'ArrowLeft' && activeVideoUrl) handlePrevReel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeVideoUrl, activeReelIndex]);

    const handlePrevSlide = () => {
        setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
        setActiveSlide(prev => (prev + 1) % slides.length);
    };

    const reelReviews = content?.videos?.items?.length > 0 ? content.videos.items : [
        {
            title: "GUT & DIGESTION WELLNESS",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format",
            description: "new",
            link: "https://www.instagram.com/reel/C32s0dJrnQy/"
        },
        {
            title: "HAIR & SCALP NOURISHMENT",
            image: "https://images.unsplash.com/photo-1626444341257-58a13e41ae2a?q=80&w=600&auto=format",
            description: "new",
            link: "https://www.instagram.com/reel/C8qJ0c8qG3y/"
        },
        {
            title: "DAILY AYURVEDIC RITUAL",
            image: "https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?q=80&w=600&auto=format",
            description: "popular",
            link: "https://www.instagram.com/reel/C1Zl1f2LhXq/"
        }
    ];

    const handleOpenReel = (url, index) => {
        setActiveVideoUrl(url);
        setActiveReelIndex(index);
    };

    const handleNextReel = () => {
        if (!reelReviews.length) return;
        const nextIdx = (activeReelIndex + 1) % reelReviews.length;
        setActiveReelIndex(nextIdx);
        setActiveVideoUrl(reelReviews[nextIdx].link);
    };

    const handlePrevReel = () => {
        if (!reelReviews.length) return;
        const prevIdx = (activeReelIndex - 1 + reelReviews.length) % reelReviews.length;
        setActiveReelIndex(prevIdx);
        setActiveVideoUrl(reelReviews[prevIdx].link);
    };

    // Flagship Hero Product: Suvarnaprashan / Suvrnaprasan from MongoDB or authentic formulation
    const suvarnaprashanFromDb = bestsellers.find(p => 
        p.name?.toLowerCase().includes('suv') || 
        p.name?.toLowerCase().includes('swarna') || 
        p.name?.toLowerCase().includes('gold')
    );

    const heroProduct = suvarnaprashanFromDb ? {
        ...suvarnaprashanFromDb,
        _id: suvarnaprashanFromDb._id || "69999d3f601a51e1407f45cc",
        name: suvarnaprashanFromDb.name || "HRIDVED SUVRNAPRASAN DROP 15ML",
        image: suvarnaprashanFromDb.image || "https://res.cloudinary.com/dzyyckpal/image/upload/v1786369409/hridved_uploads/766194416_17900478183546574_2292074687249109710_n-1786369409386.jpg",
        price: suvarnaprashanFromDb.price || 999,
        mrp: suvarnaprashanFromDb.mrp || 1299,
        rating: suvarnaprashanFromDb.rating || 4.9,
        numReviews: suvarnaprashanFromDb.numReviews || 528,
        countInStock: suvarnaprashanFromDb.countInStock || 100
    } : {
        _id: "69999d3f601a51e1407f45cc",
        name: "HRIDVED SUVRNAPRASAN DROP 15ML",
        image: "https://res.cloudinary.com/dzyyckpal/image/upload/v1786369409/hridved_uploads/766194416_17900478183546574_2292074687249109710_n-1786369409386.jpg",
        price: 999,
        mrp: 1299,
        rating: 4.9,
        numReviews: 528,
        countInStock: 100
    };

    const heroPacks = [
        {
            id: '15ml',
            title: '15ml Starter Dose',
            badge: 'Pushya Nakshatra Trial',
            duration: '30-Day Immuno Drops',
            bottleCount: 1,
            price: heroProduct.price || 999,
            mrp: heroProduct.mrp || 1299,
            savings: (heroProduct.mrp || 1299) - (heroProduct.price || 999),
            discountPct: Math.round((((heroProduct.mrp || 1299) - (heroProduct.price || 999)) / (heroProduct.mrp || 1299)) * 100)
        },
        {
            id: '30ml',
            title: '30ml Twin Pack (2x15ml)',
            badge: 'Save ₹899 • Most Popular',
            duration: '90-Day Brain & Memory Course',
            bottleCount: 2,
            price: 1699,
            mrp: 2598,
            savings: 2598 - 1699,
            discountPct: 35,
            isPopular: true
        },
        {
            id: '45ml',
            title: '6-Month Sanskar Kit (3x15ml)',
            badge: 'Best Value • Complete Growth',
            duration: '180-Day Holistic Wellness Kit',
            bottleCount: 3,
            price: 2399,
            mrp: 3897,
            savings: 3897 - 2399,
            discountPct: 38,
            giftText: 'Includes Pure Brass Dropper'
        }
    ];

    const currentPack = heroPacks[selectedPackIndex] || heroPacks[1];

    const heroCartPayload = {
        _id: heroProduct._id,
        product: heroProduct._id,
        name: `${heroProduct.name} (${currentPack.title})`,
        image: heroProduct.image,
        price: currentPack.price,
        mrp: currentPack.mrp,
        countInStock: heroProduct.countInStock || 100,
        selectedVariant: currentPack.title,
        multiplier: currentPack.bottleCount || 1,
    };

    const handleHeroAddToCart = (e) => {
        e.preventDefault();
        if (!user) {
            openAuthModal({
                title: 'Login to Add to Bag',
                description: `Please verify your phone to add ${heroProduct.name} to your bag`,
                onSuccess: () => {
                    addToCart(heroCartPayload, 1);
                }
            });
            return;
        }
        const cartIcon = document.getElementById('cart-icon-container');
        if (heroImageRef.current && cartIcon) {
            animateAddToCart(heroImageRef.current, cartIcon, heroProduct.image);
        }
        addToCart(heroCartPayload, 1);
    };

    const handleHeroBuyNow = (e) => {
        e.preventDefault();
        addToCart(heroCartPayload, 1);
        navigate('/cart');
    };

    const handleHeroWhatsApp = (e) => {
        e.preventDefault();
        const text = `Namaste Hridved Team! I would like to order ${heroProduct.name} - ${currentPack.title} for ₹${currentPack.price}. Please guide me on dispatch and how to use it for best results.`;
        window.open(`https://wa.me/918980411390?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getIcon = (iconName, size = 32) => {
        switch (iconName) {
            case 'Leaf': return <Leaf size={size} />;
            case 'ShieldCheck': return <ShieldCheck size={size} />;
            case 'Truck': return <Truck size={size} />;
            case 'Users': return <Users size={size} />;
            case 'Award': return <Award size={size} />;
            case 'Heart': return <Heart size={size} />;
            case 'CheckCircle': return <CheckCircle size={size} />;
            case 'Droplets': return <Droplets size={size} />;
            case 'Sparkles': return <Sparkles size={size} />;
            case 'Sun': return <Sun size={size} />;
            default: return <Leaf size={size} />;
        }
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            setNewsletterStatus('error');
            setNewsletterMsg('Please enter a valid email address.');
            return;
        }
        setNewsletterStatus('loading');
        try {
            await api.post('/contact', {
                name: 'Newsletter Subscriber',
                email: newsletterEmail,
                message: 'Subscribed to Hridved Wellness Circle (10% Welcome Discount Requested)'
            });
            setNewsletterStatus('success');
            setNewsletterMsg('✨ Welcome to the Circle! Use code WELCOME10 for 10% off your first order.');
            setNewsletterEmail('');
        } catch (err) {
            try {
                const subscribers = JSON.parse(localStorage.getItem('hridved_subscribers') || '[]');
                subscribers.push({ email: newsletterEmail, date: new Date().toISOString() });
                localStorage.setItem('hridved_subscribers', JSON.stringify(subscribers));
                setNewsletterStatus('success');
                setNewsletterMsg('✨ Welcome to the Circle! Use code WELCOME10 for 10% off your first order.');
                setNewsletterEmail('');
            } catch (e) {
                setNewsletterStatus('error');
                setNewsletterMsg('Subscription failed. Please try again.');
            }
        }
    };

    const ritualSteps = [
        {
            step: "01",
            title: "Discover Your Prakriti",
            description: "Identify your unique bodily dosha and wellness goals—from deep root hair nourishment to revitalizing digestive balance.",
            icon: <Compass className="w-6 h-6 text-secondary" />
        },
        {
            step: "02",
            title: "72-Hour Copper Infusion",
            description: "Handcrafted in small batches using classical Ayurvedic decoction in copper vessels, activating bio-available herb potency.",
            icon: <Droplets className="w-6 h-6 text-secondary" />
        },
        {
            step: "03",
            title: "Sustained Daily Vitality",
            description: "Experience deep, restorative cellular harmony without dependency. 100% natural healing working with your body.",
            icon: <Sparkles className="w-6 h-6 text-secondary" />
        }
    ];

    const faqs = [
        {
            question: "What makes Hridved Ayurvedic formulations masterfully pure?",
            answer: "Every Hridved product is handcrafted in small batches using classical Ayurvedic procedures. Our oils and extracts are slow-brewed for 72 hours in copper vessels to retain maximum bioactive potency, without mineral oils, parabens, artificial fragrances, or animal derivatives."
        },
        {
            question: "Are all Hridved products 100% vegetarian and Ayush certified?",
            answer: "Yes, 100% of our catalogue is plant-based, cruelty-free, and certified under Ayush and GMP standards. Each batch undergoes rigorous testing across 140+ safety and purity parameters."
        },
        {
            question: "How long does it take to see visible wellness results?",
            answer: "Ayurveda works in harmony with your body's natural rhythms. Most users notice tangible improvements in vitality, hair texture, or digestion within 3 to 4 weeks of consistent daily usage."
        },
        {
            question: "Can I speak with an Ayurvedic Vaidya before purchasing?",
            answer: "Yes! We provide direct WhatsApp guidance with certified Ayurvedic doctors who will review your lifestyle, assess your balance, and advise the most suitable formulation free of charge."
        },
        {
            question: "What are your shipping timelines and charges across India?",
            answer: "We offer Free Shipping on all orders above ₹999 across India. Orders are dispatched within 24 hours from our certified pharmacy and typically reach metro cities in 2-3 business days and other regions in 3-5 days."
        },
        {
            question: "What is your replacement and return policy?",
            answer: "We stand behind our purity. If your product arrives damaged or defective, notify us within 7 days of delivery with photos for an immediate replacement or refund."
        }
    ];

    return (
        <>
            <AnimatedPage>
                <SEO
                    title="Ancient Ayurveda, Modern Wellness"
                    description="Hridved brings you pure Ayurvedic formulations handcrafted with wisdom from ancient texts, slow-infused for 72 hours in copper vessels, and tested against 140+ purity parameters."
                    includeOrganization={true}
                    includeSearchAction={true}
                    faqs={faqs}
                />

                <div className="min-h-screen bg-background">

                    {/* Hero Section Carousel Slider - Contained with preserved aspect ratio & split luxury layout */}
                    <section className="container mx-auto px-4 pt-6 pb-12 sm:pb-16 relative">
                        <div className="relative w-full min-h-[560px] md:h-[600px] lg:h-[640px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#053807]/92 via-[#0b4311]/88 to-[#032405]/92 backdrop-blur-xl border border-emerald-500/20 flex items-center">

                            {/* Ambient Blurred Background (Matches Current Slide Colors with Botanical Glow) */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <img
                                    src={currentSlide.image}
                                    alt=""
                                    className="w-full h-full object-cover blur-3xl opacity-30 scale-125 transform transition-all duration-1000 mix-blend-overlay"
                                />
                                {/* Transparent Green Botanical Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#053807]/95 via-[#053807]/75 to-[#053807]/40 md:to-transparent"></div>
                                {/* Golden & Emerald Glow Highlights */}
                                <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>
                                <div className="absolute -left-10 -bottom-20 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>
                            </div>

                            {/* Slide Content */}
                            <div
                                key={activeSlide}
                                className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-8 gap-6 md:gap-10 transition-opacity duration-500 ease-out"
                            >
                                {/* Left Column: Typography & Action */}
                                <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col justify-center text-white z-20 order-2 md:order-1 text-center md:text-left items-center md:items-start">
                                    {/* Pill Badge */}
                                    <div className="mb-3 sm:mb-4">
                                        <span className="inline-flex items-center gap-1.5 bg-secondary text-primary font-black px-4 py-1.5 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-md border border-secondary/30">
                                            <Sparkles size={13} className="text-primary animate-pulse" />
                                            {currentSlide.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-black text-white mb-3 sm:mb-4 leading-[1.18] drop-shadow-lg tracking-tight">
                                        {currentSlide.title}
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="text-xs sm:text-sm md:text-base text-gray-200/90 font-light leading-relaxed max-w-lg mb-6 sm:mb-8">
                                        {currentSlide.subtitle}
                                    </p>

                                    {/* CTA Button and Trust Notes */}
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
                                        <Link to={currentSlide.link}>
                                            <button className="inline-flex items-center gap-2.5 bg-secondary text-primary hover:bg-white hover:text-primary px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 group border-none cursor-pointer">
                                                <span>{currentSlide.ctaText || "Shop Collection"}</span>
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>

                                        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-300/80 font-medium border-l border-white/20 pl-4 py-1">
                                            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-secondary" /> 100% Pure</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Leaf size={14} className="text-secondary" /> Ayurvedic</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: High Quality Product Showcase (Aspect Ratio 100% Preserved) */}
                                <div className="w-full md:w-1/2 lg:w-5/12 h-[260px] sm:h-[340px] md:h-full flex items-center justify-center md:justify-end relative z-10 order-1 md:order-2">
                                    <div className="relative h-full w-full flex items-center justify-center md:justify-end p-2 sm:p-4">
                                        <img
                                            src={currentSlide.image}
                                            alt={currentSlide.title || "Hridved Product"}
                                            className="max-h-[240px] sm:max-h-[320px] md:max-h-[460px] lg:max-h-[500px] w-auto max-w-full object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Slider Navigation Arrows - styled top right with sleek green glassmorphism */}
                            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 flex gap-2">
                                <button
                                    onClick={handlePrevSlide}
                                    aria-label="Previous slide"
                                    className="w-10 h-10 bg-primary/60 hover:bg-primary text-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextSlide}
                                    aria-label="Next slide"
                                    className="w-10 h-10 bg-primary/60 hover:bg-primary text-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 transition-all active:scale-90 hover:scale-105 cursor-pointer"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Dot Indicators - bottom centered with green glassmorphism */}
                            <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-primary/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                            activeSlide === index 
                                                ? 'w-7 bg-secondary shadow-sm shadow-secondary/50' 
                                                : 'w-2 bg-white/40 hover:bg-white/70'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Slogan Intro Section - "Ayurveda. Simplified. Wellness That Works." format */}
                    <section className="py-16 md:py-24 text-center max-w-4xl mx-auto px-4">
                        <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                            Authentic Formulations
                        </span>
                        <h2 className="text-3xl md:text-5xl font-sans font-black text-primary leading-tight">
                            Ayurveda. Simplified.<br />
                            <span className="text-secondary">Wellness That Works.</span>
                        </h2>

                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mt-6 mb-8"></div>

                        <p className="text-gray-500 font-light text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                            Thoughtfully made Ayurvedic solutions to energize, restore, and support your natural balance. Handcrafted in small batches with pristine sourcing, ensuring the ultimate standard of wellness you deserve.
                        </p>

                        <Link to="/shop">
                            <button className="bg-primary text-white hover:bg-secondary hover:text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 border-none">
                                Shop Collection →
                            </button>
                        </Link>
                    </section>

                    {/* Brand Trust Bar */}
                    <div className="bg-white border-y border-gray-100 overflow-hidden py-6 md:py-8 shadow-sm">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-row overflow-x-auto no-scrollbar scroll-smooth justify-start md:justify-center items-center gap-8 md:gap-24 opacity-80 whitespace-nowrap">
                                {(content?.trustBar?.items?.length > 0 ? content.trustBar.items : [
                                    { title: '100% Organically Sourced', icon: 'Leaf' },
                                    { title: 'GMP & Ayush Certified', icon: 'Award' },
                                    { title: 'Pure Himalayan Ingredients', icon: 'ShieldCheck' },
                                    { title: 'Eco-Friendly Shipping', icon: 'Truck' }
                                ]).map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group hover:opacity-100 transition-opacity flex-shrink-0">
                                        <div className="group-hover:scale-110 transition-transform text-primary">
                                            {getIcon(item.icon, 24)}
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-600">{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Flagship Hero Product Spotlight Section - High-Conversion CRO Showcase */}
                    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FDFBF7] via-white to-[#FDFBF7] border-b border-gray-100 relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="container mx-auto px-4 max-w-6xl relative z-10">
                            <ScrollReveal>
                                {/* Section Header */}
                                <div className="text-center mb-10 md:mb-14">
                                    <span className="inline-flex items-center gap-1.5 bg-secondary/15 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-3 border border-secondary/30">
                                        <Sparkles size={13} className="text-secondary" /> THE HRIDVED SIGNATURE • AYURVEDIC BAL SANSKAR
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-3">
                                        Hero Formulation Spotlight
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-xl mx-auto">
                                        Classical Kashyapa Samhita formulation prepared with Certified 24K Swarna Bhasma, Medhya Brahmi, and Shankhpushpi in pure Cow Ghee & Raw Honey. The premier daily immunity and memory booster for children (0–16 years).
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-4"></div>
                                </div>

                                {/* Main Spotlight Card */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-6 md:p-10 lg:p-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                                        
                                        {/* Left: Product Visual Stage */}
                                        <div className="lg:col-span-5 flex flex-col items-center">
                                            <div className="relative w-full max-w-sm aspect-square bg-gradient-to-b from-[#f8f9fa] to-white rounded-3xl p-6 border border-gray-100 flex items-center justify-center group overflow-hidden">
                                                {/* Golden Ambient Halo */}
                                                <div className="absolute inset-0 bg-radial from-secondary/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>

                                                {/* Floating Botanical Badges */}
                                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                                                    <span className="bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                                        <Award size={11} className="text-secondary" /> #1 Child Bal Rasayana
                                                    </span>
                                                    <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                                        24K Certified Gold Bhasma
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                                                    <span className="bg-emerald-50 text-primary border border-emerald-200 text-[9px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                                                        <ShieldCheck size={11} className="text-primary" /> 140+ Safety Tested
                                                    </span>
                                                </div>

                                                {/* Product Image */}
                                                <Link to={`/product/${heroProduct._id}`} className="w-full h-full flex items-center justify-center">
                                                    <img
                                                        ref={heroImageRef}
                                                        src={getImageUrl(heroProduct.image)}
                                                        alt={heroProduct.name}
                                                        className="max-h-[300px] w-auto object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                                                    />
                                                </Link>
                                            </div>

                                            {/* Purity Guarantee Mini-Strip */}
                                            <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-4 text-center">
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                                    <p className="text-[10px] font-bold text-gray-700">24K Gold Bhasma</p>
                                                    <p className="text-[8px] text-gray-400">Lab Tested Purity</p>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                                    <p className="text-[10px] font-bold text-gray-700">Ayush Certified</p>
                                                    <p className="text-[8px] text-gray-400">GMP Licensed</p>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                                    <p className="text-[10px] font-bold text-gray-700">0% Chemicals</p>
                                                    <p className="text-[8px] text-gray-400">Pure Honey & Ghee</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Product Details, Pack Selector & 1-Click Purchase */}
                                        <div className="lg:col-span-7 flex flex-col">
                                            {/* Rating & Social Proof */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                                    <div className="flex text-amber-500">
                                                        {[...Array(5)].map((_, i) => (
                                                             <Star key={i} size={13} className="fill-current text-secondary" />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-black text-amber-900 ml-1">4.9 / 5.0</span>
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    Based on <strong>520+ Happy Parents</strong>
                                                </span>
                                                <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                                    99.2% Report Enhanced Immunity & Vitality
                                                </span>
                                            </div>

                                            {/* Title & Tagline */}
                                            <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">
                                                <Link to={`/product/${heroProduct._id}`} className="hover:text-secondary transition-colors">
                                                    {heroProduct.name}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
                                                Inspired by Maharshi Kashyapa’s sacred Suvarnaprashan Sanskar. Formulated with authentic 24K Swarna Bhasma (Gold Ash), Medhya Brahmi, Shankhpushpi, Vacha, and Guduchi in pure Desi Cow Ghee and Raw Honey to stimulate healthy brain development, sharpen memory, strengthen natural disease resistance, and promote overall physical growth in children.
                                            </p>

                                            {/* Botanical Highlights Chips */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200">
                                                    <Sparkles size={11} className="text-secondary" /> 24K Certified Swarna Bhasma
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-primary/5 text-primary text-[10px] font-black px-2.5 py-1 rounded-full border border-primary/10">
                                                    <Leaf size={11} /> Medhya Brahmi & Shankhpushpi
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100">
                                                    <ShieldCheck size={11} /> 100% Ayush Certified • Child Safe (0-16 Yrs)
                                                </span>
                                            </div>

                                            {/* Interactive Pack Selection (High Conversion CRO) */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                                                        Select Your Course / Pack:
                                                    </span>
                                                    <span className="text-[11px] text-secondary font-bold">
                                                        {currentPack.badge}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {heroPacks.map((pack, idx) => {
                                                        const isSelected = selectedPackIndex === idx;
                                                        return (
                                                            <div
                                                                key={pack.id}
                                                                onClick={() => setSelectedPackIndex(idx)}
                                                                className={`relative rounded-2xl p-3.5 border-2 cursor-pointer transition-all duration-300 text-left flex flex-col justify-between ${
                                                                    isSelected 
                                                                        ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5' 
                                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                            >
                                                                {pack.isPopular && (
                                                                    <div className="absolute -top-2.5 right-3 bg-secondary text-primary font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                                        Best Seller
                                                                    </div>
                                                                )}
                                                                {pack.giftText && (
                                                                    <div className="absolute -top-2.5 right-3 bg-emerald-700 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                                        Free Comb
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-xs font-black text-gray-900">{pack.duration}</span>
                                                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-500 font-medium">{pack.title}</p>
                                                                </div>
                                                                <div className="mt-3 pt-2 border-t border-gray-100 flex items-baseline justify-between">
                                                                    <span className="text-sm font-black text-primary">₹{pack.price}</span>
                                                                    <span className="text-[10px] text-gray-400 line-through">₹{pack.mrp}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Live Pricing Bar */}
                                            <div className="bg-[#fcfaf6] border border-amber-200/60 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Price (Taxes Included)</p>
                                                    <div className="flex items-baseline gap-2.5 mt-0.5">
                                                        <span className="text-3xl font-black text-primary">₹{currentPack.price}</span>
                                                        <span className="text-sm text-gray-400 line-through">₹{currentPack.mrp}</span>
                                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                                            Save ₹{currentPack.savings} ({currentPack.discountPct}% OFF)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                        <Truck size={13} /> Free Express Delivery
                                                    </span>
                                                </div>
                                            </div>

                                            {/* High-Converting Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={handleHeroAddToCart}
                                                    className="flex-1 bg-primary text-white hover:bg-opacity-95 px-6 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-none"
                                                >
                                                    <ShoppingCart size={16} />
                                                    <span>Add to Bag</span>
                                                </button>

                                                <button
                                                    onClick={handleHeroBuyNow}
                                                    className="flex-1 bg-gradient-to-r from-secondary to-[#c59e2b] text-primary hover:brightness-105 px-6 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-none"
                                                >
                                                    <Zap size={16} className="fill-current" />
                                                    <span>Instant Buy Now</span>
                                                </button>

                                                <button
                                                    onClick={handleHeroWhatsApp}
                                                    title="Order / Consult on WhatsApp"
                                                    className="bg-[#25D366] hover:bg-[#1fa851] text-white px-5 py-4 rounded-full font-bold text-xs transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-none"
                                                >
                                                    <MessageCircle size={16} />
                                                    <span className="hidden sm:inline">WhatsApp</span>
                                                </button>
                                            </div>

                                            {/* Trust Assurance Strip */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-gray-100 text-[11px] text-gray-500 font-medium text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <CheckCircle size={13} className="text-emerald-600" /> Dispatched in 24h
                                                </span>
                                                <span className="flex items-center justify-center gap-1">
                                                    <ShieldCheck size={13} className="text-secondary" /> 7-Day Replacement
                                                </span>
                                                <span className="flex items-center justify-center gap-1">
                                                    <Award size={13} className="text-primary" /> 100% Ayush Certified
                                                </span>
                                                <span className="flex items-center justify-center gap-1">
                                                    <Truck size={13} className="text-emerald-600" /> Free Shipping &gt; ₹999
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Shop by Category Section - Circular Icons */}
                    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
                        <div className="absolute top-20 right-[-5%] opacity-5 float-slow pointer-events-none">
                            <Leaf size={300} strokeWidth={0.5} />
                        </div>

                        <div className="container mx-auto">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-20">
                                    <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">Discover Wellness</span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">Shop by Category</h2>
                                    <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
                                </div>

                                <div className="flex overflow-x-auto pb-10 gap-8 md:gap-14 no-scrollbar justify-start md:justify-center scroll-smooth items-center px-4">
                                    {isLoadingCategories ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                                                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gray-100 border-2 md:border-8 border-gray-50 mb-4 md:mb-6 shadow-xl md:shadow-2xl"></div>
                                                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                                            </div>
                                        ))
                                    ) : (categories.length > 0 ? categories : [
                                        { name: 'Skin care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80' },
                                        { name: 'Hair care', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&auto=format&fit=crop&q=80' },
                                        { name: 'Personal care', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?w=800&auto=format&fit=crop&q=80' },
                                        { name: 'Immunity', image: 'https://images.unsplash.com/photo-1546868214-e95b36449173?w=800&auto=format&fit=crop&q=80' },
                                        { name: 'Ayurved medicine', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80' },
                                    ]).filter(cat => cat.name.toLowerCase() !== 'consultation').map((cat, idx) => {
                                        const link = `/shop?category=${encodeURIComponent(cat.name)}`;
                                        return (
                                            <Link to={link} key={idx} className="flex flex-col items-center group flex-shrink-0">
                                                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-2 md:border-8 border-gray-50 group-hover:border-secondary transition-all duration-700 mb-4 md:mb-6 shadow-xl md:shadow-2xl relative bg-white transform group-hover:scale-105 group-hover:-translate-y-2">
                                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-500 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <ArrowRight className="text-white" size={32} />
                                                    </div>
                                                    <AnimatedImage
                                                        src={cat.image || cat.img}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-3"
                                                        containerClassName="w-full h-full"
                                                        loading="eager"
                                                    />
                                                </div>
                                                <h3 className="text-[11px] md:text-sm font-black text-gray-800 group-hover:text-primary transition-colors tracking-[0.15em] uppercase text-center w-full">{cat.name}</h3>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* ProSeries / Bestsellers Section */}
                    <section className="py-16 md:py-24 bg-background/50 border-t border-gray-100">
                        <div className="container mx-auto px-4">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                        ProSeries Collection
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        Our Bestsellers
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-2xl mx-auto">
                                        Our most exclusive wellness collection. Crafted with the finest ingredients, advanced formulations, and uncompromising quality.
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 mb-12">
                                    {bestsellers.length > 0 ? (
                                        bestsellers.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))
                                    ) : (
                                        [...Array(4)].map((_, i) => (
                                            <div key={i} className="h-110 bg-gray-50 border border-gray-100 rounded-[2rem] animate-pulse"></div>
                                        ))
                                    )}
                                </div>

                                <div className="text-center">
                                    <Link to="/shop">
                                        <button className="bg-primary text-white hover:bg-secondary hover:text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl border-none">
                                            Explore ProSeries Collection →
                                        </button>
                                    </Link>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* The 3-Step Ayurvedic Ritual (How It Works) */}
                    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
                        <div className="container mx-auto px-4 max-w-6xl">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                        The Ayurvedic Way
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        How It Works
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-xl mx-auto">
                                        Ancient classical science translated into an effortless, restorative daily routine for modern life.
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                    {ritualSteps.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="relative bg-background rounded-3xl p-8 border border-accent/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                                        >
                                            <div className="absolute top-6 right-6 text-2xl font-black text-accent/50 select-none group-hover:text-secondary transition-colors">
                                                {item.step}
                                            </div>

                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-accent/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>

                                            <h3 className="text-lg md:text-xl font-display font-bold text-primary mb-3">
                                                {item.title}
                                            </h3>

                                            <p className="text-xs md:text-sm text-gray-600 font-body leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Video Reviews / Reels Section - styled like Myura */}
                    <section className="py-16 md:py-24 bg-background/50 border-t border-gray-100">
                        <div className="container mx-auto px-4">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                        Ayurveda in Action
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        Shared Journeys
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-xl mx-auto">
                                        Real reviews from real people. Watch how Hridved formulations have helped restore balance and energy.
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                {/* Reels slider/grid container */}
                                <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto justify-center">
                                    {reelReviews.map((reel, idx) => {
                                        const isInsta = isInstagramUrl(reel.link);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleOpenReel(reel.link, idx)}
                                                className="w-full md:w-80 group relative rounded-[2rem] overflow-hidden shadow-md border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer bg-white"
                                            >
                                                {/* Reel Video Thumbnail */}
                                                <div className="h-96 relative overflow-hidden bg-gray-900">
                                                    <img
                                                        src={getImageUrl(reel.image)}
                                                        alt={reel.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                    />
                                                    {/* Dark overlay */}
                                                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors pointer-events-none"></div>

                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                                                            <Play size={20} className="fill-current ml-1" />
                                                        </div>
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                                                        {isInsta ? (
                                                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-wider uppercase">
                                                                <Instagram size={12} /> REEL
                                                            </span>
                                                        ) : (
                                                            <span></span>
                                                        )}

                                                        {(reel.isNew || reel.description?.toLowerCase() === 'new') && (
                                                            <span className="bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Label below thumbnail */}
                                                <div className="bg-gray-50 border-t border-gray-100 py-4 px-4 text-center">
                                                    <h4 className="text-xs font-black text-gray-800 tracking-wider uppercase truncate">
                                                        {reel.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium flex items-center justify-center gap-1">
                                                        {isInsta ? 'Tap to play Instagram Reel' : 'Tap to play video'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="text-center mt-12">
                                    <button className="bg-gray-100 text-primary hover:bg-secondary hover:text-primary px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm border-none">
                                        View All Videos →
                                    </button>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Unified "At Hridved Wellness" Certified Grid Section */}
                    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
                        <div className="container mx-auto px-4 max-w-6xl">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        At Hridved Wellness
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-xl mx-auto">
                                        We believe true well-being comes from nature. Our thoughtfully crafted Ayurvedic supplements blend ancient wisdom with modern science to help you feel your best, naturally.
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                {/* Certification Grid - 4 badges like Myura */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
                                    <div className="bg-[#f3f4f6]/50 border border-gray-100 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center group hover:bg-white hover:shadow-md transition-all duration-500">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <Award size={22} />
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider">
                                            Lab Tested
                                        </h4>
                                    </div>

                                    <div className="bg-[#f0fdf4]/50 border border-gray-100 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center group hover:bg-white hover:shadow-md transition-all duration-500">
                                        <div className="w-12 h-12 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center text-[#22c55e] mb-4 group-hover:bg-[#22c55e] group-hover:text-white transition-colors duration-300">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider">
                                            Verified Ingredients
                                        </h4>
                                    </div>

                                    <div className="bg-[#fef9c3]/50 border border-gray-100 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center group hover:bg-white hover:shadow-md transition-all duration-500">
                                        <div className="w-12 h-12 bg-secondary/15 rounded-2xl flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-primary transition-colors duration-300">
                                            <CheckCircle size={22} />
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider">
                                            GMP Certified
                                        </h4>
                                    </div>

                                    <div className="bg-[#fae8ff]/50 border border-gray-100 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center group hover:bg-white hover:shadow-md transition-all duration-500">
                                        <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                            <Award size={22} />
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider">
                                            Ayush Certified
                                        </h4>
                                    </div>
                                </div>

                                {/* Callout Brand logo block at the bottom of At Hridved section */}
                                <div className="text-center max-w-xl mx-auto pt-6">
                                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                                        <img src="/logo-asset4.png" alt="Hridved Logo" className="w-20 h-auto object-contain" />
                                    </div>
                                    <p className="text-gray-600 text-sm md:text-base font-light italic leading-relaxed">
                                        "Ayurvedic wellness made simple. Hridved offers honest, natural supplements and formulations for daily vitality and balance—no shortcuts, just nature."
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Free Ayurvedic Doctor / WhatsApp Consultation CTA */}
                    <section className="py-16 md:py-20 bg-background">
                        <div className="container mx-auto px-4 max-w-5xl">
                            <ScrollReveal>
                                <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#053807] via-[#072d09] to-[#041d06] p-8 sm:p-12 md:p-16 text-white shadow-2xl border border-secondary/30">
                                    {/* Ambient glow */}
                                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/40 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                        <div className="max-w-xl">
                                            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                                <MessageCircle className="w-4 h-4 text-secondary" />
                                                Free Ayurvedic Consultation
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-4">
                                                Confused Which Formulation Is Right For You?
                                            </h2>
                                            <p className="text-gray-200 text-sm sm:text-base font-body leading-relaxed mb-6">
                                                Connect directly with our certified Ayurvedic Vaidyas on WhatsApp. Get personalized advice on dosha balance, herbal dosages, and lifestyle rituals with zero consultation fees.
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-300">
                                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-secondary" /> 100% Confidential</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-secondary" /> Qualified Vaidyas</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-secondary" /> Instant Response</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col sm:flex-row gap-4">
                                            <a
                                                href="https://wa.me/918980411390?text=Hello%20Hridved%2C%20I%20would%20like%20a%20free%20Ayurvedic%20doctor%20consultation."
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-3 bg-secondary text-primary hover:bg-white hover:text-primary px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                                            >
                                                <MessageCircle className="w-5 h-5 text-primary" />
                                                <span>Chat On WhatsApp</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Interactive FAQ Accordion */}
                    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
                        <div className="container mx-auto px-4 max-w-4xl">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                        Got Questions?
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        Frequently Asked Questions
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-lg mx-auto">
                                        Honest answers about our ingredients, certifications, shipping, and clinical standards.
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                <div className="space-y-4">
                                    {faqs.map((faq, idx) => {
                                        const isOpen = openFaqIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                className="border border-gray-200 rounded-2xl overflow-hidden bg-background/40 transition-colors hover:border-accent"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                                    aria-expanded={isOpen}
                                                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-hidden focus:bg-background/80 transition-colors cursor-pointer"
                                                >
                                                    <span className="text-base sm:text-lg font-display font-bold text-primary pr-4">
                                                        {faq.question}
                                                    </span>
                                                    <div className={`w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary text-white border-primary' : 'text-gray-500'}`}>
                                                        <ChevronDown className="w-4 h-4" />
                                                    </div>
                                                </button>

                                                {isOpen && (
                                                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-gray-600 font-body leading-relaxed border-t border-gray-100/60 bg-white">
                                                        {faq.answer}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Hridved Wellness Circle Newsletter Section */}
                    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FDFBF7] to-white border-t border-gray-100">
                        <div className="container mx-auto px-4 max-w-3xl text-center">
                            <ScrollReveal>
                                <div className="w-16 h-16 rounded-2xl bg-secondary/15 text-primary flex items-center justify-center mx-auto mb-6">
                                    <Mail className="w-8 h-8 text-secondary" />
                                </div>

                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                    Exclusive Membership
                                </span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
                                    Join The Hridved Wellness Circle
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 font-light max-w-xl mx-auto mb-8">
                                    Subscribe to receive seasonal Ayurvedic health rituals, herbal lifestyle insights, and an instant <strong className="font-semibold text-primary">10% discount coupon</strong> for your first order.
                                </p>

                                <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            placeholder="Enter your email address..."
                                            disabled={newsletterStatus === 'loading'}
                                            className="flex-1 px-5 py-3.5 rounded-full border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={newsletterStatus === 'loading'}
                                            className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-secondary hover:text-primary px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                                        >
                                            {newsletterStatus === 'loading' ? (
                                                <span>Subscribing...</span>
                                            ) : (
                                                <>
                                                    <span>Claim 10% Off</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {newsletterStatus === 'success' && (
                                        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{newsletterMsg}</span>
                                        </div>
                                    )}

                                    {newsletterStatus === 'error' && (
                                        <p className="mt-3 text-xs text-rose-600 font-medium">
                                            {newsletterMsg}
                                        </p>
                                    )}

                                    <p className="mt-3 text-[11px] text-gray-400">
                                        No spam, ever. Unsubscribe at any time with a single click.
                                    </p>
                                </form>
                            </ScrollReveal>
                        </div>
                    </section>

                    {/* Dynamic Video & Instagram Reel Review Modal */}
                    {activeVideoUrl && (
                        <div 
                            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md transition-opacity duration-300 ease-out"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setActiveVideoUrl(null);
                            }}
                        >
                            {isInstagramUrl(activeVideoUrl) ? (
                                /* Dedicated Instagram Reel Smartphone Container */
                                <div className="relative w-full max-w-[420px] h-[85vh] max-h-[760px] bg-[#0c0c0c] rounded-[2.5rem] shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
                                    {/* Reel Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 bg-black/95 border-b border-gray-800/80 z-20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm">
                                                <Instagram size={15} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white tracking-wide">Instagram Reel</p>
                                                <p className="text-[10px] text-gray-400 truncate max-w-[170px]">{reelReviews[activeReelIndex]?.title || "Hridved Wellness"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={activeVideoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                                title="Open on Instagram"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <button
                                                onClick={() => setActiveVideoUrl(null)}
                                                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Instagram Embed iframe */}
                                    <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                                        <iframe
                                            src={getInstagramEmbedUrl(activeVideoUrl)}
                                            className="w-full h-full border-none"
                                            title="Instagram Reel Player"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                            allowFullScreen
                                            scrolling="no"
                                        ></iframe>
                                    </div>

                                    {/* Bottom Navigation Toolbar */}
                                    <div className="px-5 py-3 bg-black/95 border-t border-gray-800/80 flex items-center justify-between text-white text-xs">
                                        <button
                                            onClick={handlePrevReel}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-semibold cursor-pointer"
                                        >
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {activeReelIndex + 1} of {reelReviews.length}
                                        </span>
                                        <button
                                            onClick={handleNextReel}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-semibold cursor-pointer"
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : !isYouTubeUrl(activeVideoUrl) ? (
                                /* Uploaded Reel MP4/MOV Video in Vertical Smartphone Player */
                                <div className="relative w-full max-w-[420px] h-[85vh] max-h-[760px] bg-[#0c0c0c] rounded-[2.5rem] shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 bg-black/95 border-b border-gray-800/80 z-20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm">
                                                <Instagram size={15} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white tracking-wide">@hridvedayurveda</p>
                                                <p className="text-[10px] text-gray-400 truncate max-w-[170px]">{reelReviews[activeReelIndex]?.title || "Hridved Reel"}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveVideoUrl(null)}
                                            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Video Player */}
                                    <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                                        <video
                                            src={getImageUrl(activeVideoUrl)}
                                            className="w-full h-full object-cover"
                                            controls
                                            autoPlay
                                            loop
                                            playsInline
                                        />
                                    </div>

                                    {/* Bottom Navigation Toolbar */}
                                    <div className="px-5 py-3 bg-black/95 border-t border-gray-800/80 flex items-center justify-between text-white text-xs">
                                        <button
                                            onClick={handlePrevReel}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-semibold cursor-pointer"
                                        >
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {activeReelIndex + 1} of {reelReviews.length}
                                        </span>
                                        <button
                                            onClick={handleNextReel}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-semibold cursor-pointer"
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Widescreen Video Player (YouTube) */
                                <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                                    <button
                                        onClick={() => setActiveVideoUrl(null)}
                                        className="absolute top-4 right-4 z-[10000] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all active:scale-95 border-none shadow-lg cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="aspect-video w-full flex items-center justify-center bg-black">
                                        <iframe
                                            className="w-full h-full border-none"
                                            src={getYouTubeEmbedUrl(activeVideoUrl)}
                                            title="Video Player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </AnimatedPage>
        </>
    );
};

export default HomePage;
