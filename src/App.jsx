import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./Dashboard"; 
import Homepage from "./pages/Homepage";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
// import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Attributes from "./pages/Attributes";
import Orders from "./pages/Orders";
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
              <Navigate to="/dashboard/home" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* Child routes inside dashboard */}
          <Route path="home" element={<Homepage user={user} />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
           <Route path="attributes" element={<Attributes />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="orders" element={<Orders />} />
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>

        {/* Redirect root → login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
