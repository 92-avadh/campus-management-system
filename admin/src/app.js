import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 
import ManageUsers from "./pages/ManageUsers";

// Create a wrapper component to access useLocation
const AnimatedRoutes = () => {
  const location = useLocation();

  const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user ? children : <Navigate to="/" />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/manage-users" 
          element={
            <PrivateRoute>
              <ManageUsers />
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