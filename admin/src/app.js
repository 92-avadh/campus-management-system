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
    // Check for adminUser in localStorage (or sessionStorage if you changed it)
    const user = JSON.parse(localStorage.getItem("adminUser")); 
    return user ? children : <Navigate to="/" />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        
        {/* ✅ Dashboard now handles everything (Users, Courses, Admissions) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* ❌ REMOVED: /manage-users route (It's now a tab in Dashboard) */}
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