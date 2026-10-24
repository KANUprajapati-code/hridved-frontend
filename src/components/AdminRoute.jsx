import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

const AdminRoute = () => {
    const { user, loading } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    if (loading) return <div>Loading...</div>;

    if (user && user.isAdmin) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
                <div className="flex-1 md:ml-64 transition-all duration-300">
                    {/* Admin Header */}
                    <header className="bg-white shadow-sm py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            >
                                <Menu size={24} />
                            </button>
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">Overview</h2>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <span className="hidden sm:inline text-sm text-gray-500 font-medium">Welcome, {user.name}</span>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="p-4 md:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        );
    }

    return <Navigate to="/login" replace />;
};

export default AdminRoute;
