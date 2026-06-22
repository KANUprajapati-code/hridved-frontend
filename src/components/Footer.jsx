
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/5">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
                
                {/* About & Socials */}
                <div className="space-y-6">
                    <img src="/logo-asset4.png" alt="HRIDVED AYURVEDA" className="h-14 w-auto object-contain" />
                    <p className="text-gray-300 text-sm font-light leading-relaxed">
                        Authentic Ayurvedic medicines and treatments since 2020.
                        Bringing the wisdom of Ayurveda to the modern world.
                    </p>
                    <div className="flex space-x-3 pt-2">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-xl flex items-center justify-center transition-colors"><Facebook size={18} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-xl flex items-center justify-center transition-colors"><Instagram size={18} /></a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-xl flex items-center justify-center transition-colors"><Twitter size={18} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-secondary mb-6 relative">
                        Quick Links
                        <span className="absolute bottom-[-8px] left-0 w-8 h-0.5 bg-secondary"></span>
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/" className="text-gray-300 hover:text-secondary">Home</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/shop" className="text-gray-300 hover:text-secondary">Shop</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/consultation" className="text-gray-300 hover:text-secondary">Consultation</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/blogs" className="text-gray-300 hover:text-secondary">Blog</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/about" className="text-gray-300 hover:text-secondary">About us</Link>
                        </li>
                    </ul>
                </div>

                {/* Support & Legal Links */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-secondary mb-6 relative">
                        Support & Legal
                        <span className="absolute bottom-[-8px] left-0 w-8 h-0.5 bg-secondary"></span>
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/contact" className="text-gray-300 hover:text-secondary">Contact Us</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/privacy" className="text-gray-300 hover:text-secondary">Privacy Policy</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/terms" className="text-gray-300 hover:text-secondary">Terms & Conditions</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/return-policy" className="text-gray-300 hover:text-secondary">Returns & Refunds</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/shipping-policy" className="text-gray-300 hover:text-secondary">Shipping Policy</Link>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <Link to="/track-order" className="text-gray-300 hover:text-secondary">Track Order</Link>
                        </li>
                    </ul>
                </div>

                {/* Get in Touch Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-secondary mb-6 relative">
                        Get In Touch
                        <span className="absolute bottom-[-8px] left-0 w-8 h-0.5 bg-secondary"></span>
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/25 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Phone</p>
                                <p className="text-xs font-bold text-gray-200">+91 89804 11390</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/25 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Email</p>
                                <p className="text-xs font-bold text-gray-200">hridvedpharama@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-black/25 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Address</p>
                                <p className="text-xs font-bold text-gray-200 leading-tight">23 Vraj Garden Society, Bayad, Dist: Aravalli, Gujarat 383325</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Note */}
            <div className="border-t border-white/5 mt-12 pt-6 text-center text-xs text-gray-400 tracking-wide">
                <p>&copy; {new Date().getFullYear()} HRIDVED AYURVEDA. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
