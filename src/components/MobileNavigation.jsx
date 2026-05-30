import { useLocation, Link } from 'react-router-dom';
import { Home, ShoppingBag, Stethoscope, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileNavigation = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { cart } = useCart();
    
    const currentPath = location.pathname;

    const cartCount = cart?.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

    const navItems = [
        {
            label: 'Home',
            path: '/',
            icon: Home,
        },
        {
            label: 'Shop',
            path: '/shop',
            icon: ShoppingBag,
        },
        {
            label: 'Consult',
            path: '/consultation',
            icon: Stethoscope,
        },
        {
            label: 'Cart',
            path: '/cart',
            icon: ShoppingCart,
            badge: cartCount,
        },
        {
            label: 'Profile',
            path: user ? '/profile' : '/login',
            icon: User,
        }
    ];

    // Check if the current route is active
    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    // Hide mobile navigation in admin routes
    if (currentPath.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none lg:hidden">
            <motion.nav 
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="max-w-md mx-auto h-16 pointer-events-auto flex items-center justify-around bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] luxury-shadow px-2"
            >
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;

                    return (
                        <Link 
                            key={item.label} 
                            to={item.path} 
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group outline-none"
                        >
                            <motion.div 
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center justify-center relative z-10"
                            >
                                {/* Active background glow/pill */}
                                {active && (
                                    <motion.div 
                                        layoutId="activeTabPill"
                                        className="absolute -inset-x-3 -inset-y-1.5 bg-primary/5 rounded-xl border border-primary/10 -z-10"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}

                                {/* Icon container with conditional coloring and scaling */}
                                <div className={`relative p-1 transition-colors duration-300 ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <IconComponent 
                                        size={22} 
                                        strokeWidth={active ? 2.5 : 2} 
                                        className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                                    />
                                    
                                    {/* Cart Badge */}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1.5 -right-1.5 bg-secondary text-primary font-sans font-black text-[9px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white shadow-sm"
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Tab Label */}
                                <span className={`text-[10px] font-sans font-bold tracking-wider mt-0.5 transition-colors duration-300 uppercase ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {item.label}
                                </span>

                                {/* Dot Indicator */}
                                {active && (
                                    <motion.div 
                                        layoutId="activeDot"
                                        className="w-1 h-1 bg-secondary rounded-full mt-0.5 absolute -bottom-1"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default MobileNavigation;
