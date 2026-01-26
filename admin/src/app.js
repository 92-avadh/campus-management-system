import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 
import ManageUsers from "./pages/ManageUsers"; // <--- ADD THIS IMPORT

function App() {
  const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        {/* ADD THE MANAGE USERS ROUTE HERE */}
        <Route 
          path="/manage-users" 
          element={
            <PrivateRoute>
              <ManageUsers />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;