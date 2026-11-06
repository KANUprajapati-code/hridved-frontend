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
            {/* Skip to Content for Keyboard Accessibility (WCAG 2.2 AA) */}
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-secondary focus:text-primary focus:px-4 focus:py-2 focus:rounded-xl focus:font-black focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
                Skip to main content
            </a>

            <DiwaliDecorations />
            <Header />
            <main id="main-content" tabIndex="-1" className="flex-grow focus:outline-none">
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
