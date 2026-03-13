
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Leaf, Users, Award, Heart, History, CheckCircle, Droplets, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedImage from '../components/AnimatedImage';
import AnimatedButton from '../components/AnimatedButton';
import SEO from '../components/SEO';
import Loader from '../components/Loader';

const HomePage = () => {
    const [content, setContent] = useState(null);
    const [bestsellers, setBestsellers] = useState([]);
    const [tips, setTips] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isHeroLoaded, setIsHeroLoaded] = useState(false);

    useEffect(() => {
        // Hide loader only when both API and Hero Image are ready
        if (!isLoadingCategories && isHeroLoaded) {
            // Add a small delay for smooth transition
            const timer = setTimeout(() => setIsPageLoading(false), 500);
            return () => clearTimeout(timer);
        }
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
                setTips(tipsRes.data || []);
                setCategories(categoriesRes.data || []);
                setIsLoadingCategories(false);
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        fetchData();
    }, []);

    const BestsellerCarousel = ({ products }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [direction, setDirection] = useState(0);

        const nextSlide = () => {
            setDirection(1);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(1, products.length));
        };

        const prevSlide = () => {
            setDirection(-1);
            setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % Math.max(1, products.length));
        };

        const visibleProducts = products.length > 0 ? (products.length > 4 ? products.slice(currentIndex, currentIndex + 4).concat(products.slice(0, Math.max(0, 4 - (products.length - currentIndex)))) : products) : [
            { _id: '1', name: 'Premium Hair Oil', image: 'https://images.unsplash.com/photo-1626444341257-58a13e41ae2a?w=800&q=80', price: 499, category: 'Hair Care', rating: 5 },
            { _id: '2', name: 'Herbal Skin Cream', image: 'https://images.unsplash.com/photo-1556229162-5c63ed9c4ffb?w=800&q=80', price: 599, category: 'Skin Care', rating: 4 },
            { _id: '3', name: 'Immunity Booster Churn', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?w=800&q=80', price: 349, category: 'Immunity', rating: 5 },
            { _id: '4', name: 'Natural Sandalwood Oil', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', price: 899, category: 'Oils', rating: 4 },
        ];

        if (!visibleProducts || visibleProducts.length === 0) return <p className="text-center text-gray-500">No bestselling products found.</p>;

        return (
            <div className="relative group/carousel">
                <div className="overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                        {visibleProducts.map((product) => (
                            <div key={product._id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 group/card h-full flex flex-col relative">
                                {product.mrp > product.price && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <span className="bg-green-600 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                        </span>
                                    </div>
                                )}
                                <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                                    <Link to={`/product/${product._id}`}>
                                        <AnimatedImage src={product.image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                                    </Link>
                                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors duration-300"></div>
                                    <Link to={`/product/${product._id}`}>
                                        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-primary transform translate-y-12 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white z-10">
                                            <ArrowRight size={20} />
                                        </button>
                                    </Link>
                                    {product.countInStock === 0 && (
                                        <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-sm z-10 shadow-sm">Out of Stock</div>
                                    )}
                                </div>
                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div>
                                        <Link to={`/product/${product._id}`}>
                                            <h3 className="font-sans font-bold text-lg text-gray-900 mb-1 group-hover/card:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                        </Link>
                                        <p className="text-sm text-gray-400 mb-4 font-medium">{product.category}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-gray-50">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-primary text-xl tracking-tight">₹{product.price}</span>
                                            {product.mrp > product.price && (
                                                <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                                            )}
                                        </div>
                                        {product.mrp > product.price && (
                                            <span className="text-[10px] text-green-600 font-bold">Save ₹{product.mrp - product.price}</span>
                                        )}
                                        <div className="flex gap-0.5 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-200"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {products.length > 4 && (
                    <>
                        <button onClick={prevSlide} className="absolute top-1/2 -left-4 xl:-left-8 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-xl text-primary z-20 hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100">
                            <ArrowRight size={24} className="rotate-180" />
                        </button>
                        <button onClick={nextSlide} className="absolute top-1/2 -right-4 xl:-right-8 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-xl text-primary z-20 hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100">
                            <ArrowRight size={24} />
                        </button>
                    </>
                )}
            </div>
        );
    };

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
                {/* Hero Section - Optimized for mobile aspect ratio */}
                <section className="relative min-h-[350px] xs:min-h-[450px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[85vh] flex items-center overflow-hidden bg-primary py-12 sm:py-20">
                    <div className="absolute inset-0 w-full h-full bg-primary">
                        <AnimatedImage
                            src={content?.hero?.image || "/hero-bg.png"}
                            alt="Ayurveda Wellness"
                            containerClassName="w-full h-full !rounded-none"
                            className="w-full h-full object-cover object-[center_25%] sm:object-center shadow-inner"
                            zoomIntensity={1.05}
                            loading="eager"
                            fetchPriority="high"
                            onLoad={() => setIsHeroLoaded(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="container mx-auto relative z-10 py-12 sm:py-0">
                        <ScrollReveal>
                            <div className="max-w-2xl text-white">
                                <motion.span 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="bg-secondary/90 backdrop-blur-md text-primary font-bold px-4 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] mb-4 md:mb-6 inline-block shadow-lg"
                                >
                                    Authentic Wellness
                                </motion.span>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7.5xl font-sans font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-2xl"
                                >
                                    {content?.hero?.title || <>Ancient Wisdom.<br className="hidden sm:block" /> Masterfully Pure.</>}
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="text-[14px] sm:text-lg md:text-xl mb-8 md:mb-12 text-gray-100 font-light max-w-lg leading-relaxed opacity-90"
                                >
                                    {content?.hero?.subtitle || "Experience the pinnacle of Ayurvedic excellence. Pure formulations handcrafted for your modern lifestyle."}
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="flex flex-wrap gap-5"
                                >
                                    <Link to="/shop">
                                        <AnimatedButton className="bg-secondary text-primary px-10 md:px-12 py-3.5 md:py-5 rounded-full text-sm md:text-lg font-black hover:bg-white transition-all duration-500 border-none shadow-2xl hover:scale-105 active:scale-95">
                                            {content?.hero?.ctaText || "Shop Collection"}
                                        </AnimatedButton>
                                    </Link>
                                    <Link to="/consultation">
                                        <AnimatedButton variant="outline" className="bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white px-10 md:px-12 py-3.5 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-white hover:text-primary transition-all duration-500 shadow-xl">
                                            Consult Doctor
                                        </AnimatedButton>
                                    </Link>
                                </motion.div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
                        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                            <div className="scroll-indicator w-1 h-2 bg-white rounded-full"></div>
                        </div>
                    </div>
                </section>

                {/* Brand Trust Bar - Refined Marquee */}
                <div className="bg-white border-b border-gray-50 overflow-hidden py-6 md:py-8 shadow-sm">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 opacity-60">
                            {(content?.trustBar?.items?.length > 0 ? content.trustBar.items : [
                                { title: '100% Organically Sourced', icon: 'Leaf' },
                                { title: 'GMP & Ayush Certified', icon: 'Award' },
                                { title: 'Pure Himalayan Ingredients', icon: 'ShieldCheck' },
                                { title: 'Eco-Friendly Shipping', icon: 'Truck' }
                            ]).map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group hover:opacity-100 transition-opacity">
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
                    {/* Floating Background Element */}
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
                                    // Circular Skeletons
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
                                    { name: 'Consultation', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80' },
                                ]).map((cat, idx) => {
                                    const link = cat.name.toLowerCase() === 'consultation' ? '/consultation' : `/shop?category=${encodeURIComponent(cat.name)}`;
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

                {/* Offer Banner */}
                <section className="bg-primary py-4 border-y border-white/10">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="bg-secondary p-2 rounded-full text-primary">
                                    <Truck size={20} />
                                </div>
                                <p className="text-white font-bold tracking-wider text-sm md:text-base">
                                    CELEBRATION OFFER: <span className="text-secondary">FREE SHIPPING</span> ON ALL ORDERS ABOVE ₹999
                                </p>
                            </motion.div>
                            <Link to="/shop">
                                <button className="bg-white text-primary px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-colors">
                                    Shop Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Best Sellers Section */}
                <section className="py-12 md:py-20 bg-background/50">
                    <div className="container mx-auto">
                        <ScrollReveal>
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 md:mb-10 gap-4">
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl md:text-4xl font-sans font-bold text-primary">Our Bestsellers</h2>
                                    <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Customer favorites that deliver results.</p>
                                </div>
                                <Link to="/shop" className="text-primary font-bold text-xs tracking-wider uppercase hover:text-secondary hover:underline underline-offset-4">
                                    View All Products
                                </Link>
                            </div>

                            <BestsellerCarousel products={bestsellers} />
                        </ScrollReveal>
                    </div>
                </section>

                {/* The Essence of Purity Section [New] */}
                <section className="py-24 md:py-32 bg-background relative overflow-hidden">
                    <div className="absolute bottom-[-10%] left-[-5%] opacity-5 float-slow pointer-events-none" style={{ animationDelay: '2s' }}>
                        <Droplets size={350} strokeWidth={0.5} />
                    </div>

                    <div className="container mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="lg:w-1/2">
                                <ScrollReveal direction="left">
                                    <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                                        {content?.purity?.title || "The Process of Perfection"}
                                    </span>
                                    <h2 className="text-4xl md:text-6xl font-sans font-black text-primary mb-8 leading-tight">
                                        {content?.purity?.subtitle ? (
                                            <>Handcrafted with <br/><span className="italic font-serif font-light text-secondary">{content.purity.subtitle}</span></>
                                        ) : (
                                            <>Handcrafted with <br/><span className="italic font-serif font-light text-secondary">Ancient Wisdom</span></>
                                        )}
                                    </h2>
                                    
                                    <div className="space-y-10">
                                        {(content?.purity?.items?.length > 0 ? content.purity.items : [
                                            { icon: 'CheckCircle', title: "Precision Batch Sourcing", description: "We hand-select ingredients from peak Himalayan altitudes for maximum nutrient density." },
                                            { icon: 'Droplets', title: "Authentic Kashaya Preparation", description: "Herbs are slow-cooked for 72 hours across traditional copper vessels to preserve essence." },
                                            { icon: 'Sparkles', title: "Modern Purity standards", description: "Every gram is tested against 140+ safety parameters in our GMP-certified labs." }
                                        ]).map((item, i) => (
                                            <div key={i} className="flex gap-6 group">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-12 text-secondary group-hover:text-white">
                                                    {getIcon(item.icon, 24)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-primary mb-2 tracking-tight">{item.title}</h4>
                                                    <p className="text-gray-500 leading-relaxed text-sm md:text-base">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12">
                                        <Link to="/about">
                                            <AnimatedButton className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all border-none flex items-center gap-3">
                                                Our Full Story <ArrowRight size={18} />
                                            </AnimatedButton>
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            </div>
                            
                            <div className="lg:w-1/2 relative">
                                <ScrollReveal direction="right">
                                    <div className="relative z-10 grid grid-cols-2 gap-4">
                                        <div className="space-y-4 pt-12">
                                            <AnimatedImage 
                                                src="https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=600&auto=format" 
                                                className="rounded-[2rem] shadow-2xl h-80 object-cover w-full" 
                                            />
                                            <div className="bg-secondary p-8 rounded-[2rem] text-primary shadow-xl">
                                                <p className="text-3xl font-black mb-1">100%</p>
                                                <p className="text-xs uppercase font-bold tracking-widest opacity-80">Natural Purity</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl">
                                                <p className="text-3xl font-black mb-1">500+</p>
                                                <p className="text-xs uppercase font-bold tracking-widest opacity-80">Classical Cures</p>
                                            </div>
                                            <AnimatedImage 
                                                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format" 
                                                className="rounded-[2rem] shadow-2xl h-96 object-cover w-full" 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Decorative badge */}
                                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 border-8 border-background z-20 hidden md:flex animate-pulse">
                                        <div className="text-center">
                                            <CheckCircle className="text-primary mx-auto mb-1" size={32} />
                                            <p className="text-[10px] font-black uppercase text-primary tracking-tighter">Ayush Certified</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ayurvedic Wisdom (Blog) Section */}
                <section className="py-12 md:py-24 bg-white">
                    <div className="container mx-auto whitespace-normal">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-4">
                                <div className="text-center md:text-left">
                                    <span className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2 md:mb-3 block">Knowledge Base</span>
                                    <h2 className="text-3xl md:text-5xl font-sans font-bold text-primary mb-1 md:mb-2">Ayurvedic Wisdom</h2>
                                    <p className="text-sm md:text-base text-gray-500">Expert insights for a harmonious lifestyle.</p>
                                </div>
                                <Link to="/blogs" className="text-primary font-bold hover:text-secondary group flex items-center bg-primary/5 px-6 py-3 rounded-full transition-all hover:bg-primary/10 text-sm md:text-base">
                                    Read All Articles <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                                {tips.length > 0 ? (
                                    tips.slice(0, 3).map((tip) => (
                                        <Link to="/blogs" key={tip._id} className="group cursor-pointer block">
                                            <article>
                                                <div className="rounded-3xl md:rounded-[2rem] overflow-hidden mb-6 h-48 md:h-64 relative shadow-md group-hover:shadow-2xl transition-all duration-500">
                                                    <AnimatedImage src={tip.image} alt={tip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary z-10 shadow-sm">
                                                        {tip.category}
                                                    </div>
                                                </div>
                                                <div className="px-1 md:px-2">
                                                    <h3 className="text-xl md:text-2xl font-sans font-bold text-primary mb-2 md:mb-3 group-hover:text-secondary transition-colors leading-tight">
                                                        {tip.title}
                                                    </h3>
                                                    <p className="text-xs md:text-base text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                        {tip.description}
                                                    </p>
                                                    <div className="flex items-center text-primary font-bold text-xs md:text-sm group/link">
                                                        <span className="border-b-2 border-secondary/30 group-hover/link:border-secondary transition-colors pb-0.5">Explore Insight</span>
                                                        <ArrowRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-20 bg-background rounded-3xl border-2 border-dashed border-gray-100 italic text-gray-400">
                                        Wisdom is gathering. Check back soon.
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Feature Split Section: Tradition Meets Science */}
                <section className="py-24 md:py-36 bg-white overflow-hidden relative">
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10 translate-y-[-50%]"></div>
                    
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
                            <div className="md:w-1/2 relative lg:pr-12">
                                <ScrollReveal direction="left">
                                    <div className="relative">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
                                        <div className="rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-white">
                                            {content?.tradition?.image ? (
                                                <AnimatedImage
                                                    src={content.tradition.image}
                                                    alt="Tradition meets Science"
                                                    className="w-full h-[600px] object-cover"
                                                />
                                            ) : (
                                                <AnimatedImage
                                                    src="https://images.unsplash.com/photo-1617462432650-6a9b407ec1ea?q=80&w=1000&auto=format&fit=crop"
                                                    alt="Tradition meets Science"
                                                    className="w-full h-[600px] object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-10 -right-6 md:-right-12 glass-morphism p-8 md:p-10 rounded-[2rem] luxury-shadow max-w-xs border border-white/50 z-20">
                                            <Sparkles className="text-secondary mb-4" size={32} />
                                            <p className="font-serif text-primary text-xl italic leading-relaxed">&quot;The perfect balance of ancient wisdom and modern standards.&quot;</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="md:w-1/2 mt-20 md:mt-0">
                                <ScrollReveal direction="right">
                                    <span className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-6 block">Our Eternal Philosophy</span>
                                    <h2 className="text-4xl md:text-6xl font-sans font-black text-primary mb-8 leading-tight">
                                        {content?.tradition?.title || <>Where Tradition<br /><span className="text-secondary italic font-serif font-light">meets Modern</span> Science</>}
                                    </h2>
                                    <div className="space-y-6 text-gray-600 mb-10 leading-relaxed text-lg">
                                        {content?.tradition?.subtitle?.split('\n\n').map((p, i) => (
                                            <p key={i} className="opacity-80 font-light">{p}</p>
                                        )) || (
                                            <>
                                                <p className="opacity-80 font-light">Founded in 2020, HRIDVED has been at the forefront of the Ayurvedic revolution. We bridge the gap between ancient sacred texts and the precision of modern clinical research.</p>
                                                <p className="opacity-80 font-light">Today, we produce over 500+ classical and proprietary medicines in our state-of-the-art labs, ensuring every drop is a testament to authenticity.</p>
                                            </>
                                        )}
                                    </div>
                                    <Link to="/about">
                                        <AnimatedButton variant="outline" className="group border-2 border-primary text-primary px-10 py-4 rounded-full font-bold hover:bg-primary hover:text-white transition-all duration-500 flex items-center gap-3 border-none ring-1 ring-primary/20">
                                            The Hridved Story <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </AnimatedButton>
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section - Luxury Magazine Style */}
                {content?.testimonials?.items?.length > 0 && (
                    <section className="py-24 md:py-36 bg-primary text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-white opacity-[0.02] pointer-events-none"></div>
                        
                        <div className="container mx-auto relative z-10">
                            <ScrollReveal>
                                <div className="text-center mb-16 md:mb-24">
                                    <span className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Shared Journeys</span>
                                    <h2 className="text-4xl md:text-6xl font-serif font-light italic mb-2">Voices of Wellness</h2>
                                    <div className="w-16 h-0.5 bg-secondary/50 mx-auto mt-6"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                                    {content.testimonials.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col group">
                                            <div className="mb-8">
                                                <div className="flex gap-1 mb-6">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className="text-secondary fill-secondary" />
                                                    ))}
                                                </div>
                                                <p className="text-xl md:text-2xl font-serif italic font-light leading-relaxed mb-8 opacity-90 group-hover:opacity-100 transition-opacity">
                                                    &ldquo;{item.description}&rdquo;
                                                </p>
                                            </div>
                                            <div className="mt-auto flex items-center gap-5 pt-8 border-t border-white/10">
                                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-secondary font-black text-xl border border-white/10 group-hover:bg-secondary group-hover:text-primary transition-all duration-500">
                                                    {item.title?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg tracking-tight">{item.title}</h4>
                                                    <p className="text-xs text-secondary font-black uppercase tracking-[0.2em]">{item.link || 'Verified Purist'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                )}

                {/* Why Choose Us - Enhanced Cards */}
                <section className="py-24 md:py-32 bg-background relative overflow-hidden px-5">
                    <div className="absolute top-[20%] left-[-10%] opacity-5 float-slow pointer-events-none">
                        <History size={400} strokeWidth={0.5} />
                    </div>

                    <div className="container mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-20 md:mb-24">
                                <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block">
                                    {content?.promise?.subtitle || "The Hridved Promise"}
                                </span>
                                <h2 className="text-3xl md:text-6xl font-sans font-black text-primary mb-8 tracking-tighter">
                                    {content?.promise?.title || <>The Gold Standard <br className="hidden md:block" /> of Modern Ayurveda</>}
                                </h2>
                                <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                {(content?.promise?.items?.length > 0 ? content.promise.items : [
                                    { title: '100% Organically Sourced', description: 'Hand-harvested at peak potency from protected Himalayan altitudes.', icon: 'Leaf' },
                                    { title: 'GMP & Ayush Certified', description: 'Pharma-grade precision in every drop, surpassing global safety standards.', icon: 'ShieldCheck' },
                                    { title: 'Conscious Packaging', description: 'Committed to the Earth with zero-plastic, biodegradable glass containers.', icon: 'Truck' }
                                ]).map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-gray-100 hover:luxury-shadow hover:-translate-y-3 transition-all duration-700 group relative overflow-hidden flex flex-col h-full">
                                        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                                            {getIcon(item.icon)}
                                        </div>
                                        <h3 className="text-2xl font-black text-primary mb-4 tracking-tight leading-tight">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed font-light opacity-80 mb-0">{item.description}</p>
                                        
                                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>


            </div>
        </AnimatedPage>
        </>
    );
};

export default HomePage;
