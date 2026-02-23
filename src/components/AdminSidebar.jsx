import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, FileText, LogOut, MessageSquare, Layout, ListOrdered, Tag, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-white/10 text-white border-l-4 border-secondary' : 'text-gray-300 hover:bg-white/5 hover:text-white';
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/admin/productlist', icon: <ShoppingBag size={20} /> },
        { name: 'Orders', path: '/admin/orderlist', icon: <ShoppingCart size={20} /> },
        { name: 'Users', path: '/admin/userlist', icon: <Users size={20} /> },
        { name: 'Doctors', path: '/admin/doctorlist', icon: <Users size={20} /> },
        { name: 'Promo Codes', path: '/admin/promocodelist', icon: <Tag size={20} /> },
        { name: 'Content', path: '/admin/homepage', icon: <Layout size={20} /> },
        { name: 'Messages', path: '/admin/contactlist', icon: <MessageSquare size={20} /> },
        { name: 'Blog', path: '/admin/bloglist', icon: <FileText size={20} /> },
        { name: 'Wisdom Tips', path: '/admin/tiplist', icon: <MessageSquare size={20} /> },
        { name: 'About Us', path: '/admin/about', icon: <ListOrdered size={20} /> },
    ];

    return (
        <>
            {/* Sidebar Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div className={`w-64 bg-primary h-screen fixed left-0 top-0 text-white transition-all duration-300 z-[70] flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Back to Site Button & Close Button */}
                <div className="p-4 bg-black/20 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-secondary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} />
                        Website
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Logo Area */}
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary font-bold shadow-inner">A</div>
                    <h2 className="text-xl font-display font-bold tracking-wide">Admin</h2>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Management</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive(item.path)}`}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/10 bg-black/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-2 py-3 text-red-400 hover:text-red-300 w-full transition-colors font-bold text-sm"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
