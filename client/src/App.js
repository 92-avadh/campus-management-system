import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop"; // ✅ 1. Import ScrollToTop

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Campus from "./pages/Campus";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

// --- PRIVATE ROUTE WRAPPER ---
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

// --- MAIN LAYOUT (Header & Footer) ---
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      {/* ✅ 2. Add ScrollToTop here (Inside Router, outside Routes) */}
      <ScrollToTop /> 

      <Routes>
        
        {/* PUBLIC PAGES (With Header/Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/campus" element={<Campus />} />
        </Route>

        {/* STUDENT DASHBOARD (No Main Header) */}
        <Route 
          path="/student-dashboard" 
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />

        {/* FACULTY DASHBOARD (No Main Header) */}
        <Route 
          path="/faculty-dashboard" 
          element={
            <PrivateRoute role="faculty">
              <FacultyDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;