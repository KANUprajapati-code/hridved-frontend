
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { ToastProvider } from './context/ToastContext';
import { FlyingElementProvider } from './context/FlyingElementContext';
import Toast from './components/Toast';
import FlyingElement from './components/FlyingElement';
import LoginModal from './components/LoginModal';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './components/MainLayout';
import SimpleLoader from './components/SimpleLoader';
import AnalyticsConsent from './components/AnalyticsConsent';
import { trackWebsiteEvent } from './utils/websiteAnalytics';
import HomePage from './pages/HomePage';

// Resilient lazy load with auto-recovery on deployment bundle updates
const lazyWithRetry = (importFn) =>
    lazy(() =>
        importFn().catch((error) => {
            console.warn('[Vite] Dynamic chunk import failed, refreshing page with latest assets...', error);
            const key = 'chunk_reload_' + window.location.pathname;
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, 'true');
                window.location.reload();
                return new Promise(() => {});
            }
            sessionStorage.removeItem(key);
            throw error;
        })
    );

// Lazy loaded secondary components
const ShopPage = lazyWithRetry(() => import('./pages/ShopPage'));
const ProductPage = lazyWithRetry(() => import('./pages/ProductPage'));
const CartPage = lazyWithRetry(() => import('./pages/CartPage'));
const WishlistPage = lazyWithRetry(() => import('./pages/WishlistPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const ShippingPage = lazyWithRetry(() => import('./pages/ShippingPage'));
const PlaceOrderPage = lazyWithRetry(() => import('./pages/PlaceOrderPage'));
const CheckoutPage = lazyWithRetry(() => import('./pages/CheckoutPage'));
const CheckoutAddressPage = lazyWithRetry(() => import('./pages/CheckoutAddressPage'));
const CheckoutShippingPage = lazyWithRetry(() => import('./pages/CheckoutShippingPage'));
const CheckoutPaymentPage = lazyWithRetry(() => import('./pages/CheckoutPaymentPage'));
const CheckoutSuccessPage = lazyWithRetry(() => import('./pages/CheckoutSuccessPage'));
const TrackOrderPage = lazyWithRetry(() => import('./pages/TrackOrderPage'));
const OrderPage = lazyWithRetry(() => import('./pages/OrderPage'));
const PaymentSuccess = lazyWithRetry(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazyWithRetry(() => import('./pages/PaymentFailed'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const BlogDetailPage = lazyWithRetry(() => import('./pages/BlogDetailPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const ReturnPolicy = lazyWithRetry(() => import('./pages/ReturnPolicy'));
const TermsAndConditions = lazyWithRetry(() => import('./pages/TermsAndConditions'));
const ShippingPolicy = lazyWithRetry(() => import('./pages/ShippingPolicy'));
const AboutUsPage = lazyWithRetry(() => import('./pages/AboutUsPage'));
const OptOutPage = lazyWithRetry(() => import('./pages/OptOutPage'));

const AdminRoute = lazyWithRetry(() => import('./components/AdminRoute'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const ProductListPage = lazyWithRetry(() => import('./pages/admin/ProductListPage'));
const ProductEditPage = lazyWithRetry(() => import('./pages/admin/ProductEditPage'));
const OrderListPage = lazyWithRetry(() => import('./pages/admin/OrderListPage'));
const UserListPage = lazyWithRetry(() => import('./pages/admin/UserListPage'));
const ContactListPage = lazyWithRetry(() => import('./pages/admin/ContactListPage'));
const HomePageEdit = lazyWithRetry(() => import('./pages/admin/HomePageEdit'));
const DoctorListPage = lazyWithRetry(() => import('./pages/admin/DoctorListPage'));
const DoctorEditPage = lazyWithRetry(() => import('./pages/admin/DoctorEditPage'));
const BlogListPage = lazyWithRetry(() => import('./pages/admin/BlogListPage'));
const BlogEditPage = lazyWithRetry(() => import('./pages/admin/BlogEditPage'));
const TipListPage = lazyWithRetry(() => import('./pages/admin/TipListPage'));
const TipEditPage = lazyWithRetry(() => import('./pages/admin/TipEditPage'));
const AboutEditPage = lazyWithRetry(() => import('./pages/admin/AboutEditPage'));
const PromoCodeListPage = lazyWithRetry(() => import('./pages/admin/PromoCodeListPage'));
const PromoCodeEditPage = lazy(() => import('./pages/admin/PromoCodeEditPage'));
const CategoryListPage = lazy(() => import('./pages/admin/CategoryListPage'));
const CategoryEditPage = lazy(() => import('./pages/admin/CategoryEditPage'));
const ShippingSettingsPage = lazy(() => import('./pages/admin/ShippingSettingsPage'));
const DoctorBookingListPage = lazy(() => import('./pages/admin/DoctorBookingListPage'));
const DoctorCategoryListPage = lazy(() => import('./pages/admin/DoctorCategoryListPage'));
const ShopPageEdit = lazy(() => import('./pages/admin/ShopPageEdit'));
const AudienceMarketingPage = lazy(() => import('./pages/admin/AudienceMarketingPage'));
const WebsiteAnalyticsPage = lazy(() => import('./pages/admin/WebsiteAnalyticsPage'));

function WebsiteEventTracker() {
    const location = useLocation();
    useEffect(() => { trackWebsiteEvent('page_view'); }, [location.pathname]);
    return <AnalyticsConsent />;
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <WebsiteEventTracker />
            <ToastProvider>
                <FlyingElementProvider>
                    <AuthProvider>
                        <WishlistProvider>
                            <CartProvider>
                                <CheckoutProvider>
                                    <div className="min-h-screen bg-background">
                                        <ScrollToTop />
                                        <Suspense fallback={<SimpleLoader />}>
                                            <Routes>
                                                        {/* Public Routes */}
                                                        <Route element={<MainLayout />}>
                                                            <Route path="/" element={<HomePage />} />
                                                            <Route path="/shop" element={<ShopPage />} />
                                                            <Route path="/product/:id" element={<ProductPage />} />
                                                            <Route path="/cart" element={<CartPage />} />
                                                            <Route path="/wishlist" element={<WishlistPage />} />
                                                            <Route path="/login" element={<LoginPage />} />
                                                        <Route path="/register" element={<RegisterPage />} />
                                                        <Route path="/profile" element={<ProfilePage />} />
                                                        <Route path="/shipping" element={<ShippingPage />} />
                                                        <Route path="/placeorder" element={<PlaceOrderPage />} />
                                                        <Route path="/checkout" element={<CheckoutPage />} />
                                                        <Route path="/checkout/address" element={<CheckoutAddressPage />} />
                                                        <Route path="/checkout/shipping" element={<CheckoutShippingPage />} />
                                                        <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
                                                        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                                                        <Route path="/payment-success" element={<PaymentSuccess />} />
                                                        <Route path="/payment-failed" element={<PaymentFailed />} />
                                                        <Route path="/order/:id" element={<OrderPage />} />
                                                        <Route path="/track-order" element={<TrackOrderPage />} />
                                                        <Route path="/blogs" element={<BlogPage />} />
                                                        <Route path="/blog/:slug" element={<BlogDetailPage />} />
                                                        <Route path="/contact" element={<ContactPage />} />
                                                        <Route path="/privacy" element={<PrivacyPolicy />} />
                                                        <Route path="/return-policy" element={<ReturnPolicy />} />
                                                        <Route path="/terms" element={<TermsAndConditions />} />
                                                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                                                        <Route path="/about" element={<AboutUsPage />} />
                                                        <Route path="/opt-out" element={<OptOutPage />} />
                                                    </Route>

                                                    {/* Admin Routes */}
                                                    <Route path="/admin" element={<AdminRoute />}>
                                                        <Route index element={<AdminDashboard />} />
                                                        <Route path="productlist" element={<ProductListPage />} />
                                                        <Route path="product/:id/edit" element={<ProductEditPage />} />
                                                        <Route path="orderlist" element={<OrderListPage />} />
                                                        <Route path="userlist" element={<UserListPage />} />
                                                        <Route path="bloglist" element={<BlogListPage />} />
                                                        <Route path="blog/:id/edit" element={<BlogEditPage />} />
                                                        <Route path="contactlist" element={<ContactListPage />} />
                                                        <Route path="homepage" element={<HomePageEdit />} />
                                                        <Route path="doctorlist" element={<DoctorListPage />} />
                                                        <Route path="doctor/:id/edit" element={<DoctorEditPage />} />
                                                        <Route path="tiplist" element={<TipListPage />} />
                                                        <Route path="tip/:id/edit" element={<TipEditPage />} />
                                                        <Route path="about" element={<AboutEditPage />} />
                                                        <Route path="promocodelist" element={<PromoCodeListPage />} />
                                                        <Route path="promocode/add" element={<PromoCodeEditPage />} />
                                                        <Route path="promocode/:id/edit" element={<PromoCodeEditPage />} />
                                                        <Route path="categorylist" element={<CategoryListPage />} />
                                                        <Route path="category/add" element={<CategoryEditPage />} />
                                                        <Route path="category/:id/edit" element={<CategoryEditPage />} />
                                                        <Route path="shipping" element={<ShippingSettingsPage />} />
                                                        <Route path="doctor-bookings" element={<DoctorBookingListPage />} />
                                                        <Route path="doctor-categorylist" element={<DoctorCategoryListPage />} />
                                                        <Route path="shoppage" element={<ShopPageEdit />} />
                                                        <Route path="marketing" element={<AudienceMarketingPage />} />
                                                        <Route path="website-analytics" element={<WebsiteAnalyticsPage />} />
                                                    </Route>

                                                </Routes>
                                            </Suspense>
                                    </div>
                            </CheckoutProvider>
                        </CartProvider>
                    </WishlistProvider>
                    <LoginModal />
                </AuthProvider>
                    <Toast />
                    <FlyingElement />
                </FlyingElementProvider>
            </ToastProvider>
        </Router>
    );
}

export default App;
