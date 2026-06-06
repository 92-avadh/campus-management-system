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
    // If not logged in, redirect to the /login route (which handles kicking them back to port 3000)
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* ✅ ADDED: This catches the incoming redirect from the Client App (Port 3000) */}
        <Route path="/login" element={<Login />} />
        
        {/* Default route safely redirects straight to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
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