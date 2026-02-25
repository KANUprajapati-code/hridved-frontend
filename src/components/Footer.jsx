
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-12 pb-6">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About */}
                <div>
                    <img src="/logo-asset4.png" alt="HRIDVED" className="h-12 w-auto mb-4" />
                    <p className="text-gray-300 text-sm">
                        Authentic Ayurvedic medicines and treatments since 1921.
                        Bringing the wisdom of Ayurveda to the modern world.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link to="/" className="text-gray-300">Home</Link></li>
                        <li><Link to="/shop" className="text-gray-300">Shop</Link></li>
                        <li><Link to="/consultation" className="text-gray-300">Consultation</Link></li>
                        <li><Link to="/blogs" className="text-gray-300">Blog</Link></li>
                        <li><Link to="/about" className="text-gray-300">About us</Link></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Support & Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link to="/contact" className="text-gray-300">Contact Us</Link></li>
                        <li><Link to="/privacy" className="text-gray-300">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="text-gray-300">Terms & Conditions</Link></li>
                        <li><Link to="/return-policy" className="text-gray-300">Returns & Refunds</Link></li>
                        <li><Link to="/shipping-policy" className="text-gray-300">Shipping Policy</Link></li>
                        <li><Link to="/track-order" className="text-gray-300">Track Order</Link></li>
                    </ul>
                </div>

                {/* Contact (shifted to 4th column, merged with socials or moved) */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Contact</h3>
                    <ul className="space-y-4 text-sm text-gray-300">
                        <li className="flex items-center space-x-2">
                            <MapPin size={18} />
                            <span>123 Ayurveda Lane, Kerala, India</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <Phone size={18} />
                            <span>+91 98765 43210</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <Mail size={18} />
                            <span>hridvedpharama@gmail.com</span>
                        </li>
                    </ul>
                    <div className="mt-6 flex space-x-4">
                        <a href="#" className="text-gray-300 hover:text-secondary"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-300 hover:text-secondary"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-300 hover:text-secondary"><Twitter size={20} /></a>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-4 text-sm text-gray-400">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} HRIDVED. All rights reserved.</p>
                    <p>Developed By <a href="https://final-portfolio-0zy2.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-secondary transition-colors font-medium">Kanu Prajapati</a></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
