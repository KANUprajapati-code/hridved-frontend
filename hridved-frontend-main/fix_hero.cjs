const fs = require('fs');
const path = 'src/pages/HomePage.jsx';
let content = fs.readFileSync(path, 'utf8');

const heroStart = content.indexOf('{/* Hero Section */}');
const sectionEnd = content.indexOf('</section>', heroStart) + '</section>'.length;

const newHero = '{/* Hero Section */}\n' +
    '                <section className="relative min-h-[450px] sm:h-[650px] md:h-[750px] lg:h-[85vh] flex items-center overflow-hidden bg-primary">\n' +
    '                    <div className="absolute inset-0 w-full h-full">\n' +
    '                        <AnimatedImage\n' +
    '                            src={content?.hero?.image || "/hero-bg.png"}\n' +
    '                            alt="Ayurveda Wellness"\n' +
    '                            containerClassName="w-full h-full !rounded-none"\n' +
    '                            className="w-full h-full object-cover object-center"\n' +
    '                            zoomIntensity={1.05}\n' +
    '                            loading="eager"\n' +
    '                        />\n' +
    '                        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>\n' +
    '                    </div>\n' +
    '\n' +
    '                    <div className="container mx-auto px-4 relative z-10 py-12 sm:py-0">\n' +
    '                        <ScrollReveal>\n' +
    '                            <div className="max-w-2xl text-white">\n' +
    '                                <span className="bg-secondary text-primary font-bold px-4 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] mb-4 md:mb-6 inline-block shadow-lg">\n' +
    '                                    Natural Care\n' +
    '                                </span>\n' +
    '                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold mb-4 md:mb-8 leading-[1.1]">\n' +
    '                                    {content?.hero?.title || <>Ancient Ayurveda.<br className="hidden sm:block" /> Modern Wellness.</>}\n' +
    '                                </h1>\n' +
    '                                <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 text-gray-100 font-light max-w-lg leading-relaxed">\n' +
    '                                    {content?.hero?.subtitle || "Pure formulations for your modern lifestyle. Handcrafted with wisdom from ancient texts, delivered with modern purity standards."}\n' +
    '                                </p>\n' +
    '                                <div className="flex flex-wrap gap-4">\n' +
    '                                    <Link to="/shop">\n' +
    '                                        <AnimatedButton className="bg-secondary text-primary px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white transition-all duration-300 border-none shadow-xl">\n' +
    '                                            {content?.hero?.ctaText || "Shop Now"}\n' +
    '                                        </AnimatedButton>\n' +
    '                                    </Link>\n' +
    '                                    <Link to="/consultation">\n' +
    '                                        <AnimatedButton variant="outline" className="bg-transparent border-2 border-white text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-white hover:text-primary transition-all duration-300">\n' +
    '                                            Consult\n' +
    '                                        </AnimatedButton>\n' +
    '                                    </Link>\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </ScrollReveal>\n' +
    '                    </div>\n' +
    '                </section>';

content = content.slice(0, heroStart) + newHero + content.slice(sectionEnd);
fs.writeFileSync(path, content, 'utf8');
console.log('Done! Hero section reverted successfully. Lines rewritten: hero block replaced.');
