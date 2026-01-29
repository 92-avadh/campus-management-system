import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard"; // ✅ Includes its own Sidebar
import FacultyDashboard from "./pages/FacultyDashboard"; // ✅ Includes its own Sidebar

// Simple Auth Check (Optional wrapper)
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page (No Sidebar) */}
        <Route path="/login" element={<Login />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Student Dashboard (Has its own Sidebar inside) */}
        <Route 
          path="/student-dashboard" 
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Faculty Dashboard (Has its own Sidebar inside) */}
        <Route 
          path="/faculty-dashboard" 
          element={
            <PrivateRoute role="faculty">
              <FacultyDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;