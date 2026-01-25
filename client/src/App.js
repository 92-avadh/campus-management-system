import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Campus from "./pages/Campus"; 
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

const Layout = () => {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  
  // Smoothing the scroll progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const hideNavRoutes = ["/student-dashboard", "/faculty-dashboard"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      {/* 🚀 SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-rose-600 z-[100] origin-left"
        style={{ scaleX }}
      />

      {!shouldHideNav && <Navbar />}
      
      {/* 🎭 ANIMATED PAGE WRAPPER */}
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/campus" element={<Campus />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>

      {!shouldHideNav && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}

export default App;