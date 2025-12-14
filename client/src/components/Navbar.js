import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold">
          SDJ International College 🎓
        </Link>

        <div className="hidden md:flex space-x-8 items-center text-sm font-medium">
          <Link to="/" className="hover:text-red-200">HOME</Link>
          <Link to="/about" className="hover:text-red-200">ABOUT</Link>
          <Link to="/courses" className="hover:text-red-200">COURSES</Link>
          <Link to="/contact" className="hover:text-red-200">CONTACT</Link>

          <Link
            to="/login"
            className="px-6 py-2 bg-white text-red-900 font-bold rounded-full hover:bg-gray-100 transition shadow-md"
          >
            LOGIN
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
