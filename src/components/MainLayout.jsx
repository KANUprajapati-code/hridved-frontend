import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import CartDrawer from './CartDrawer';
import AIAssistantModal from './AIAssistantModal';
import DiwaliDecorations from './DiwaliDecorations';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-background pb-20 lg:pb-0">
            <DiwaliDecorations />
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <MobileNavigation />
            <Footer />
            <CartDrawer />
            <AIAssistantModal />
        </div>
    );
};

export default MainLayout;
