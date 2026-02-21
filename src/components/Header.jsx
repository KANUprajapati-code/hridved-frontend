import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ArrowRight } from 'lucide-react';
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
            initial="visible"
            animate={isVisible ? 'visible' : 'hidden'}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'glass-dark py-2 shadow-xl'
                : 'bg-primary py-4 shadow-md'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 relative z-10">
                    <img
                        src="/logo-asset4.png"
                        alt="HRIDVED"
                        className="h-10 md:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 active:scale-95"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-1 font-medium">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'About', path: '/about' },
                        { name: 'Shop', path: '/shop' },
                        { name: 'Consultation', path: '/consultation' },
                        { name: 'Blog', path: '/blogs' },
                        { name: 'Contact', path: '/contact' },
                    ].map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="px-4 py-2 rounded-full hover:bg-white/10 text-white transition-all duration-300 text-sm tracking-wide"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Search, Cart, User Actions */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Search */}
                    <div className="relative">
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'min(calc(100vw - 120px), 260px)', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    onSubmit={handleSearch}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center z-20"
                                >
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        className="rounded-full px-5 py-2 text-sm focus:outline-none w-full shadow-2xl bg-white/20 text-white placeholder-white/60 backdrop-blur-xl border border-white/30"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onBlur={() => !keyword && setIsSearchOpen(false)}
                                    />
                                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-secondary transition-colors">
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
                                className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-white"
                            >
                                <Search size={22} />
                            </motion.button>
                        )}
                    </div>

                    {/* Cart */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-white/10 block text-white transition-colors">
                            <ShoppingCart size={22} />
                            {cart?.cartItems?.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 bg-secondary text-primary text-[10px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-primary shadow-sm"
                                >
                                    {cart.cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                </motion.span>
                            )}
                        </Link>
                    </motion.div>

                    {/* User Menu */}
                    <div className="hidden sm:block">
                        {loading ? (
                            <div className="p-2.5">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : user ? (
                            <div className="relative">
                                <motion.button
                                    className="p-2.5 rounded-full hover:bg-white/10 flex items-center text-white transition-colors"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <User size={22} />
                                </motion.button>
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 p-2"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    View Profile
                                                </Link>
                                                {user.isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                                <button
                                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                                    className="flex w-full items-center px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 text-sm font-semibold transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-secondary text-primary px-6 py-2 rounded-full text-xs font-black tracking-widest hover:bg-white hover:shadow-lg transition-all active:scale-95"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
                            whileTap={{ scale: 0.9 }}
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[60] lg:hidden"
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col pt-20"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="px-8 py-4 flex flex-col space-y-1">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Shop', path: '/shop' },
                                    { name: 'Consultation', path: '/consultation' },
                                    { name: 'Wellness Blog', path: '/blogs' },
                                    { name: 'Contact', path: '/contact' },
                                ].map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="text-xl font-bold text-gray-800 py-3 border-b border-gray-50 flex items-center justify-between hover:text-primary active:bg-gray-50 rounded-lg px-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                        <ArrowRight size={18} className="opacity-30" />
                                    </Link>
                                ))}

                                <div className="pt-8 space-y-4">
                                    <Link
                                        to="/cart"
                                        className="btn-primary w-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Cart ({cart?.cartItems?.length || 0})
                                    </Link>

                                    {user ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                to="/profile"
                                                className="btn-premium bg-gray-100 text-gray-800 text-sm"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => { logout(); setIsOpen(false); }}
                                                className="btn-premium bg-red-50 text-red-500 text-sm"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to="/login"
                                            className="btn-secondary w-full"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login / Register
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
