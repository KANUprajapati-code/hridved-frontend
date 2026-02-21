import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { ToastProvider } from './context/ToastContext';
import { FlyingElementProvider } from './context/FlyingElementContext';
import Toast from './components/Toast';
import FlyingElement from './components/FlyingElement';





import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ShippingPage from './pages/ShippingPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutAddressPage from './pages/CheckoutAddressPage';
import CheckoutShippingPage from './pages/CheckoutShippingPage';
import CheckoutPaymentPage from './pages/CheckoutPaymentPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderPage from './pages/OrderPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';
import DoctorConsultation from './pages/DoctorConsultation';
import DoctorBookingPage from './pages/DoctorBookingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import AboutUsPage from './pages/AboutUsPage';
import FshipTestPage from './pages/FshipTestPage';

import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';

import ProductListPage from './pages/admin/ProductListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import OrderListPage from './pages/admin/OrderListPage';

import UserListPage from './pages/admin/UserListPage';
// import BlogListPage from './pages/admin/BlogListPage';
// import BlogEditPage from './pages/admin/BlogEditPage';
import ContactListPage from './pages/admin/ContactListPage';
import HomePageEdit from './pages/admin/HomePageEdit';
import DoctorListPage from './pages/admin/DoctorListPage';
import DoctorEditPage from './pages/admin/DoctorEditPage';
import BlogListPage from './pages/admin/BlogListPage';
import BlogEditPage from './pages/admin/BlogEditPage';
import TipListPage from './pages/admin/TipListPage';
import TipEditPage from './pages/admin/TipEditPage';
import AboutEditPage from './pages/admin/AboutEditPage';
import PromoCodeListPage from './pages/admin/PromoCodeListPage';
import PromoCodeEditPage from './pages/admin/PromoCodeEditPage';








import ScrollToTop from './components/ScrollToTop';

import MainLayout from './components/MainLayout';

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
                                        </Route>
                                    </Routes>
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
