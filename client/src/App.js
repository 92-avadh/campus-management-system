import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Campus from "./pages/Campus";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard"; // <--- IMPORT THIS

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/campus" element={<Campus />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} /> {/* <--- ADD THIS ROUTE */}
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;