
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user && user.isAdmin) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 md:ml-64 transition-all duration-300">
                    {/* Admin Header */}
                    <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Welcome, {user.name}</span>
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        );
    }

    return <Navigate to="/login" replace />;
};

export default AdminRoute;
