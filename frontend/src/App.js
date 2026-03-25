import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><p className="text-gold font-serif text-xl">Loading...</p></div>;
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-obsidian text-ivory font-sans">
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.2)', color: '#FFFFF0' },
            }}
          />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/booking" element={<PublicLayout><BookingPage /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
              <Route path="/reviews" element={<PublicLayout><ReviewsPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
