import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminFoods from './admin/AdminFoods';
import AdminCategories from './admin/AdminCategories';
import AdminOffers from './admin/AdminOffers';
import AdminGallery from './admin/AdminGallery';
import AdminReviews from './admin/AdminReviews';
import AdminCustomers from './admin/AdminCustomers';
import AdminSettings from './admin/AdminSettings';
import AdminProfile from './admin/AdminProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <SocketProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#12372A',
                    color: '#FDFBF7',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#D4AF37',
                      secondary: '#12372A',
                    },
                  },
                }}
              />
              <Routes>
                {/* Customer Public Routes */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />
                  <Route path="/track-order/:orderNumber" element={<TrackOrderPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Protected Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="foods" element={<AdminFoods />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="offers" element={<AdminOffers />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="website-settings" element={<AdminSettings />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
              </Routes>
            </SocketProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
