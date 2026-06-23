import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Home, ShoppingBag, Stethoscope, FileText, Compass, Info, Phone, Shield, LogOut, MapPin, Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { headerVariants, dropdownVariants, tapVariants } from '../utils/animations';
import LoadingSpinner from './LoadingSpinner';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { user, logout, loading } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Hide/show header on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/shop?keyword=${keyword}`);
            setIsSearchOpen(false);
        } else {
            navigate('/shop');
            setIsSearchOpen(false);
        }
    };

    return (
        <motion.header
            variants={headerVariants}
            animate={isVisible ? 'visible' : 'hidden'}
            className={`sticky top-0 z-50 transition-all duration-300 bg-primary text-white p-0`}
        >
            {/* Row 1: Announcement Bar */}
            <div className="bg-black/90 text-white py-2 text-center text-[10px] sm:text-xs font-black tracking-widest uppercase border-b border-white/5 px-4">
                Get 10% Off Your First Purchase. Use Code: <span className="text-secondary">WELCOME10</span>
            </div>

            {/* Row 2: Location and Socials - Desktop only */}
            <div className="hidden md:flex bg-black/20 border-b border-white/5 py-1.5 px-6 text-[10px] justify-between items-center text-gray-300 tracking-wider uppercase font-bold">
                <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-secondary" />
                    <span>Delivering to India | Free Shipping above ₹999</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Facebook size={12} /></a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Instagram size={12} /></a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Twitter size={12} /></a>
                    <a href="mailto:hridved.customercare@gmail.com" className="hover:text-secondary transition-colors"><Mail size={12} /></a>
                </div>
            </div>

            <div className={`container mx-auto flex justify-between items-center relative px-4 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3.5'}`}>
                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <img
                        src="/logo-asset4.png"
                        alt="HRIDVED AYURVEDA"
                        className="h-9 sm:h-10 w-auto object-contain transition-transform hover:scale-105"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex space-x-6 xl:space-x-8 items-center font-medium mx-4">
                    <Link to="/" className="hover:text-secondary transition text-gray-100">Home</Link>
                    <Link to="/shop" className="hover:text-secondary transition text-gray-100">Shop</Link>
                    <Link to="/consultation" className="hover:text-secondary transition text-gray-100">Consultation</Link>
                    <Link to="/blogs" className="hover:text-secondary transition text-gray-100">Blog</Link>
                    <Link to="/about" className="hover:text-secondary transition text-gray-100">About us</Link>
                    <Link to="/contact" className="hover:text-secondary transition text-gray-100">Contact</Link>
                </nav>

                {/* Search, Cart, User Actions */}
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                    {/* Search Component */}
                    <div className="relative">
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '160px' : '240px', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    onSubmit={handleSearch}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center"
                                >
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        className="rounded-full px-4 py-1.5 text-sm focus:outline-none w-full shadow-sm bg-white/20 text-white placeholder-gray-300 backdrop-blur-sm border border-white/30"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onBlur={() => !keyword && setIsSearchOpen(false)}
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-secondary text-white">
                                        <Search size={16} />
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {!isSearchOpen && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 rounded-full hover:bg-black/5 transition text-white"
                            >
                                <Search size={22} />
                            </motion.button>
                        )}
                    </div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/cart" id="cart-icon-container" className="relative p-2 block hover:text-secondary transition text-white">
                            <ShoppingCart size={22} />
                            {cart?.cartItems?.length > 0 && (
                                <motion.span
                                    className="absolute top-0 right-0 bg-secondary text-primary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {cart.cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                </motion.span>
                            )}
                        </Link>
                    </motion.div>

                    {/* User Menu - Desktop only or in mobile drawer */}
                    <div className="hidden sm:block">
                        {loading ? (
                            <div className="p-2 flex items-center justify-center">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : user ? (
                            <div
                                className="relative"
                            >
                                <motion.button
                                    className="p-2 flex items-center hover:text-secondary transition text-white"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <User size={22} />
                                </motion.button>
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            {/* Backdrop to close menu when clicking outside */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 overflow-hidden"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-3 hover:bg-gray-50 hover:text-primary text-gray-800 text-sm font-medium border-b border-gray-50 tracking-wide"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    Profile
                                                </Link>
                                                {user.isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        className="block px-4 py-3 hover:bg-gray-50 hover:text-primary text-gray-800 text-sm font-medium border-b border-gray-50 tracking-wide"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                                    className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Link to="/login" className="text-sm font-bold tracking-tight hover:text-secondary transition text-white">LOGIN</Link>
                            </motion.div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <motion.button
                            onClick={() => setIsOpen(true)}
                            className="p-2 rounded-lg text-white"
                            whileTap={{ scale: 0.9 }}
                        >
                            <Menu size={26} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Side Drawer Nav */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop with elegant blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />

                        {/* Drawer content sliding in from the right */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white text-gray-900 shadow-2xl z-[101] lg:hidden flex flex-col font-sans border-l border-gray-100 overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <img 
                                        src="/logo-asset4.png" 
                                        alt="HRIDVED AYURVEDA" 
                                        className="h-8 w-auto object-contain brightness-95 contrast-105" 
                                    />
                                    <span className="font-sans font-black tracking-widest text-[10px] uppercase text-primary border-l border-gray-200 pl-2">Menu</span>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Profile Card Section */}
                            <div className="p-5 border-b border-gray-100">
                                {loading ? (
                                    <div className="flex justify-center py-4">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                ) : user ? (
                                    <div className="bg-gradient-to-br from-primary to-[#032304] text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-4 -translate-y-4 pointer-events-none"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-secondary text-primary font-black flex items-center justify-center text-base border-2 border-white shadow-sm">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] uppercase font-bold tracking-widest text-secondary/90">Welcome back</p>
                                                <h4 className="font-sans font-black text-sm tracking-tight truncate leading-tight mt-0.5">{user.name}</h4>
                                                <p className="text-[10px] text-gray-200 truncate opacity-85 mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Link 
                                                to="/profile" 
                                                onClick={() => setIsOpen(false)}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-center py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                            {user.isAdmin && (
                                                <Link 
                                                    to="/admin" 
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 bg-secondary text-primary text-center py-1.5 rounded-lg text-xs font-black transition-colors"
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                                        <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-2">
                                            <User size={18} />
                                        </div>
                                        <h4 className="font-sans font-bold text-xs text-gray-800 tracking-tight">Your Ayurveda Journey</h4>
                                        <p className="text-[10px] text-gray-400 mt-1 mb-3">Sign in for personalized consultations and wellness orders.</p>
                                        <div className="flex gap-2">
                                            <Link 
                                                to="/login" 
                                                onClick={() => setIsOpen(false)}
                                                className="flex-1 bg-primary text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-opacity-95 transition-colors shadow-sm"
                                            >
                                                Log In
                                            </Link>
                                            <Link 
                                                to="/register" 
                                                onClick={() => setIsOpen(false)}
                                                className="flex-1 bg-white border border-gray-200 text-gray-700 text-center py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Search bar within drawer */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50/30">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-xs focus:outline-none focus:border-primary text-gray-800 placeholder-gray-400 transition-colors"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </form>
                            </div>

                            {/* Drawer scrollable section */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {/* Navigation Links */}
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 px-3 mb-2">Navigation</p>
                                    
                                    <Link 
                                        to="/" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <Home size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        Home
                                    </Link>
                                    <Link 
                                        to="/shop" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <ShoppingBag size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        Shop Products
                                    </Link>
                                    <Link 
                                        to="/consultation" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <Stethoscope size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        Consultation
                                    </Link>
                                    <Link 
                                        to="/blogs" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <FileText size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        Blog & Tips
                                    </Link>
                                    <Link 
                                        to="/track-order" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <Compass size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        Track Order
                                    </Link>
                                </div>

                                {/* Support & Info Links */}
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 px-3 mb-2">Company & Policies</p>
                                    
                                    <Link 
                                        to="/about" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all text-xs font-medium group"
                                    >
                                        <Info size={14} className="text-gray-400 group-hover:text-primary" />
                                        About Us
                                    </Link>
                                    <Link 
                                        to="/contact" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all text-xs font-medium group"
                                    >
                                        <Phone size={14} className="text-gray-400 group-hover:text-primary" />
                                        Contact Us
                                    </Link>
                                    <Link 
                                        to="/privacy" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all text-xs font-medium group"
                                    >
                                        <Shield size={14} className="text-gray-400 group-hover:text-primary" />
                                        Privacy Policy
                                    </Link>
                                    <Link 
                                        to="/return-policy" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all text-xs font-medium group"
                                    >
                                        <Shield size={14} className="text-gray-400 group-hover:text-primary" />
                                        Return Policy
                                    </Link>
                                </div>
                            </div>

                            {/* Logout Action at bottom of drawer */}
                            {user && (
                                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                    <button 
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Logout Account
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
