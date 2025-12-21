import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-red-900/95 backdrop-blur-md text-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo Section */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="SDJ International College" 
            className="h-16 w-auto object-contain bg-white rounded-lg shadow-sm" 
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
          <Link to="/" className="hover:text-red-200 transition-colors">HOME</Link>
          <Link to="/about" className="hover:text-red-200 transition-colors">ABOUT</Link>
          <Link to="/courses" className="hover:text-red-200 transition-colors">COURSES</Link>
          <Link to="/campus" className="hover:text-red-200 transition-colors">CAMPUS</Link> {/* <--- NEW TAB */}
          <Link to="/contact" className="hover:text-red-200 transition-colors">CONTACT</Link>

          {/* Login Button */}
          <Link
            to="/login"
            className="px-6 py-2.5 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            LOGIN
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;