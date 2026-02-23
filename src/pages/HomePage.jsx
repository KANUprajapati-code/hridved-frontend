
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Leaf } from 'lucide-react';
import api from '../utils/api';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedImage from '../components/AnimatedImage';
import AnimatedButton from '../components/AnimatedButton';

const HomePage = () => {
    const [content, setContent] = useState(null);
    const [bestsellers, setBestsellers] = useState([]);
    const [tips, setTips] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contentResponse = await api.get('/content');
                setContent(contentResponse.data);

                const productsResponse = await api.get('/products?isBestseller=true');
                setBestsellers(productsResponse.data.products || []);

                const tipsResponse = await api.get('/tips');
                setTips(tipsResponse.data || []);
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {visibleProducts.map((product) => (
                            <div key={product._id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 group/card h-full flex flex-col">
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
                                            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1 group-hover/card:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                        </Link>
                                        <p className="text-sm text-gray-400 mb-4 font-medium">{product.category}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <span className="font-bold text-primary text-xl tracking-tight">₹{product.price}</span>
                                        <div className="flex gap-0.5">
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


    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative bg-primary overflow-hidden">
                    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-20 lg:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Hero Text */}
                            <div className="lg:col-span-7 z-10">
                                <ScrollReveal>
                                    <div className="text-white">
                                        <span className="bg-secondary text-primary font-bold px-4 py-1 rounded-full text-xs md:text-sm uppercase tracking-widest mb-6 inline-block shadow-sm">
                                            Natural Care
                                        </span>
                                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-bold mb-6 md:mb-8 leading-[1.1]">
                                            {content?.hero?.title || <>Ancient Ayurveda.<br />Modern Wellness.</>}
                                        </h1>
                                        <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 text-gray-200 font-light max-w-xl leading-relaxed">
                                            {content?.hero?.subtitle || "Pure formulations for your modern lifestyle. Handcrafted with wisdom from ancient texts, delivered with modern purity standards."}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <Link to="/shop">
                                                <AnimatedButton className="bg-secondary text-primary px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white transition-all duration-300 border-none shadow-xl hover:shadow-secondary/20">
                                                    {content?.hero?.ctaText || "Shop Now"}
                                                </AnimatedButton>
                                            </Link>
                                            <Link to="/consultation">
                                                <AnimatedButton variant="outline" className="bg-transparent border-2 border-white/30 text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white hover:text-primary hover:border-white transition-all duration-300">
                                                    Consult
                                                </AnimatedButton>
                                            </Link>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Hero Image */}
                            <div className="lg:col-span-5 relative lg:h-[600px] flex items-center justify-center">
                                <ScrollReveal direction="right" delay={0.2}>
                                    <div className="relative z-10 w-full max-w-lg lg:max-w-none">
                                        {/* Decorative background circle */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full -z-10 blur-3xl"></div>

                                        <AnimatedImage
                                            src={content?.hero?.image || "/hero-bg.png"}
                                            alt="Ayurveda Wellness"
                                            containerClassName="w-full h-full aspect-[4/5] rounded-[2rem] shadow-2xl border-4 border-white/10"
                                            className="w-full h-full object-cover"
                                            zoomIntensity={1.05}
                                            loading="eager"
                                        />

                                        {/* Floaters for premium feel */}
                                        <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl hidden md:block">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                                                    <Leaf size={20} />
                                                </div>
                                                <div className="text-white pr-2 text-sm font-bold">100% Organic</div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>

                    {/* Background abstract element */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
                </section>

                {/* Shop by Category Section - Circular Icons */}
                <section className="py-12 md:py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-16">
                                <h2 className="text-2xl md:text-4xl font-display font-bold text-primary mb-2 md:mb-3">Shop by Category</h2>
                                <p className="text-sm md:text-base text-gray-500">Explore our curated collections for your specific needs.</p>
                            </div>

                            <div className="flex overflow-x-auto pb-6 gap-6 md:gap-12 no-scrollbar justify-start md:justify-center scroll-smooth">
                                {[
                                    { name: 'Hair Care', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Skin Care', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Digestion', img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Immunity', img: 'https://images.unsplash.com/photo-1546868214-e95b36449173?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Wellness', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Oils', img: 'https://images.unsplash.com/photo-1601058268499-e52642a18350?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Raw Herbs', img: 'https://images.unsplash.com/photo-1544070078-a212eda27b49?w=800&auto=format&fit=crop&q=80' },
                                    { name: 'Kombucha', img: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&auto=format&fit=crop&q=80' },
                                ].map((cat, idx) => (
                                    <Link to={`/shop?category=${cat.name}`} key={idx} className="flex flex-col items-center group flex-shrink-0">
                                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 md:border-4 border-transparent group-hover:border-secondary transition-all duration-300 mb-3 md:mb-4 shadow-md md:shadow-lg">
                                            <AnimatedImage src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="text-xs md:text-base font-bold text-gray-800 group-hover:text-primary transition-colors whitespace-nowrap">{cat.name}</h3>
                                    </Link>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Best Sellers Section */}
                <section className="py-12 md:py-20 bg-background/50">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 md:mb-10 gap-4">
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl md:text-4xl font-display font-bold text-primary">Our Bestsellers</h2>
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

                {/* Feature Split Section: Tradition Meets Science */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            <div className="md:w-1/2 relative">
                                <ScrollReveal direction="left">
                                    <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-primary/10 rounded-full -z-10 translate-x-10 -translate-y-10"></div>
                                    {content?.tradition?.image ? (
                                        <AnimatedImage
                                            src={content.tradition.image}
                                            alt="Tradition meets Science"
                                            className="rounded-2xl shadow-2xl w-full"
                                            containerClassName="rounded-2xl shadow-2xl w-full"
                                        />
                                    ) : (
                                        <AnimatedImage
                                            src="https://images.unsplash.com/photo-1617462432650-6a9b407ec1ea?q=80&w=1000&auto=format&fit=crop"
                                            alt="Tradition meets Science"
                                            className="rounded-2xl shadow-2xl w-full"
                                            containerClassName="rounded-2xl shadow-2xl w-full"
                                        />
                                    )}
                                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-gray-100 z-10">
                                        <p className="font-serif text-primary text-lg italic">&quot;The perfect balance of ancient wisdom and modern standards.&quot;</p>
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="md:w-1/2">
                                <ScrollReveal direction="right">
                                    <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Our Philosophy</span>
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
                                        {content?.tradition?.title || <>Where Tradition<br />Meets Science</>}
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                                        {content?.tradition?.subtitle ||
                                            `Founded in 1921, HRIDVED has been at the forefront of the Ayurvedic revolution for over a century. We combine the deep spiritual knowledge of ancient texts with cutting-edge manufacturing technology.
                                        
                                        Today, we produce over 500+ classical and proprietary medicines in our GMP-certified facilities, ensuring that every product you receive is safe, effective, and authentic.`}
                                    </p>
                                    <Link to="/about" className="inline-flex items-center text-primary font-bold border-b-2 border-secondary pb-1 hover:text-secondary transition-colors">
                                        Learn More About Us <ArrowRight size={18} className="ml-2" />
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                {content?.testimonials?.items?.length > 0 && (
                    <section className="py-20 bg-primary/5">
                        <div className="container mx-auto px-4">
                            <ScrollReveal>
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">What Our Customers Say</h2>
                                    <p className="text-gray-500">Real stories from our community.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {content.testimonials.items.map((item, idx) => (
                                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-lg transition-shadow duration-300">
                                            <div className="text-secondary text-5xl font-serif absolute top-4 left-6 opacity-30">&quot;</div>
                                            <p className="text-gray-600 mb-6 italic relative z-10 pt-4">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {item.title?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary">{item.title}</h4>
                                                    <p className="text-xs text-gray-500">{item.link}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                )}

                {/* Why Choose Us */}
                <section className="py-24 bg-background px-4 md:px-0">
                    <div className="container mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Hridved Way</span>
                                <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">Why Hundreds of Thousands<br className="hidden md:block" /> Trust HRIDVED</h2>
                                <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                                <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150"></div>
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                                        <Leaf size={32} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">100% Organically Sourced</h3>
                                    <p className="text-xs md:text-base text-gray-500 leading-relaxed">We utilize only the purest ingredients harvested directly from the Himalayan foothills.</p>
                                </div>
                                <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150"></div>
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">GMP & Ayush Certified</h3>
                                    <p className="text-xs md:text-base text-gray-500 leading-relaxed">Our manufacturing excellence meets global pharma-grade standards, ensuring absolute potency.</p>
                                </div>
                                <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150"></div>
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0">
                                        <Truck size={32} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">Eco-Friendly Shipping</h3>
                                    <p className="text-xs md:text-base text-gray-500 leading-relaxed">Dedicated to the Earth, we use biodegradable glass and zero-plastic packaging.</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Ayurvedic Wisdom (Blog) Section */}
                <section className="py-12 md:py-24 bg-white">
                    <div className="container mx-auto px-4 md:px-0">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-4">
                                <div className="text-center md:text-left">
                                    <span className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2 md:mb-3 block">Knowledge Base</span>
                                    <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-1 md:mb-2">Ayurvedic Wisdom</h2>
                                    <p className="text-sm md:text-base text-gray-500">Expert insights for a harmonious lifestyle.</p>
                                </div>
                                <Link to="/blogs" className="text-primary font-bold hover:text-secondary group flex items-center bg-primary/5 px-6 py-3 rounded-full transition-all hover:bg-primary/10 text-sm md:text-base">
                                    Read All Articles <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                                {tips.length > 0 ? (
                                    tips.slice(0, 3).map((tip) => (
                                        <article key={tip._id} className="group cursor-pointer">
                                            <div className="rounded-3xl md:rounded-[2rem] overflow-hidden mb-6 h-48 md:h-64 relative shadow-md group-hover:shadow-2xl transition-all duration-500">
                                                <AnimatedImage src={tip.image} alt={tip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary z-10 shadow-sm">
                                                    {tip.category}
                                                </div>
                                            </div>
                                            <div className="px-1 md:px-2">
                                                <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-2 md:mb-3 group-hover:text-secondary transition-colors leading-tight">
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
                {/* Newsletter Section */}
                <section className="py-20 bg-primary text-white">
                    <div className="container mx-auto px-4 text-center">
                        <ScrollReveal>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Join the Ayurveda Journey</h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Subscribe to our newsletter for holistic wellness tips, exclusive offers, and early access to new Ayurvedic formulations.
                            </p>
                            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="flex-grow px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                                    required
                                />
                                <AnimatedButton
                                    type="submit"
                                    className="bg-secondary text-primary px-8 py-3 rounded-full font-bold hover:bg-white transition-colors duration-300 border-none"
                                >
                                    Subscribe
                                </AnimatedButton>
                            </form>
                        </ScrollReveal>
                    </div>
                </section>
            </div>
        </AnimatedPage>
    );
};

export default HomePage;
