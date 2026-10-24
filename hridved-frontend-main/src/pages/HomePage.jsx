
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Leaf, Users, Award, Heart, History, CheckCircle, Droplets, Sun, Sparkles, Play, VolumeX, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedImage from '../components/AnimatedImage';
import AnimatedButton from '../components/AnimatedButton';
import SEO from '../components/SEO';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const [content, setContent] = useState(null);
    const [bestsellers, setBestsellers] = useState([]);
    const [tips, setTips] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isHeroLoaded, setIsHeroLoaded] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [activeFaq, setActiveFaq] = useState(0);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState('');
    const homepageCopy = content?.homepage?.data || {};
    const spotlightProduct = bestsellers.find((product) => product._id === homepageCopy.spotlightProductId) || bestsellers[0];

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

    const slides = [
        {
            badge: "PREMIUM WELLNESS",
            title: content?.hero?.title || "Ancient Wisdom. Masterfully Pure.",
            subtitle: content?.hero?.subtitle || "Experience the pinnacle of Ayurvedic excellence. Pure formulations handcrafted for your modern lifestyle.",
            image: getImageUrl(content?.hero?.image, { width: 1800 }) || "",
            ctaText: content?.hero?.ctaText || "Shop Collection",
            link: content?.hero?.ctaLink || "/shop"
        },
        {
            badge: "100% PURE & CERTIFIED",
            title: content?.hero3?.title || "Handcrafted in Small Batches.",
            subtitle: content?.hero3?.subtitle || "Slow-cooked for 72 hours in traditional vessels. Lab-tested against 140+ safety parameters.",
            image: getImageUrl(content?.hero3?.image, { width: 1800 }) || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format",
            ctaText: content?.hero3?.ctaText || "Our Purity Story",
            link: content?.hero3?.ctaLink || "/about"
        }
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 7000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    useEffect(() => {
        // Safety fallback to hide loader after 1.5s
        const safetyTimer = setTimeout(() => {
            setIsPageLoading(false);
        }, 1500);

        if (!isLoadingCategories && isHeroLoaded) {
            const timer = setTimeout(() => setIsPageLoading(false), 150);
            return () => {
                clearTimeout(timer);
                clearTimeout(safetyTimer);
            };
        }

        return () => clearTimeout(safetyTimer);
    }, [isLoadingCategories, isHeroLoaded]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentRes, productsRes, tipsRes, categoriesRes] = await Promise.all([
                    api.get('/content'),
                    api.get('/products?isBestseller=true'),
                    api.get('/tips'),
                    api.get('/categories')
                ]);

                setContent(contentRes.data);
                setBestsellers(productsRes.data.products || []);
                setIsLoadingProducts(false);
                setTips(tipsRes.data || []);
                setCategories(categoriesRes.data || []);
                setIsLoadingCategories(false);
                setIsHeroLoaded(true);
            } catch (error) {
                console.error("Failed to load data", error);
                setIsLoadingProducts(false);
                setIsLoadingCategories(false);
                setIsHeroLoaded(true);
            }
        };
        fetchData();
    }, []);

    const handlePrevSlide = () => {
        setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
        setActiveSlide(prev => (prev + 1) % slides.length);
    };

    const subscribeNewsletter = async (event) => {
        event.preventDefault();
        try {
            await api.post('/newsletter', { email: newsletterEmail });
            setNewsletterStatus('You are subscribed. Thank you!');
            setNewsletterEmail('');
        } catch (error) {
            setNewsletterStatus(error.response?.data?.message || 'Could not subscribe. Please try again.');
        }
    };

    const reelReviews = content?.videos?.items || [];

    const getIcon = (iconName, size = 32) => {
        switch (iconName) {
            case 'Leaf': return <Leaf size={size} />;
            case 'ShieldCheck': return <ShieldCheck size={size} />;
            case 'Truck': return <Truck size={size} />;
            case 'Users': return <Users size={size} />;
            case 'Award': return <Award size={size} />;
            case 'Heart': return <Heart size={size} />;
            case 'History': return <History size={size} />;
            case 'CheckCircle': return <CheckCircle size={size} />;
            case 'Droplets': return <Droplets size={size} />;
            case 'Sparkles': return <Sparkles size={size} />;
            case 'Sun': return <Sun size={size} />;
            default: return <Leaf size={size} />;
        }
    };

    return (
        <>
            <Loader isLoading={isPageLoading} />
            <AnimatedPage>
                <SEO
                    title="Ancient Ayurveda, Modern Wellness"
                    description="Hridved brings you pure Ayurvedic formulations handcrafted with wisdom from ancient texts, delivered with modern purity standards. Explore our range of herbal medicines, oils, and wellness products."
                />

                <div className="min-h-screen bg-background">

                    {/* Hero Section Carousel Slider - contained within rounded cards like Myura */}
                    <section className="container mx-auto px-4 pt-8 pb-16 relative">
                        <div className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-primary">

                            {/* Slide Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {/* Image background with gradient */}
                                    <img
                                        src={slides[activeSlide].image}
                                        alt={slides[activeSlide].title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none"></div>

                                    {/* Slide Text Content overlay */}
                                    <div className="absolute inset-0 flex items-center px-8 sm:px-16 md:px-24 z-10">
                                        <div className="max-w-2xl text-white">
                                            {/* Pill Tag */}
                                            <span className="bg-secondary/90 text-primary font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 inline-block shadow-md">
                                                {slides[activeSlide].badge}
                                            </span>

                                            {/* Title */}
                                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                                                {slides[activeSlide].title}
                                            </h1>

                                            {/* Subtitle */}
                                            <p className="text-[13px] sm:text-base md:text-lg mb-8 sm:mb-12 text-gray-200 font-light leading-relaxed max-w-lg opacity-90">
                                                {slides[activeSlide].subtitle}
                                            </p>

                                            {/* CTA button */}
                                            <Link to={slides[activeSlide].link}>
                                                <button className="bg-white text-primary hover:bg-secondary hover:text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 border-none">
                                                    {slides[activeSlide].ctaText} →
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Slider Navigation Arrows - styled top right like Myura */}
                            <div className="absolute top-6 right-6 z-20 flex gap-2">
                                <button
                                    onClick={handlePrevSlide}
                                    className="w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 border-none"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextSlide}
                                    className="w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 border-none"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Dot Indicators - bottom centered */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-8 bg-secondary' : 'w-2 bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Slogan Intro Section - "Ayurveda. Simplified. Wellness That Works." format */}
                    <section className="py-16 md:py-24 text-center max-w-4xl mx-auto px-4">
                        <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                            {homepageCopy.introEyebrow || 'Authentic Formulations'}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-sans font-black text-primary leading-tight">
                            {homepageCopy.introTitle || <>Ayurveda. Simplified.<br /><span className="text-secondary">Wellness That Works.</span></>}
                        </h2>

                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mt-6 mb-8"></div>

                        <p className="text-gray-500 font-light text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                            {homepageCopy.introText || 'Thoughtfully made Ayurvedic solutions to energize, restore, and support your natural balance. Handcrafted in small batches with pristine sourcing, ensuring the ultimate standard of wellness you deserve.'}
                        </p>

                        <Link to="/shop">
                            <button className="bg-primary text-white hover:bg-secondary hover:text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 border-none">
                                Shop Collection →
                            </button>
                        </Link>
                    </section>

                    {spotlightProduct && (
                        <section className="container mx-auto px-4 py-8 md:py-14">
                            <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden bg-[#f1eee6]">
                                <Link to={`/product/${spotlightProduct._id}`} className="min-h-64 md:min-h-[430px] bg-white flex items-center justify-center p-8">
                                    <img src={getImageUrl(spotlightProduct.image, { width: 1000 })} alt={spotlightProduct.name} loading="lazy" decoding="async" className="max-h-[360px] w-full object-contain" />
                                </Link>
                                <div className="p-7 md:p-14 flex flex-col justify-center">
                                    <span className="text-xs tracking-[.25em] font-bold text-secondary">{homepageCopy.spotlightEyebrow || 'IN THE SPOTLIGHT'}</span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-primary mt-3">{homepageCopy.spotlightTitle || spotlightProduct.name}</h2>
                                    <p className="text-gray-600 leading-relaxed mt-4">{homepageCopy.spotlightText || spotlightProduct.description}</p>
                                    <p className="text-2xl font-bold text-primary mt-5">₹{spotlightProduct.price}</p>
                                    <Link to={`/product/${spotlightProduct._id}`} className="mt-6 inline-flex w-fit bg-primary text-white rounded-full px-6 py-3 font-bold">View product <ArrowRight size={17} className="ml-2" /></Link>
                                </div>
                            </div>
                        </section>
                    )}

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
                                    ) : categories.filter(cat => cat.name.toLowerCase() !== 'consultation').length > 0 ? categories.filter(cat => cat.name.toLowerCase() !== 'consultation').map((cat, idx) => {
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
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <h3 className="text-[11px] md:text-sm font-black text-gray-800 group-hover:text-primary transition-colors tracking-[0.15em] uppercase text-center w-full">{cat.name}</h3>
                                            </Link>
                                        );
                                    }) : <div className="w-full text-center py-8 text-gray-500">Our product categories are being updated. <Link to="/shop" className="text-primary font-bold underline">Browse the shop</Link></div>}
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
                                        {homepageCopy.bestsellerEyebrow || 'MOST LOVED'}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        {homepageCopy.bestsellerTitle || 'Bestsellers'}
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-2xl mx-auto">
                                        {homepageCopy.bestsellerText || 'Explore customer favourites, crafted with care and delivered across India.'}
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 mb-12">
                                    {bestsellers.length > 0 ? (
                                        bestsellers.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))
                                    ) : isLoadingProducts ? (
                                        [...Array(4)].map((_, i) => (
                                            <div key={i} className="h-110 bg-gray-50 border border-gray-100 rounded-[2rem] animate-pulse"></div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-10 text-gray-600">
                                            <p>Our bestsellers are being updated. Browse the full shop to see what is available.</p>
                                            <Link to="/shop" className="inline-flex mt-4 bg-primary text-white rounded-full px-6 py-3 font-bold">Browse the shop</Link>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <Link to="/shop">
                                        <button className="bg-primary text-white hover:bg-secondary hover:text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl border-none">
                                            {homepageCopy.bestsellerCta || 'View all products →'}
                                        </button>
                                    </Link>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    <section className="bg-[#f7f5ee] py-16 md:py-20">
                        <div className="container mx-auto px-4 max-w-6xl">
                            <p className="text-center text-xs text-secondary font-bold tracking-[.25em]">{homepageCopy.consultationEyebrow || 'CONSULTATION'}</p>
                            <h2 className="text-center text-3xl md:text-4xl text-primary font-bold mt-3">{homepageCopy.consultationTitle || 'Not sure where to begin? Ask us.'}</h2>
                            <p className="text-center text-gray-600 max-w-2xl mx-auto mt-4">{homepageCopy.consultationText || 'Tell us what you are looking for and we will help you choose.'}</p>
                            <div className="flex flex-wrap justify-center gap-3 mt-7"><Link to="/consult" className="bg-primary text-white px-7 py-3 rounded-full font-bold inline-flex items-center gap-2">{homepageCopy.consultationCta || 'Start a consultation'} <ArrowRight size={17} /></Link><Link to={homepageCopy.videoConsultationLink || '/book'} className="bg-white border border-primary text-primary px-7 py-3 rounded-full font-bold inline-flex items-center gap-2">{homepageCopy.videoConsultationCta || 'Book a video call'}</Link><a href={homepageCopy.whatsappLink || 'https://wa.me/919265401508?text=Hi%2C%20I%20need%20help%20choosing%20a%20product.'} target="_blank" rel="noreferrer" className="bg-white border border-primary text-primary px-7 py-3 rounded-full font-bold inline-flex items-center gap-2">{homepageCopy.whatsappCta || 'Ask on WhatsApp'}</a></div>
                        </div>
                    </section>

                    <section className="py-16 md:py-20 bg-white">
                        <div className="container mx-auto px-4 max-w-6xl">
                            <p className="text-center text-xs text-secondary font-bold tracking-[.25em]">{homepageCopy.whyEyebrow || 'WHY SHOP WITH US'}</p>
                            <h2 className="text-center text-3xl md:text-4xl text-primary font-bold mt-3 mb-10">{homepageCopy.whyTitle || 'Care, from the first question to your doorstep'}</h2>
                            <div className="grid md:grid-cols-3 gap-5">{(homepageCopy.whyItems?.length ? homepageCopy.whyItems : [
                                { title: 'Guidance before you buy', description: 'Ask a question or book a consultation. We help you choose.' },
                                { title: 'Secure payment', description: 'Pay online through the available secure payment options.' },
                                { title: 'Delivery across India', description: 'Track your order after it is dispatched.' }
                            ]).map((item, index) => <article key={`${item.title}-${index}`} className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f5]"><h3 className="font-bold text-primary text-lg">{item.title}</h3><p className="text-gray-600 mt-2">{item.description}</p></article>)}</div>
                        </div>
                    </section>

                    <section className="bg-primary text-white py-14 md:py-20">
                        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-10 items-center">
                            <div><p className="text-secondary text-xs font-bold tracking-[.25em]">{homepageCopy.impactEyebrow || 'OUR WAY'}</p><h2 className="text-3xl md:text-5xl font-bold mt-3">{homepageCopy.impactTitle || 'ONE ORDER, ONE MEAL'}</h2><p className="text-white/75 mt-5 leading-relaxed">{homepageCopy.impactText || 'Your order can bring a smile to someone’s face and hope to someone’s life.'}</p><Link to={homepageCopy.impactLink || '/about'} className="inline-flex mt-7 bg-white text-primary rounded-full px-6 py-3 font-bold">Read our story <ArrowRight size={17} className="ml-2" /></Link></div>
                            {homepageCopy.impactImage && <img src={getImageUrl(homepageCopy.impactImage, { width: 800 })} alt={homepageCopy.impactTitle || 'Our story'} loading="lazy" decoding="async" className="w-full aspect-[4/3] max-h-[360px] object-cover rounded-2xl" />}
                        </div>
                    </section>

                    <section className="container mx-auto px-4 py-16 md:py-20 max-w-6xl">
                        <p className="text-center text-xs text-secondary font-bold tracking-[.25em]">{homepageCopy.stepsEyebrow || 'SIMPLE FROM START TO FINISH'}</p>
                        <h2 className="text-center text-3xl md:text-4xl font-bold text-primary mt-3 mb-10">{homepageCopy.stepsTitle || 'How it works'}</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{(homepageCopy.steps?.length ? homepageCopy.steps : [
                            { title: 'Tell us your concern', description: 'Browse by concern, or message us and describe what you need.' },
                            { title: 'Get a suggestion', description: 'We point you to what suits you and answer your questions.' },
                            { title: 'Order in minutes', description: 'Pay securely online and get your order confirmation.' },
                            { title: 'We stay in touch', description: 'Track your order and reach us if you need help.' }
                        ]).map((step, index) => <article key={`${step.title}-${index}`} className="border-t-2 border-secondary pt-4"><p className="text-xs text-gray-400 font-bold">STEP {index + 1}</p><h3 className="font-bold text-primary text-lg mt-2">{step.title}</h3><p className="text-gray-600 text-sm mt-2">{step.description}</p></article>)}</div>
                    </section>

                    <section className="bg-white py-16 md:py-20">
                        <div className="container mx-auto px-4 max-w-4xl"><p className="text-center text-xs text-secondary font-bold tracking-[.25em]">{homepageCopy.faqEyebrow || 'GOOD TO KNOW'}</p><h2 className="text-center text-3xl md:text-4xl font-bold text-primary mt-3 mb-8">{homepageCopy.faqTitle || 'Your Wellness Questions'}</h2>
                            <div className="divide-y border-y">{(homepageCopy.faqs?.length ? homepageCopy.faqs : [
                                { question: 'What makes HRIDVED special?', answer: 'We bring Ayurvedic heritage together with carefully selected ingredients and clear guidance.' },
                                { question: 'How do I choose the right product?', answer: 'Browse by concern or contact us for help choosing.' },
                                { question: 'How do I track my order?', answer: 'Use the Track Order page with your order details.' }
                            ]).map((faq, index) => <div key={`${faq.question}-${index}`}><button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="w-full text-left py-4 font-bold text-primary flex justify-between gap-4">{faq.question}<span>{activeFaq === index ? '−' : '+'}</span></button>{activeFaq === index && <p className="pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>}</div>)}</div>
                        </div>
                    </section>

                    <section className="py-16 md:py-20 bg-[#f7f5ee]">
                        <div className="container mx-auto px-4 max-w-2xl text-center"><p className="text-xs text-secondary font-bold tracking-[.25em]">{homepageCopy.newsletterEyebrow || 'STAY CLOSE'}</p><h2 className="text-3xl md:text-4xl font-bold text-primary mt-3">{homepageCopy.newsletterTitle || 'Notes on living well, now and then'}</h2><p className="text-gray-600 mt-3">{homepageCopy.newsletterText || 'New launches, seasonal routines and the occasional offer.'}</p><form onSubmit={subscribeNewsletter} className="flex flex-col sm:flex-row gap-2 mt-6"><input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Email address" aria-label="Email address" className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3" /><button className="bg-primary text-white rounded-full px-7 py-3 font-bold">Subscribe</button></form>{newsletterStatus && <p role="status" className="mt-3 text-sm text-primary">{newsletterStatus}</p>}</div>
                    </section>

                    {/* Video reviews are shown only when real videos are configured in the admin panel. */}
                    {reelReviews.length > 0 && <section className="py-16 md:py-24 bg-white border-t border-gray-100">
                        <div className="container mx-auto px-4">
                            <ScrollReveal>
                                <div className="text-center mb-12 md:mb-16">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block">
                                        {homepageCopy.videoEyebrow || 'WATCH'}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-black text-primary mb-4">
                                        {homepageCopy.videoTitle || 'See it in use'}
                                    </h2>
                                    <p className="text-sm md:text-base text-gray-500 font-light max-w-xl mx-auto">
                                        {homepageCopy.videoText || 'Short videos, product guidance and stories from Hridved.'}
                                    </p>
                                    <div className="w-16 h-1 bg-secondary mx-auto rounded-full mt-5"></div>
                                </div>

                                {/* Reels slider/grid container */}
                                <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto justify-center">
                                    {reelReviews.map((reel, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                const videoUrl = reel.link || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
                                                setActiveVideoUrl(videoUrl);
                                            }}
                                            className="w-full md:w-80 group relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                        >
                                            {/* Reel Video Thumbnail */}
                                            <div className="h-96 relative overflow-hidden bg-gray-100">
                                                <img
                                                    src={getImageUrl(reel.image)}
                                                    alt={reel.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                                                {(reel.isNew || reel.description?.toLowerCase() === 'new') && (
                                                    <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>

                                            {/* Label below thumbnail */}
                                            <div className="bg-gray-50 border-t border-gray-100 py-4 text-center">
                                                <h4 className="text-xs font-black text-gray-700 tracking-wider uppercase">
                                                    {reel.title}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center mt-12">
                                    <Link to={homepageCopy.videoLink || '/shop'} className="inline-flex bg-gray-100 text-primary hover:bg-secondary px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm">
                                        {homepageCopy.videoCta || 'Explore products →'}
                                    </Link>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>

                    }

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

                    {/* Dynamic Video Review Modal */}
                    {activeVideoUrl && (
                        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-fade-in animate-duration-200">
                            <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                                {/* Close Button */}
                                <button
                                    onClick={() => setActiveVideoUrl(null)}
                                    className="absolute top-4 right-4 z-[10000] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all active:scale-95 border-none shadow-lg cursor-pointer"
                                >
                                    <X size={20} />
                                </button>

                                {/* Video Player */}
                                <div className="aspect-video w-full flex items-center justify-center bg-black">
                                    {isYouTubeUrl(activeVideoUrl) ? (
                                        <iframe
                                            className="w-full h-full border-none"
                                            src={getYouTubeEmbedUrl(activeVideoUrl)}
                                            title="Video Player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <video
                                            className="w-full h-full object-contain"
                                            src={getImageUrl(activeVideoUrl)}
                                            controls
                                            autoPlay
                                        ></video>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </AnimatedPage>
        </>
    );
};

export default HomePage;
