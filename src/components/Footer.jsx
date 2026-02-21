
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-primary text-white py-16 sm:py-20 md:py-24">
            <div className="container-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10 mb-12">
                    {/* About */}
                    <div className="space-y-4">
                        <img src="/logo-modified.png" alt="HRIDVED" className="h-14 w-auto" />
                        <p className="text-gray-200 text-sm leading-relaxed">
                            Authentic Ayurvedic medicines and treatments since 1921. Bringing the wisdom of Ayurveda to the modern world.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg md:text-base font-semibold tracking-tight">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-gray-200">
                            <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
                            <li><Link to="/shop" className="hover:text-secondary transition-colors">Shop</Link></li>
                            <li><Link to="/blogs" className="hover:text-secondary transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                            <li><Link to="/return-policy" className="hover:text-secondary transition-colors">Return Policy</Link></li>
                            <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg md:text-base font-semibold tracking-tight">Contact</h3>
                        <ul className="space-y-4 text-sm text-gray-200">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="flex-shrink-0 mt-0.5" />
                                <span>123 Ayurveda Lane, Kerala, India</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={20} className="flex-shrink-0 mt-0.5" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail size={20} className="flex-shrink-0 mt-0.5" />
                                <span>support@hridved.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="space-y-4">
                        <h3 className="text-lg md:text-base font-semibold tracking-tight">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="p-2.5 bg-white/10 rounded-lg hover:bg-secondary hover:text-primary transition-colors" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2.5 bg-white/10 rounded-lg hover:bg-secondary hover:text-primary transition-colors" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2.5 bg-white/10 rounded-lg hover:bg-secondary hover:text-primary transition-colors" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/20 pt-8 text-center text-sm text-gray-300">
                    &copy; {new Date().getFullYear()} HRIDVED. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
