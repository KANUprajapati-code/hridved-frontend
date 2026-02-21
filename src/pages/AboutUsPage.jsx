import { ArrowRight, Leaf, ShieldCheck, Award, Heart, History, Users, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedImage from '../components/AnimatedImage';
import AnimatedButton from '../components/AnimatedButton';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const AboutUsPage = () => {
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const { data } = await api.get('/about');
                setAboutData(data);
            } catch (error) {
                console.error('Error fetching about data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!aboutData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Failed to load content.</p>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[500px] flex items-center overflow-hidden">
                    <div className="absolute inset-0">
                        <AnimatedImage
                            src={aboutData.heroImage || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop"}
                            alt="Ayurveda Heritage"
                            className="w-full h-full object-cover"
                            zoomIntensity={1.1}
                        />
                        <div className="absolute inset-0 bg-primary/40"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <ScrollReveal>
                            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">{aboutData.heroTitle}</h1>
                            <p className="text-xl text-gray-100 max-w-2xl mx-auto font-light">
                                {aboutData.heroDescription}
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="md:w-1/2">
                                <ScrollReveal direction="left">
                                    <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Our Heritage</span>
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 text-left">{aboutData.ourStoryTitle}</h2>
                                    <div className="space-y-6 text-gray-600 leading-relaxed whitespace-pre-line">
                                        {aboutData.ourStoryDescription}
                                    </div>
                                    <div className="mt-10 flex gap-8">
                                        <div className="text-center">
                                            <div className="text-3xl font-serif font-bold text-primary">{aboutData.foundedYear}</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-widest">Founded</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-serif font-bold text-primary">{aboutData.experiseCount}</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-widest">Products</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-serif font-bold text-primary">{aboutData.healedCount}</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-widest">Healed</div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="md:w-1/2 relative">
                                <ScrollReveal direction="right">
                                    <div className="relative z-10">
                                        <AnimatedImage
                                            src="https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=1000&auto=format&fit=crop"
                                            alt="Traditional Ayurvedic Herbs"
                                            className="rounded-2xl shadow-2xl"
                                        />
                                    </div>
                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/20 rounded-full -z-10 animate-blob"></div>
                                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full -z-10 animate-blob animation-delay-2000"></div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20 bg-background/50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <ScrollReveal className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 h-full">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                                    <Heart size={32} />
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-primary mb-6">{aboutData.missionTitle}</h3>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                    {aboutData.missionDescription}
                                </p>
                            </ScrollReveal>
                            <ScrollReveal className="bg-primary p-12 rounded-3xl shadow-xl h-full text-white">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-secondary mb-8">
                                    <History size={32} />
                                </div>
                                <h3 className="text-3xl font-serif font-bold mb-6">{aboutData.visionTitle}</h3>
                                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-line">
                                    {aboutData.visionDescription}
                                </p>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Our Values Section */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">What We Stand For</span>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">The HRIDVED Promise</h2>
                            </div>
                        </ScrollReveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <ScrollReveal delay={100} className="text-center group">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                    <Leaf size={36} />
                                </div>
                                <h4 className="text-xl font-bold text-primary mb-4">100% Purity</h4>
                                <p className="text-gray-500">We source our ingredients from their natural habitats, ensuring peak potency and zero contamination.</p>
                            </ScrollReveal>

                            <ScrollReveal delay={200} className="text-center group">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                    <ShieldCheck size={36} />
                                </div>
                                <h4 className="text-xl font-bold text-primary mb-4">Science Backed</h4>
                                <p className="text-gray-500">Every formulation undergoes rigorous clinical testing and quality controls in our GMP facilities.</p>
                            </ScrollReveal>

                            <ScrollReveal delay={300} className="text-center group">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                    <Users size={36} />
                                </div>
                                <h4 className="text-xl font-bold text-primary mb-4">Ethical Sourcing</h4>
                                <p className="text-gray-500">We maintain direct partnerships with local farmers and support sustainable harvesting practices.</p>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-20">
                            <div className="md:w-1/2 order-2 md:order-1">
                                <ScrollReveal direction="left">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <AnimatedImage src={aboutData.teamImage1 || "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=500&auto=format&fit=crop"} alt="Ayurvedic Doctor" className="rounded-2xl h-64 object-cover w-full" />
                                            <AnimatedImage src={aboutData.teamImage2 || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop"} alt="Research Lab" className="rounded-2xl h-48 object-cover w-full" />
                                        </div>
                                        <div className="pt-12 space-y-4">
                                            <AnimatedImage src={aboutData.teamImage3 || "https://images.unsplash.com/photo-1594894512411-92b005188806?q=80&w=500&auto=format&fit=crop"} alt="Traditional Medicine Making" className="rounded-2xl h-48 object-cover w-full" />
                                            <AnimatedImage src={aboutData.teamImage4 || "https://images.unsplash.com/photo-1622253692010-333f2da60c8c?q=80&w=500&auto=format&fit=crop"} alt="Quality Check" className="rounded-2xl h-64 object-cover w-full" />
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="md:w-1/2 order-1 md:order-2">
                                <ScrollReveal direction="right">
                                    <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Our Expertise</span>
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8">Guided by Mastery</h2>
                                    <p className="text-gray-600 mb-6 text-lg">
                                        Our products are crafted under the supervision of seasoned Vaidyas (Ayurvedic physicians) and modern pharmaceutical experts.
                                    </p>
                                    <ul className="space-y-4 mb-10">
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <Award className="text-secondary" size={20} />
                                            <span>ISO 9001:2015 & GMP Certified Facilities</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <ShieldCheck className="text-secondary" size={20} />
                                            <span>Strict Quality Control & Lab Testing</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <Heart className="text-secondary" size={20} />
                                            <span>Over 100+ Years of Accumulated Wisdom</span>
                                        </li>
                                    </ul>
                                    <Link to="/consultation">
                                        <AnimatedButton className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:shadow-lg transition-all border-none">
                                            Speak to Our Experts <ArrowRight className="ml-2" size={20} />
                                        </AnimatedButton>
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <ScrollReveal className="bg-primary rounded-[3rem] p-16 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>

                            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Experience Pure Ayurveda</h2>
                            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
                                Join thousands of people who have transformed their lives through the power of authentic Ayurvedic wellness.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link to="/shop">
                                    <AnimatedButton className="bg-secondary text-primary px-12 py-4 rounded-full font-bold hover:bg-white transition-colors border-none text-lg">
                                        Shop Our Collection
                                    </AnimatedButton>
                                </Link>
                                <Link to="/consultation">
                                    <AnimatedButton variant="outline" className="border-2 border-white text-white px-12 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-colors text-lg">
                                        Book a Consultation
                                    </AnimatedButton>
                                </Link>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </div>
        </AnimatedPage>
    );
};

export default AboutUsPage;
