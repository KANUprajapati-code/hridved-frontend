const fs = require('fs');
const path = 'src/pages/HomePage.jsx';
let content = fs.readFileSync(path, 'utf8');

const heroStart = content.indexOf('{/* Hero Section */}');
const sectionEnd = content.indexOf('</section>', heroStart) + '</section>'.length;

const newHero = `{/* Hero Section */}
                <section className="relative min-h-[450px] sm:h-[650px] md:h-[750px] lg:h-[85vh] flex items-center overflow-hidden bg-primary">
                    <div className="absolute inset-0 w-full h-full">
                        <AnimatedImage
                            src={content?.hero?.image || "/hero-bg.png"}
                            alt="Ayurveda Wellness"
                            containerClassName="w-full h-full !rounded-none"
                            className="w-full h-full object-cover object-center"
                            zoomIntensity={1.05}
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-12 sm:py-0">
                        <ScrollReveal>
                            <div className="max-w-2xl text-white">
                                <span className="bg-secondary text-primary font-bold px-4 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] mb-4 md:mb-6 inline-block shadow-lg">
                                    Natural Care
                                </span>
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold mb-4 md:mb-8 leading-[1.1]">
                                    {content?.hero?.title || <>Ancient Ayurveda.<br className="hidden sm:block" /> Modern Wellness.</>}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 text-gray-100 font-light max-w-lg leading-relaxed">
                                    {content?.hero?.subtitle || "Pure formulations for your modern lifestyle. Handcrafted with wisdom from ancient texts, delivered with modern purity standards."}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link to="/shop">
                                        <AnimatedButton className="bg-secondary text-primary px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white transition-all duration-300 border-none shadow-xl">
                                            {content?.hero?.ctaText || "Shop Now"}
                                        </AnimatedButton>
                                    </Link>
                                    <Link to="/consultation">
                                        <AnimatedButton variant="outline" className="bg-transparent border-2 border-white text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white hover:text-primary transition-all duration-300">
                                            Consult
                                        </AnimatedButton>
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>`;

content = content.slice(0, heroStart) + newHero + content.slice(sectionEnd);
fs.writeFileSync(path, content, 'utf8');
console.log('Done! Hero section reverted successfully.');
