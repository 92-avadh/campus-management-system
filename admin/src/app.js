import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop"; // <--- ADD THIS IMPORT
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 

function App() {
  // Simple check for login
  const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <ScrollToTop /> {/* <--- ADD THIS HERE */}
      
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
      </Routes>
    </Router>
  );
}

export default App;