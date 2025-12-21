import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-red-800">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
             SDJIC
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Empowering the next generation of leaders through innovation, excellence, and a commitment to holistic education.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-red-400">Quick Links</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/courses" className="hover:text-white transition-colors">Courses</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-red-400">Portals</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="/student-login" className="hover:text-white transition-colors">Student Login</a></li>
            <li><a href="/faculty-login" className="hover:text-white transition-colors">Faculty Login</a></li>
            <li><a href="/admin" className="hover:text-white transition-colors">Admin Dashboard</a></li>
            <li><a href="/library" className="hover:text-white transition-colors">Library Access</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-red-400">Get in Touch</h4>
          <div className="space-y-4 text-sm text-gray-300">
            <p className="flex items-start">
              <span className="mr-3 text-red-500">📍</span> 
              Vesu Main Road, Surat, Gujarat 395007
            </p>
            <p className="flex items-center">
              <span className="mr-3 text-red-500">📞</span> 
              +91 98765 43210
            </p>
            <p className="flex items-center">
              <span className="mr-3 text-red-500">✉️</span> 
              info@sdjic.org
            </p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 pt-8 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} SDJ International College. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;