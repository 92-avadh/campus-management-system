import React from "react";

const Footer = () => {
  return (
    <footer className="bg-red-900 text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <h4 className="text-xl font-bold mb-4">SDJ International College</h4>
          <p className="text-red-200 text-sm">
            Educating the next generation of leaders with innovation and excellence.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-red-200">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/login" className="hover:text-white">Student Login</a></li>
            <li><a href="/login" className="hover:text-white">Faculty Login</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Contact</h4>
          <p className="text-red-200 text-sm">📍 Vesu, Surat</p>
          <p className="text-red-200 text-sm">📞 +91 98765 43210</p>
          <p className="text-red-200 text-sm">✉️ info@sdjic.org</p>
        </div>

      </div>

      <div className="text-center text-sm text-red-300 mt-8 border-t border-red-800 pt-4">
        © 2025 SDJ International College. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
