import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 

// Wrapper for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();

  const PrivateRoute = ({ children }) => {
    // Check for adminUser in localStorage
    const user = JSON.parse(localStorage.getItem("adminUser")); 
    // ✅ Redirect unauthenticated users to /login instead of /
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ✅ Catch both root and /login paths so the token URL matches */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;