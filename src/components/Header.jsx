import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Home, ShoppingBag, FileText, Compass, Info, Phone, Shield, LogOut, MapPin, Facebook, Instagram, Twitter, Mail, Heart, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { headerVariants, dropdownVariants, tapVariants } from '../utils/animations';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { user, logout, loading } = useAuth();
    const { cart, openCartDrawer } = useCart();
    const { wishlistCount } = useWishlist();
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

    // Keyboard accessibility for ESC key to close search, drawer, and user menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isSearchOpen) setIsSearchOpen(false);
                if (isOpen) setIsOpen(false);
                if (showUserMenu) setShowUserMenu(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen, isOpen, showUserMenu]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = keyword.trim();
        if (trimmed) {
            trackWebsiteEvent('search', { query: trimmed });
            navigate(`/shop?keyword=${encodeURIComponent(trimmed)}`);
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
            {/* Row 1: Festive Diwali Announcement Bar */}
            <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 text-amber-200 py-2 text-center text-[11px] sm:text-xs font-black tracking-wider uppercase border-b border-amber-400/30 px-4 flex items-center justify-center gap-2 shadow-inner">
                <span className="animate-pulse">🪔</span>
                <span>Shubh Deepavali Mahotsav: <span className="text-white">Flat 25% OFF</span> with Code: <span className="bg-amber-400 text-gray-950 px-2 py-0.5 rounded font-black tracking-widest">DIWALI25</span> | Free Festive Gift on Orders Above ₹999! 🎁</span>
                <span className="animate-pulse">🪔</span>
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
                    {/* Shop Mega Menu Dropdown */}
                    <div className="relative group py-2">
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-1 hover:text-secondary transition text-gray-100 focus:outline-none focus:text-secondary font-medium"
                            aria-haspopup="true"
                        >
                            <span>Shop</span>
                            <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200 text-gray-300" />
                        </Link>

                        {/* Dropdown Menu Container */}
                        <div className="absolute top-full left-0 pt-2 w-[440px] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 p-5 overflow-hidden">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                                        <Sparkles size={11} className="text-secondary" />
                                        Ayurvedic Apothecary
                                    </span>
                                    <Link to="/shop" className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1">
                                        <span>Shop All Formulations</span>
                                        <ArrowRight size={12} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Column 1: By Category */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">By Category</p>
                                        <ul className="space-y-1.5 text-xs">
                                            <li>
                                                <Link to="/category/child-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    👶 Child Care
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/category/skin-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    ✨ Skin Care
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/category/hair-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    🌿 Hair Care
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/category/immunity" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    🛡️ Immunity & Rasayana
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Column 2: By Concern */}
                                    <div className="border-l border-gray-100 pl-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Shop by Concern</p>
                                        <ul className="space-y-1.5 text-xs">
                                            <li>
                                                <Link to="/concern/bal-rasayana" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    Bal Rasayana (Immunity)
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/concern/keshya-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    Keshya Care (Hair Fall)
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/concern/varnya-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    Varnya Care (Skin Radiance)
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/concern/sandhi-care" className="block py-1.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary font-medium transition-colors">
                                                    Sandhi Care (Joint Comfort)
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link to="/blogs" className="hover:text-secondary transition text-gray-100">Blog</Link>
                    <Link to="/about" className="hover:text-secondary transition text-gray-100">About us</Link>
                    <Link to="/contact" className="hover:text-secondary transition text-gray-100">Contact</Link>
                </nav>

                {/* Search, Cart, User Actions */}
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                    {/* Search Component */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Open search bar"
                            aria-expanded={isSearchOpen}
                            className="p-2 rounded-full hover:bg-black/5 transition text-white cursor-pointer"
                        >
                            <Search size={22} />
                        </motion.button>

                        <AnimatePresence>
                            {isSearchOpen && (
                                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs">
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl p-5 sm:p-6 relative text-gray-900"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black uppercase tracking-wider text-primary">HRIDVED Search</span>
                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Classical Formulas & Herbs</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsSearchOpen(false)}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                                aria-label="Close search"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <SearchBar
                                            autoFocus
                                            placeholder="Search formulations, SKU, herbs (e.g., Suvarnaprashan, Kumkumadi)..."
                                            onSearchComplete={() => setIsSearchOpen(false)}
                                        />
                                    </motion.div>
                                    <div className="fixed inset-0 -z-10" onClick={() => setIsSearchOpen(false)} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Wishlist */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/wishlist"
                            id="wishlist-icon-container"
                            aria-label="View Saved Wishlist"
                            className="relative p-2 block hover:text-secondary transition text-white cursor-pointer"
                        >
                            <Heart size={21} />
                            {wishlistCount > 0 && (
                                <motion.span
                                    className="absolute top-0 right-0 bg-secondary text-primary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </Link>
                    </motion.div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button 
                            type="button"
                            onClick={() => (openCartDrawer ? openCartDrawer() : navigate('/cart'))}
                            id="cart-icon-container" 
                            aria-label="Open Herbal Cart"
                            className="relative p-2 block hover:text-secondary transition text-white cursor-pointer"
                        >
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
                        </button>
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
                                                <Link
                                                    to="/wishlist"
                                                    className="block px-4 py-3 hover:bg-gray-50 hover:text-primary text-gray-800 text-sm font-medium border-b border-gray-50 tracking-wide"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    My Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
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
                            aria-label="Open navigation menu"
                            aria-expanded={isOpen}
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
                                    aria-label="Close navigation menu"
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
                                <SearchBar
                                    placeholder="Search remedies, SKU, herbs..."
                                    onSearchComplete={() => setIsOpen(false)}
                                />
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
                                        Shop All Products
                                    </Link>

                                    {/* Mobile Categories Submenu */}
                                    <div className="pl-6 py-1 space-y-1 border-l-2 border-primary/10 ml-5 my-1">
                                        <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Categories</p>
                                        <Link to="/category/child-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Child Care
                                        </Link>
                                        <Link to="/category/skin-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Skin Care
                                        </Link>
                                        <Link to="/category/hair-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Hair Care
                                        </Link>
                                        <Link to="/category/immunity" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Immunity
                                        </Link>
                                    </div>

                                    {/* Mobile Concerns Submenu */}
                                    <div className="pl-6 py-1 space-y-1 border-l-2 border-secondary/20 ml-5 my-1">
                                        <p className="text-[9px] uppercase font-bold text-secondary mb-1">Shop by Concern</p>
                                        <Link to="/concern/bal-rasayana" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Bal Rasayana (Child Immunity)
                                        </Link>
                                        <Link to="/concern/keshya-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Keshya Care (Hair Fall)
                                        </Link>
                                        <Link to="/concern/varnya-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Varnya Care (Skin Glow)
                                        </Link>
                                        <Link to="/concern/sandhi-care" onClick={() => setIsOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-primary">
                                            • Sandhi Care (Joint Comfort)
                                        </Link>
                                    </div>
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
                                    <Link 
                                        to="/wishlist" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-all text-xs font-bold group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Heart size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            <span>My Wishlist</span>
                                        </div>
                                        {wishlistCount > 0 && (
                                            <span className="bg-secondary text-primary font-bold text-[10px] px-2 py-0.5 rounded-full">
                                                {wishlistCount}
                                            </span>
                                        )}
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
