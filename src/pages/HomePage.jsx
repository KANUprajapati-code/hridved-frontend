
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

        const nextSlide = () => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        };

        const prevSlide = () => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
        };

        // Show 4 products at a time on large screens
        const visibleProducts = products.length > 4 ? products.slice(currentIndex, currentIndex + 4).concat(products.slice(0, Math.max(0, 4 - (products.length - currentIndex)))) : products;

        if (!products || products.length === 0) return <p className="text-center text-gray-500">No bestselling products found.</p>;

        return (
            <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visibleProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                            <div className="h-64 bg-gray-100 relative overflow-hidden">
                                <Link to={`/product/${product._id}`}>
                                    <AnimatedImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </Link>
                                <Link to={`/product/${product._id}`}>
                                    <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors z-10">
                                        <ArrowRight size={18} />
                                    </button>
                                </Link>
                                {product.countInStock === 0 && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">Out of Stock</div>
                                )}
                            </div>
                            <div className="p-4">
                                <Link to={`/product/${product._id}`}>
                                    <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                </Link>
                                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-primary text-lg">₹{product.price}</span>
                                    <div className="flex text-yellow-500 text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {products.length > 4 && (
                    <>
                        <AnimatedButton onClick={prevSlide} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-primary z-10 !w-auto !h-auto">
                            <ArrowRight size={24} className="rotate-180" />
                        </AnimatedButton>
                        <AnimatedButton onClick={nextSlide} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-primary z-10 !w-auto !h-auto">
                            <ArrowRight size={24} />
                        </AnimatedButton>
                    </>
                )}
            </div>
        );
    };


    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[600px] md:h-[700px] overflow-hidden">
                    <div className="absolute inset-0">
                        {/* Placeholder for the Woman Yoga Image */}
                        <AnimatedImage
                            src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop"
                            alt="Ayurveda Wellness"
                            className="w-full h-full object-cover"
                            zoomIntensity={1.05}
                        />
                        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
                        <ScrollReveal>
                            <div className="max-w-2xl text-white">
                                <span className="bg-secondary text-primary font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wider mb-4 inline-block">
                                    New In
                                </span>
                                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                                    {content?.hero?.title || <>Ancient Ayurveda.<br /> Modern Wellness.</>}
                                </h1>
                                <p className="text-lg md:text-xl mb-8 text-gray-100 font-light max-w-lg">
                                    {content?.hero?.subtitle || "Experience the healing power of nature with our authentic formulations adapted for your modern lifestyle."}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link to="/shop">
                                        <AnimatedButton className="bg-secondary text-primary px-8 py-3 rounded-full font-bold hover:bg-white transition-colors duration-300 border-none">
                                            {content?.hero?.ctaText || "Shop Now"}
                                        </AnimatedButton>
                                    </Link>
                                    <Link to="/consultation">
                                        <AnimatedButton variant="outline" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition-colors duration-300">
                                            Consult Doctor
                                        </AnimatedButton>
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Shop by Category Section - Circular Icons */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">Shop by Category</h2>
                                <p className="text-gray-500">Explore our curated collections for your specific needs.</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                                {[
                                    { name: 'Hair Care', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Skin Care', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Digestion', img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Immunity', img: 'https://images.unsplash.com/photo-1546868214-e95b36449173?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Wellness', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60' },
                                    { name: 'Oils', img: 'https://images.unsplash.com/photo-1601058268499-e52642a18350?w=500&auto=format&fit=crop&q=60' },
                                ].map((cat, idx) => (
                                    <Link to={`/shop?category=${cat.name}`} key={idx} className="flex flex-col items-center group">
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-secondary transition-all duration-300 mb-4 shadow-lg">
                                            <AnimatedImage src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{cat.name}</h3>
                                    </Link>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Best Sellers Section */}
                <section className="py-20 bg-background/50">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Our Bestsellers</h2>
                                    <p className="text-gray-500 mt-2">Customer favorites that deliver results.</p>
                                </div>
                                <Link to="/shop" className="text-primary font-bold text-sm tracking-wider uppercase hover:text-secondary hover:underline underline-offset-4">
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
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Why Choose HRIDVED</h2>
                                <p className="text-gray-500 max-w-2xl mx-auto">Experience the difference that comes from a century of dedication to purity and quality.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Leaf size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">100% Natural</h3>
                                    <p className="text-gray-600 text-sm">We use only the purest ingredients sourced directly from nature, free from harmful additives.</p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">GMP Certified</h3>
                                    <p className="text-gray-600 text-sm">Manufacturing excellence with strict quality controls at every step of the process.</p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Truck size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Zero Plastic Packaging</h3>
                                    <p className="text-gray-600 text-sm">We are committed to the planet with our eco-friendly, sustainable packaging initiatives.</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Ayurvedic Wisdom (Blog) Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">Ayurvedic Wisdom</h2>
                                    <p className="text-gray-500">Tips, guides, and insights for a healthier life.</p>
                                </div>
                                {/* <Link to="/blogs" className="text-primary font-bold hover:text-secondary group flex items-center">
                                    Read All Articles <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>*/}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {tips.length > 0 ? (
                                    tips.slice(0, 3).map((tip) => (
                                        <article key={tip._id} className="group cursor-pointer">
                                            <div className="rounded-2xl overflow-hidden mb-4 h-56 relative">
                                                <AnimatedImage src={tip.image} alt={tip.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-primary z-10">
                                                    {tip.category}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-primary mb-2 group-hover:text-secondary transition-colors leading-tight">
                                                {tip.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {tip.description}
                                            </p>
                                            <span className="text-primary font-bold text-sm underlineDecoration-secondary hover:underline">Read Tip</span>
                                        </article>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No tips found.</p>
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
