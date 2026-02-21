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
            className={`sticky top-0 z-50 transition-all duration-300 bg-primary text-white ${scrolled ? 'shadow-md py-1' : 'py-2'}`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center relative">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <img
                        src="/logo-asset4.png"
                        alt="HRIDVED"
                        className="h-14 md:h-10 w-auto object-contain transition-transform hover:scale-105"
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
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-white"
                            whileTap={{ scale: 0.9 }}
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full top-full left-0"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 py-6 flex flex-col space-y-4 text-center">
                            <form onSubmit={handleSearch} className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none focus:border-primary"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </form>
                            <Link to="/" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>Home</Link>
                            <Link to="/shop" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>Shop</Link>
                            <Link to="/consultation" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>Consultation</Link>
                            <Link to="/blogs" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>Blog</Link>
                            <Link to="/about" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>About us</Link>
                            <Link to="/contact" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>Contact</Link>
                            <Link to="/cart" className="text-lg font-medium text-gray-800 hover:text-primary flex justify-center items-center gap-2" onClick={() => setIsOpen(false)}>
                                Cart <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{cart?.cartItems?.length || 0}</span>
                            </Link>
                            {loading ? (
                                <div className="flex justify-center p-2">
                                    <LoadingSpinner size="sm" />
                                </div>
                            ) : user ? (
                                <>
                                    <Link to="/profile" className="text-lg font-medium text-gray-800 hover:text-primary" onClick={() => setIsOpen(false)}>My Profile</Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="text-lg font-medium text-red-500 hover:text-red-600">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="bg-primary text-white py-2 px-6 rounded-full inline-block mx-auto hover:bg-opacity-90" onClick={() => setIsOpen(false)}>Login</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
