import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-background pb-20 lg:pb-0">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <MobileNavigation />
            <Footer />
        </div>
    );
};

export default MainLayout;
