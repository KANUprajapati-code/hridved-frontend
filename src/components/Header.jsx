import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
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
            className={`sticky top-0 z-50 transition-all duration-300 bg-primary text-white ${scrolled ? 'shadow-lg py-2' : 'py-3 sm:py-4'}`}
        >
            <div className="container-full flex justify-between items-center relative">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105">
                    <img
                        src="/logo-asset4.png"
                        alt="HRIDVED"
                        className="h-12 sm:h-14 md:h-16 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex gap-6 xl:gap-8 items-center font-medium">
                    <Link to="/" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">Home</Link>
                    <Link to="/about" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">About Us</Link>
                    <Link to="/shop" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">Shop</Link>
                    <Link to="/consultation" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">Consult Doctor</Link>
                    <Link to="/blogs" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">Wellness Blog</Link>
                    <Link to="/contact" className="text-gray-100 hover:text-secondary transition-colors text-sm xl:text-base">Contact</Link>
                </nav>

                {/* Search, Cart, User Actions */}
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                    {/* Search Component */}
                    <div className="relative">
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '140px' : '220px', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    onSubmit={handleSearch}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center"
                                >
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        className="rounded-full px-4 py-2 text-sm focus:outline-none w-full shadow-md bg-white/20 text-white placeholder-gray-300 backdrop-blur-sm border border-white/30 focus:border-secondary focus:bg-white/30 transition-all"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onBlur={() => !keyword && setIsSearchOpen(false)}
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-secondary text-white transition-colors">
                                        <Search size={18} />
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {!isSearchOpen && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors text-white"
                                aria-label="Search products"
                            >
                                <Search size={20} className="sm:w-6 sm:h-6" />
                            </motion.button>
                        )}
                    </div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/cart" id="cart-icon-container" className="relative p-2.5 sm:p-3 block hover:text-secondary transition-colors text-white rounded-full hover:bg-white/10">
                            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                            {cart?.cartItems?.length > 0 && (
                                <motion.span
                                    className="absolute top-1 right-1 bg-secondary text-primary text-[9px] sm:text-[10px] font-bold rounded-full h-5 w-5 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-white"
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
                            <div className="p-2.5 sm:p-3 flex items-center justify-center">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : user ? (
                            <div className="relative">
                                <motion.button
                                    className="p-2.5 sm:p-3 flex items-center hover:text-secondary transition-colors text-white rounded-full hover:bg-white/10"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="User menu"
                                >
                                    <User size={20} className="sm:w-6 sm:h-6" />
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
                                                className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="block px-5 py-3 hover:bg-gray-50 hover:text-primary text-gray-800 text-sm font-medium border-b border-gray-100 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    My Profile
                                                </Link>
                                                {user.isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        className="block px-5 py-3 hover:bg-gray-50 hover:text-primary text-gray-800 text-sm font-medium border-b border-gray-100 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                                    className="block w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors"
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
                                <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-secondary transition-colors text-white bg-white/10 rounded-lg hover:bg-white/20">Login</Link>
                            </motion.div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 rounded-lg text-white hover:bg-white/10 transition-colors"
                            whileTap={{ scale: 0.9 }}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="lg:hidden bg-white border-t border-gray-200 shadow-xl absolute w-full top-full left-0"
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            <form onSubmit={handleSearch} className="relative mb-2">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </form>
                            <Link to="/" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
                            <Link to="/about" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
                            <Link to="/shop" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Shop</Link>
                            <Link to="/blogs" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Wellness Blog</Link>
                            <Link to="/contact" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Contact</Link>
                            <Link to="/cart" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors flex items-center justify-between" onClick={() => setIsOpen(false)}>
                                Cart <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{cart?.cartItems?.length || 0}</span>
                            </Link>
                            {loading ? (
                                <div className="flex justify-center p-3">
                                    <LoadingSpinner size="sm" />
                                </div>
                            ) : user ? (
                                <>
                                    <Link to="/profile" className="px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors border-t border-gray-100 mt-2" onClick={() => setIsOpen(false)}>My Profile</Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="px-4 py-3 bg-primary text-white font-semibold rounded-lg text-center hover:bg-primary/90 transition-colors mt-2" onClick={() => setIsOpen(false)}>Login</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
