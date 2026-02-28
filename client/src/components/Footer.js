import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8 border-t-4 border-red-600 font-sans">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6 hover:opacity-90 transition-opacity">
            {/* Global College 'G' Shield Logo */}
            <div className="bg-white p-1.5 rounded-lg shadow-sm inline-block">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2L4 9V19C4 28.3 10.9 36.9 20 39C29.1 36.9 36 28.3 36 19V9L20 2Z" fill="#e11d48"/>
                <path d="M20 2L4 9V19C4 28.3 10.9 36.9 20 39V2Z" fill="#be123c"/>
                <path d="M25 14H16C14.9 14 14 14.9 14 16V24C14 25.1 14.9 26 16 26H24C25.1 26 26 25.1 26 24V19H19V21.5H23.5V23.5H16.5V16.5H25V14Z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wide leading-tight text-white">GLOBAL</span>
              <span className="text-[0.65rem] font-bold tracking-widest text-red-400">COLLEGE</span>
            </div>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
            Empowering the next generation of leaders through innovation, excellence, and a commitment to holistic education.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm text-slate-400 font-light">
            <li><Link to="/" className="hover:text-red-400 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-red-400 transition-colors">About Us</Link></li>
            <li><Link to="/courses" className="hover:text-red-400 transition-colors">Courses</Link></li>
            <li><Link to="/contact" className="hover:text-red-400 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Portals - FIXED LINKS */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Portals</h4>
          <ul className="space-y-3 text-sm text-slate-400 font-light">
            {/* All point to the single /login portal we created */}
            <li><Link to="/login" className="hover:text-red-400 transition-colors">Student Portal</Link></li>
            <li><Link to="/login" className="hover:text-red-400 transition-colors">Faculty Portal</Link></li>
            <li><Link to="/login" className="hover:text-red-400 transition-colors">Admin Dashboard</Link></li>
            <li><Link to="/campus" className="hover:text-red-400 transition-colors">Campus Facilities</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Get in Touch</h4>
          <div className="space-y-4 text-sm text-slate-400 font-light">
            <p className="flex items-start">
              <span className="mr-3 text-red-500">📍</span> 
              123 Education Boulevard, Innovation District, Tech City
            </p>
            <p className="flex items-center">
              <span className="mr-3 text-red-500">📞</span> 
              +1 (555) 123-4567
            </p>
            <p className="flex items-center">
              <span className="mr-3 text-red-500">✉️</span> 
              admissions@globalcollege.edu
            </p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/50 pt-8 text-center">
        <p className="text-slate-500 text-sm font-light">
          © {new Date().getFullYear()} Global College. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;