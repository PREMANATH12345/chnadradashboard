import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./Dashboard"; 
import Homepage from "./pages/Homepage";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
import VendorRegister from "./pages/VendorRegister";
import Categories from "./pages/Categories";
import Attributes from "./pages/Attributes";
import Orders from "./pages/Orders";
import EnquiryPage from "./pages/Enquire";
import Reviews from "./pages/reviews";
import Blogs from "./pages/blogs";
import Faqs from "./pages/Faq";
import TargetAudience from "./pages/TargetAudience";
import Features from "./pages/Features";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isVendor = user?.role?.toLowerCase() === "vendor";

  // Protected Route Component
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/dashboard/products" />;
    }
    
    return children;
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            padding: "14px 18px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 500,
          },
          success: {
            style: {
              background: "#E8FBE8",
              color: "#0B7A0B",
              borderLeft: "6px solid #0B7A0B",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            },
            iconTheme: {
              primary: "#0B7A0B",
              secondary: "#E8FBE8",
            },
          },
          error: {
            style: {
              background: "#FFECEC",
              color: "#C81616",
              borderLeft: "6px solid #C81616",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            },
            iconTheme: {
              primary: "#C81616",
              secondary: "#FFECEC",
            },
          },
        }}
      />
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              isVendor ? (
                <Navigate to="/dashboard/products" />
              ) : (
                <Navigate to="/dashboard/home" />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        >
          {/* Admin-only routes */}
          <Route
            path="home"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Homepage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="enquiry"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EnquiryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="attributes"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Attributes />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="blogs"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Blogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="faqs"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Faqs />
              </ProtectedRoute>
            }
          />
             <Route
            path="feature"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Features />
              </ProtectedRoute>
            }
          />
             <Route
            path="target"
            element={
              <ProtectedRoute requireAdmin={true}>
                <TargetAudience />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="reviews"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="vendorRegister"
            element={
              <ProtectedRoute requireAdmin={true}>
                <VendorRegister />
              </ProtectedRoute>
            }
          />

          {/* Shared route (both admin and vendor) */}
          <Route path="products" element={<Products />} />
        </Route>

        {/* Redirect root based on role */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              isVendor ? (
                <Navigate to="/dashboard/products" />
              ) : (
                <Navigate to="/dashboard/home" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;