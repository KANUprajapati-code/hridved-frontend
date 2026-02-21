
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, FileText, Settings, LogOut, MessageSquare, Layout, ListOrdered, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
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
        <div className="w-64 bg-primary min-h-screen fixed left-0 top-0 text-white transition-all duration-300 z-50 flex flex-col hidden md:flex">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary font-bold">A</div>
                <h2 className="text-xl font-serif font-bold tracking-wide">Admin Portal</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1">
                <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive(item.path)}`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-2 py-3 text-red-300 hover:text-red-100 w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
