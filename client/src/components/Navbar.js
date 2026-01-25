import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // SVG Icons
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <nav className="bg-red-900/95 backdrop-blur-md text-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-3 relative z-50 flex justify-between items-center">

        {/* Logo Section */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity" onClick={() => setIsOpen(false)}>
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
          <Link to="/campus" className="hover:text-red-200 transition-colors">CAMPUS</Link>
          <Link to="/contact" className="hover:text-red-200 transition-colors">CONTACT</Link>

          {/* Login Button */}
          <Link
            to="/login"
            className="px-6 py-2.5 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            LOGIN
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-red-200 focus:outline-none"
          >
            {isOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-red-900 border-t border-red-800 shadow-xl transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
          }`}
      >
        <div className="flex flex-col py-4 px-6 space-y-4 font-semibold">
          <Link to="/" className="block hover:text-red-200 border-b border-red-800 pb-2" onClick={() => setIsOpen(false)}>HOME</Link>
          <Link to="/about" className="block hover:text-red-200 border-b border-red-800 pb-2" onClick={() => setIsOpen(false)}>ABOUT</Link>
          <Link to="/courses" className="block hover:text-red-200 border-b border-red-800 pb-2" onClick={() => setIsOpen(false)}>COURSES</Link>
          <Link to="/campus" className="block hover:text-red-200 border-b border-red-800 pb-2" onClick={() => setIsOpen(false)}>CAMPUS</Link>
          <Link to="/contact" className="block hover:text-red-200 border-b border-red-800 pb-2" onClick={() => setIsOpen(false)}>CONTACT</Link>

          <Link
            to="/login"
            className="block w-full text-center mt-4 bg-white text-red-900 font-bold py-3 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            LOGIN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;