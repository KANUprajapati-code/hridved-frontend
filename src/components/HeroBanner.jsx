import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { getImageUrl } from '../utils/api';

/**
 * HeroBanner Component (Prompt 03 - Homepage Hero Redesign Only)
 * 
 * Strict Guardrails:
 * - Uses locked brand colors: Primary #053807, Secondary #D4AF37, Accent #E5D3B3
 * - Pure JavaScript / JSX (No TypeScript)
 * - Concise, truthful Ayurvedic headlines and supporting text
 * - Dual CTAs: Primary (Shop/Explore) + Secondary (Consultation/Purity)
 * - Fast loading (eager / fetchpriority high) with no layout shift (CLS protected)
 * - Responsive desktop / tablet / mobile layout with keyboard & touch accessibility
 */
const HeroBanner = ({ content }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);

    // Build curated truthful slides with CMS overrides where available
    const defaultSlides = [
        {
            id: 'flagship',
            badge: 'FLAGSHIP BAL RASAYANA',
            title: content?.hero?.title || 'Hridved Suvarnaprashan Drops 15ml',
            subtitle: content?.hero?.subtitle || 'Classical 24K Swarna Bhasma, Medhya Brahmi & Desi Cow Ghee. Handcrafted daily immunity and cognitive support for children (0-16 yrs).',
            image: getImageUrl(content?.hero?.image) || 'https://res.cloudinary.com/dzyyckpal/image/upload/v1786369409/hridved_uploads/766194416_17900478183546574_2292074687249109710_n-1786369409386.jpg',
            ctaText: content?.hero?.ctaText || 'Shop Suvarnaprashan Drop',
            ctaLink: content?.hero?.ctaLink || '/product/69999d3f601a51e1407f45cc',
            secondaryCtaText: 'Free Vaidya Guide',
            secondaryCtaLink: '/contact',
            alt: 'Hridved Suvarnaprashan 24K Gold Ayurvedic Drops for Children'
        },
        ...(content?.hero2?.image ? [{
            id: 'hair-care',
            badge: 'CLASSICAL HAIR RITUAL',
            title: content?.hero2?.title || 'Rosemary & Saffron Ayurvedic Hair Oil',
            subtitle: content?.hero2?.subtitle || 'A luxurious Ayurvedic hair oil cold-infused with botanical herbs and essential nutrients for strong, nourished hair roots.',
            image: getImageUrl(content?.hero2?.image) || '',
            ctaText: content?.hero2?.ctaText || 'Explore Hair Care',
            ctaLink: content?.hero2?.ctaLink || '/shop',
            secondaryCtaText: 'View All Formulations',
            secondaryCtaLink: '/shop',
            alt: 'Hridved Ayurvedic Botanical Hair Care Oil'
        }] : []),
        {
            id: 'purity',
            badge: '100% PURE & CLASSICAL',
            title: content?.hero3?.title || 'Handcrafted in Small Batches',
            subtitle: content?.hero3?.subtitle || 'Slow-cooked for 72 hours in traditional copper vessels following ancient Charaka Samhita guidelines. Tested against 140+ purity parameters.',
            image: getImageUrl(content?.hero3?.image) || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format',
            ctaText: content?.hero3?.ctaText || 'Our Purity Story',
            ctaLink: content?.hero3?.ctaLink || '/about',
            secondaryCtaText: 'Shop All Formulations',
            secondaryCtaLink: '/shop',
            alt: 'Hridved Ayurvedic Handcrafted Herbal Formulation Craft'
        }
    ];

    const slides = defaultSlides.filter(s => Boolean(s.image));
    const currentSlide = slides[activeSlide % slides.length] || slides[0];

    // Auto-advance slides every 7s unless hovered or interacted
    useEffect(() => {
        if (!slides.length || isPaused) return;
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [slides.length, isPaused]);

    const handlePrev = () => {
        setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = () => {
        setActiveSlide(prev => (prev + 1) % slides.length);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) {
            handleNext();
        } else if (diff < -50) {
            handlePrev();
        }
        touchStartX.current = null;
    };

    return (
        <section 
            className="container mx-auto px-4 pt-4 sm:pt-6 pb-10 sm:pb-14 relative"
            aria-label="HRIDVED Featured Ayurvedic Formulations Banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative w-full min-h-[580px] md:min-h-[560px] lg:h-[620px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#053807] via-[#09410c] to-[#032005] border border-white/10 flex items-center">
                
                {/* Ambient Botanical Glow Layers */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    {/* Soft Blurred Ambient Backdrop */}
                    <img
                        src={currentSlide.image}
                        alt=""
                        className="w-full h-full object-cover blur-3xl opacity-20 scale-125 transform transition-all duration-1000 mix-blend-screen"
                    />
                    {/* Deep Green Directional Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#053807]/95 via-[#053807]/85 to-[#053807]/40 md:to-transparent"></div>
                    
                    {/* Luxury Warm Glows */}
                    <div className="absolute -right-20 top-1/3 w-80 md:w-[480px] h-80 md:h-[480px] bg-secondary/15 rounded-full blur-[100px]"></div>
                    <div className="absolute -left-10 bottom-0 w-72 md:w-[400px] h-72 md:h-[400px] bg-emerald-600/15 rounded-full blur-[90px]"></div>
                </div>

                {/* Slide Content Frame */}
                <div 
                    key={currentSlide.id || activeSlide}
                    className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-10 gap-6 md:gap-8 transition-opacity duration-500 ease-out"
                >
                    {/* Left Column: Authentic Copy & Dual CTAs */}
                    <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col justify-center text-white z-20 order-2 md:order-1 text-center md:text-left items-center md:items-start">
                        
                        {/* Micro Category Pill */}
                        <div className="mb-3 sm:mb-4">
                            <span className="inline-flex items-center gap-1.5 bg-secondary text-primary font-black px-4 py-1.5 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.18em] shadow-md border border-secondary/30">
                                <Sparkles size={13} className="text-primary" aria-hidden="true" />
                                {currentSlide.badge}
                            </span>
                        </div>

                        {/* Truthful Concise Headline */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black text-white mb-3 sm:mb-4 leading-[1.15] drop-shadow-md tracking-tight">
                            {currentSlide.title}
                        </h1>

                        {/* Supporting Truthful Formulation Description */}
                        <p className="text-xs sm:text-sm md:text-base text-gray-200/90 font-light leading-relaxed max-w-xl mb-6 sm:mb-8">
                            {currentSlide.subtitle}
                        </p>

                        {/* Dual CTAs: Primary & Secondary */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                            {/* Primary Conversion CTA */}
                            <Link 
                                to={currentSlide.ctaLink} 
                                className="inline-flex items-center gap-2.5 bg-secondary text-primary hover:bg-white hover:text-primary px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl font-bold text-xs uppercase tracking-[0.16em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
                            >
                                <span>{currentSlide.ctaText || 'Shop Collection'}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                            </Link>

                            {/* Secondary Informational / Consultation CTA */}
                            <Link 
                                to={currentSlide.secondaryCtaLink} 
                                className="inline-flex items-center gap-2 bg-transparent text-white hover:bg-white/10 border-2 border-accent/40 hover:border-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <span>{currentSlide.secondaryCtaText || 'Explore More'}</span>
                            </Link>
                        </div>

                        {/* Truthful Trust Highlights */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-3 border-t border-white/10 text-xs text-gray-300/90 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Leaf size={14} className="text-secondary" aria-hidden="true" />
                                100% Classical Ayurveda
                            </span>
                            <span className="text-white/30 hidden sm:inline" aria-hidden="true">•</span>
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-secondary" aria-hidden="true" />
                                GMP Certified Facility
                            </span>
                            <span className="text-white/30 hidden sm:inline" aria-hidden="true">•</span>
                            <span className="flex items-center gap-1.5">
                                <Award size={14} className="text-secondary" aria-hidden="true" />
                                Small Batch Handcrafted
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Preserved Aspect Ratio Showcase Visual */}
                    <div className="w-full md:w-1/2 lg:w-5/12 h-[260px] sm:h-[320px] md:h-[440px] lg:h-[480px] flex items-center justify-center md:justify-end relative z-10 order-1 md:order-2">
                        <div className="relative h-full w-full flex items-center justify-center md:justify-end p-2 sm:p-4">
                            <img
                                src={currentSlide.image}
                                alt={currentSlide.alt || currentSlide.title}
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                                className="max-h-[240px] sm:max-h-[300px] md:max-h-[440px] lg:max-h-[470px] w-auto max-w-full object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Slider Navigation Arrows - Desktop & Tablet */}
                <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 flex gap-2">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous slide"
                        className="w-10 h-10 bg-primary/70 hover:bg-primary text-white backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/15 transition-all active:scale-90 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next slide"
                        className="w-10 h-10 bg-primary/70 hover:bg-primary text-white backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/15 transition-all active:scale-90 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Dot Indicators */}
                <div 
                    className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-primary/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15"
                    role="tablist"
                    aria-label="Slide indicators"
                >
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            role="tab"
                            aria-selected={activeSlide === index}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                                activeSlide === index 
                                    ? 'w-7 bg-secondary shadow-sm shadow-secondary/50' 
                                    : 'w-2 bg-white/40 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
