import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { ToastProvider } from './context/ToastContext';
import { FlyingElementProvider } from './context/FlyingElementContext';
import Toast from './components/Toast';
import FlyingElement from './components/FlyingElement';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './components/MainLayout';

// Lazy loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const PlaceOrderPage = lazy(() => import('./pages/PlaceOrderPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutAddressPage = lazy(() => import('./pages/CheckoutAddressPage'));
const CheckoutShippingPage = lazy(() => import('./pages/CheckoutShippingPage'));
const CheckoutPaymentPage = lazy(() => import('./pages/CheckoutPaymentPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DoctorConsultation = lazy(() => import('./pages/DoctorConsultation'));
const DoctorBookingPage = lazy(() => import('./pages/DoctorBookingPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const FshipTestPage = lazy(() => import('./pages/FshipTestPage'));

const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductListPage = lazy(() => import('./pages/admin/ProductListPage'));
const ProductEditPage = lazy(() => import('./pages/admin/ProductEditPage'));
const OrderListPage = lazy(() => import('./pages/admin/OrderListPage'));
const UserListPage = lazy(() => import('./pages/admin/UserListPage'));
const ContactListPage = lazy(() => import('./pages/admin/ContactListPage'));
const HomePageEdit = lazy(() => import('./pages/admin/HomePageEdit'));
const DoctorListPage = lazy(() => import('./pages/admin/DoctorListPage'));
const DoctorEditPage = lazy(() => import('./pages/admin/DoctorEditPage'));
const BlogListPage = lazy(() => import('./pages/admin/BlogListPage'));
const BlogEditPage = lazy(() => import('./pages/admin/BlogEditPage'));
const TipListPage = lazy(() => import('./pages/admin/TipListPage'));
const TipEditPage = lazy(() => import('./pages/admin/TipEditPage'));
const AboutEditPage = lazy(() => import('./pages/admin/AboutEditPage'));
const PromoCodeListPage = lazy(() => import('./pages/admin/PromoCodeListPage'));
const PromoCodeEditPage = lazy(() => import('./pages/admin/PromoCodeEditPage'));
const CategoryListPage = lazy(() => import('./pages/admin/CategoryListPage'));
const CategoryEditPage = lazy(() => import('./pages/admin/CategoryEditPage'));

// Loading Fallback
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

function App() {
    return (
        <Router>
            <ToastProvider>
                <FlyingElementProvider>
                    <ScrollToTop />
                    <AuthProvider>
                        <CartProvider>
                            <CheckoutProvider>
                                <AnimatePresence mode="wait">
                                    <Suspense fallback={<LoadingFallback />}>
                                        <Routes>
                                            {/* Public Routes with Header & Footer */}
                                            <Route element={<MainLayout />}>
                                                <Route path="/" element={<HomePage />} />
                                                <Route path="/shop" element={<ShopPage />} />
                                                <Route path="/product/:id" element={<ProductPage />} />

                                                <Route path="/cart" element={<CartPage />} />

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
                                                <Route path="/consultation" element={<DoctorConsultation />} />
                                                <Route path="/doctor/:doctorId/book" element={<DoctorBookingPage />} />
                                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                                <Route path="/return-policy" element={<ReturnPolicy />} />
                                                <Route path="/about" element={<AboutUsPage />} />
                                                <Route path="/test/fship" element={<FshipTestPage />} />
                                            </Route>

                                            {/* Admin Routes - Separate Layout */}
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
                                            </Route>
                                        </Routes>
                                    </Suspense>
                                </AnimatePresence>
                            </CheckoutProvider>
                        </CartProvider>
                    </AuthProvider>
                    <Toast />
                    <FlyingElement />
                </FlyingElementProvider>
            </ToastProvider>
        </Router>
    );
}

export default App;
