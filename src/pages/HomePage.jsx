
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
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

        const nextSlide = () => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        };

        const prevSlide = () => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
        };

        // Improved visible products logic for responsiveness
        const getVisibleCount = () => {
            if (typeof window === 'undefined') return 4;
            if (window.innerWidth < 640) return 1;
            if (window.innerWidth < 1024) return 2;
            return 4;
        };

        const [visibleCount, setVisibleCount] = useState(getVisibleCount());

        useEffect(() => {
            const handleResize = () => setVisibleCount(getVisibleCount());
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        const visibleProducts = products.slice(currentIndex, currentIndex + visibleCount).concat(
            products.slice(0, Math.max(0, visibleCount - (products.length - currentIndex)))
        );

        if (!products || products.length === 0) return <p className="text-center text-gray-400 py-10">No products found.</p>;

        return (
            <div className="relative group">
                <div className={`grid gap-6 ${visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-4'
                    }`}>
                    {visibleProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            layout
                            className="card-premium group/card bg-white"
                        >
                            <div className="h-72 bg-gray-50 relative overflow-hidden">
                                <Link to={`/product/${product._id}`} className="block h-full">
                                    <AnimatedImage
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                    />
                                </Link>
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                    <Link to={`/product/${product._id}`}>
                                        <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl text-primary hover:bg-primary hover:text-white transition-all transform hover:rotate-12">
                                            <ArrowRight size={20} />
                                        </button>
                                    </Link>
                                </div>
                                {product.countInStock === 0 && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <Link to={`/product/${product._id}`}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover/card:text-primary transition-colors">{product.name}</h3>
                                </Link>
                                <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-4">
                                    <span className="font-black text-primary text-xl font-display">₹{product.price}</span>
                                    <div className="flex text-secondary gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-secondary" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {products.length > visibleCount && (
                    <div className="flex justify-center gap-4 mt-10">
                        <button
                            onClick={prevSlide}
                            className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100"
                        >
                            <ArrowRight size={22} className="rotate-180" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100"
                        >
                            <ArrowRight size={22} />
                        </button>
                    </div>
                )}
            </div>
        );
    };


    return (
        <AnimatedPage>
            <div className="min-h-screen bg-[#FDFBF7]">
                {/* Hero Section */}
                <section className="relative h-[85vh] md:h-[90vh] overflow-hidden flex items-center">
                    <div className="absolute inset-0 z-0">
                        <AnimatedImage
                            src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop"
                            alt="Ayurveda Wellness"
                            className="w-full h-full object-cover"
                            zoomIntensity={1.1}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <ScrollReveal>
                            <div className="max-w-3xl">
                                <motion.span
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-secondary text-primary font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] mb-6 inline-block shadow-lg"
                                >
                                    ESTABLISHED 1921
                                </motion.span>
                                <h1 className="text-white mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-[80px] leading-[1.05] font-semibold tracking-tight">
                                    {content?.hero?.title || <>Ancient Wisdom<br />For Your<br /><span className="text-white opacity-80">Modern Soul</span></>}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-10 text-gray-200 font-medium max-w-xl leading-relaxed">
                                    {content?.hero?.subtitle || "Authentic Ayurvedic formulations crafted with care, bringing the purity of nature to your daily wellness ritual."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Link to="/shop">
                                        <button className="btn-secondary w-full sm:w-auto px-10">
                                            {content?.hero?.ctaText || "Explore Collection"}
                                        </button>
                                    </Link>
                                    <Link to="/consultation">
                                        <button className="btn-premium border-2 border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-primary w-full sm:w-auto px-10">
                                            Consult A Doctor
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FDFBF7] to-transparent z-10" />
                </section>

                {/* Categories - Premium Circular Icons */}
                <section className="section-padding bg-white relative z-20 -mt-6 sm:-mt-10 rounded-t-[2.5rem] sm:rounded-t-[3rem] md:rounded-t-[5rem]">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-16 max-w-2xl mx-auto">
                                <h2 className="text-primary mb-4">Shop By Category</h2>
                                <p className="text-gray-500 font-medium italic">Discover wellness tailored for your specific needs.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10">
                                {[
                                    { name: 'Hair Care', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Skin Care', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Digestion', img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Immunity', img: 'https://images.unsplash.com/photo-1546868214-e95b36449173?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Wellness', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Oils', img: 'https://images.unsplash.com/photo-1601058268499-e52642a18350?w=500&auto=format&fit=crop&q=60' },
                                ].map((cat, idx) => (
                                    <Link to={`/shop?category=${cat.name}`} key={idx} className="flex flex-col items-center group">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-100 p-1 bg-white shadow-sm hover:shadow-md transition-all duration-500"
                                        >
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                                            </div>
                                        </motion.div>
                                        <h4 className="font-bold text-gray-800 text-center tracking-tight group-hover:text-primary transition-colors">{cat.name}</h4>
                                    </Link>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Bestsellers Carousel */}
                <section className="section-padding bg-background/30 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
                                <div className="text-center md:text-left">
                                    <h2 className="text-primary mb-2">Our Bestsellers</h2>
                                    <p className="text-gray-500 font-medium">Loved by our community for a century.</p>
                                </div>
                                <Link to="/shop" className="btn-premium bg-white border border-gray-200 hover:border-primary text-primary px-8 text-sm">
                                    View All Products
                                </Link>
                            </div>

                            <BestsellerCarousel products={bestsellers} />
                        </ScrollReveal>
                    </div>
                </section>

                {/* Tradition Section */}
                <section className="section-padding bg-white overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="lg:w-1/2 relative">
                                <ScrollReveal direction="left">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />
                                    <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
                                        <img
                                            src={content?.tradition?.image || "https://images.unsplash.com/photo-1617462432650-6a9b407ec1ea?q=80&w=1000&auto=format&fit=crop"}
                                            alt="Tradition meets Science"
                                            className="w-full h-[500px] object-cover"
                                        />
                                    </div>
                                    <motion.div
                                        className="absolute -bottom-8 -left-8 glass p-8 rounded-3xl shadow-2xl max-w-xs z-20 border-white/50"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <p className="font-display text-primary text-xl font-bold italic mb-0 leading-relaxed">&quot;Ancient wisdom meets modern excellence.&quot;</p>
                                    </motion.div>
                                </ScrollReveal>
                            </div>
                            <div className="lg:w-1/2">
                                <ScrollReveal direction="right">
                                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-4 block">OUR PHILOSOPHY</span>
                                    <h2 className="text-primary mb-8 leading-tight">
                                        {content?.tradition?.title || <>Where Purity<br />Meets Integrity</>}
                                    </h2>
                                    <p className="mb-10 text-gray-600 leading-relaxed whitespace-pre-line text-lg font-medium">
                                        {content?.tradition?.subtitle ||
                                            `Hridved is more than a wellness brand; it's a legacy. Since 1921, we've remained steadfast in our commitment to authentic Ayurvedic practices. 
                                            
                                            Every formulation is a bridge between the profound knowledge of classical texts and the rigorous standards of modern science, ensuring that you receive nature's healing in its most potent form.`}
                                    </p>
                                    <Link to="/about">
                                        <button className="btn-primary">
                                            The Hridved Story <ArrowRight size={20} />
                                        </button>
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="section-padding bg-primary py-24">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                                        <Leaf size={36} className="text-secondary" />
                                    </div>
                                    <h3 className="text-white text-2xl mb-4">Purely Sourced</h3>
                                    <p className="text-white/60 font-medium">Handpicked herbs from their natural habitats for maximum potency.</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                                        <ShieldCheck size={36} className="text-secondary" />
                                    </div>
                                    <h3 className="text-white text-2xl mb-4">Quality First</h3>
                                    <p className="text-white/60 font-medium">Batch-tested in GMP-certified labs for safety and purity.</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                                        <Truck size={36} className="text-secondary" />
                                    </div>
                                    <h3 className="text-white text-2xl mb-4">Eco Conscious</h3>
                                    <p className="text-white/60 font-medium">Sustainably packaged to protect both you and our planet.</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="section-padding bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                        <img src="/logo-asset4.png" className="w-96 grayscale" alt="" />
                    </div>
                    <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
                        <ScrollReveal>
                            <h2 className="text-primary mb-6 italic font-bold">Stay Connected With Nature</h2>
                            <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                                Join our inner circle for exclusive Ayurvedic wisdom, product launches, and special wellness offers.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto p-2 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="border-none bg-transparent focus:ring-0 px-8 py-4"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </ScrollReveal>
                    </div>
                </section>
            </div>
        </AnimatedPage>
    );
};

export default HomePage;
