import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
          {/* Modern Gradient Overlay (Darker on Right) */}
          <div className="absolute inset-0 bg-gradient-to-l from-red-900/95 via-red-900/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
          {/* Left Side Spacer */}
          <div className="hidden md:block"></div>

          {/* Right Side Content */}
          <div className="text-white text-left md:pl-10">
            <span className="bg-red-800 text-red-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-red-700">
              Welcome to SDJIC
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Ignite Your <br />
              <span className="text-red-300">Potential</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-lg leading-relaxed">
              Join a global community committed to academic excellence, innovation, and leadership. Your future begins here.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="bg-white text-red-900 px-8 py-3.5 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.39)]"
              >
                Explore Courses
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Visit Campus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWS & EVENTS (NEW) ================= */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-red-900 text-sm font-bold uppercase tracking-widest mb-2">Happening Now</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Latest News & Events</h3>
            </div>
            <Link to="/news" className="hidden md:block text-red-700 font-bold hover:underline">
              View All News →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 h-64">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070" 
                  alt="Convocation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase">Oct 24, 2025</span>
              <h4 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-red-700 transition-colors">
                Annual Convocation Ceremony 2025 Announced
              </h4>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                Celebrating the academic achievements of our graduating batch with Chief Guest Dr. R.K. Patel.
              </p>
            </div>

            {/* News Item 2 */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 h-64">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070" 
                  alt="Tech Seminar" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase">Nov 02, 2025</span>
              <h4 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-red-700 transition-colors">
                International Conference on AI & Robotics
              </h4>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                Leading experts from around the globe gather at SDJIC to discuss the future of automation.
              </p>
            </div>

            {/* News Item 3 */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 h-64">
                <img 
                  src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070" 
                  alt="Sports Meet" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase">Nov 15, 2025</span>
              <h4 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-red-700 transition-colors">
                Inter-College Sports Championship Finals
              </h4>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                Our cricket and football teams advance to the state finals. Come support the home team!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RESEARCH HIGHLIGHT (NEW) ================= */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-800/50 skew-x-12 transform translate-x-20"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-red-400 font-bold mb-4 tracking-wider uppercase text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Research & Innovation
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Pioneering the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Technology</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Our "NextGen Lab" recently secured a patent for sustainable energy computing. We believe in research that solves real-world problems.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">01.</span>
                  <div>
                    <strong className="text-white block">Student-Led Projects</strong>
                    <span className="text-gray-500 text-sm">Undergraduates publishing research papers.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">02.</span>
                  <div>
                    <strong className="text-white block">Global Partnerships</strong>
                    <span className="text-gray-500 text-sm">Collaborations with universities in UK & Canada.</span>
                  </div>
                </li>
              </ul>

              <button className="bg-red-700 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-all">
                Explore Research
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                 <img 
                  src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=2070" 
                  alt="Lab" 
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover mt-12"
                />
                 <img 
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070" 
                  alt="Research" 
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STUDENT VOICES (NEW) ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-red-900 text-sm font-bold uppercase tracking-widest mb-3">Student Voices</h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-16">Hear from our Community</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-red-500 text-4xl font-serif mb-4">“</div>
              <p className="text-gray-600 italic mb-6">
                "The faculty here doesn't just teach; they mentor. My experience in the Computer Science department has been nothing short of transformative."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" alt="Student" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Rahul Mehta</h5>
                  <span className="text-xs text-red-600 font-bold uppercase">BCA, Final Year</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-red-500 text-4xl font-serif mb-4">“</div>
              <p className="text-gray-600 italic mb-6">
                "The campus life is vibrant! From tech fests to cultural weeks, there is always something happening that helps us grow beyond books."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" alt="Student" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Priya Sharma</h5>
                  <span className="text-xs text-red-600 font-bold uppercase">B.Com, 2nd Year</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-red-500 text-4xl font-serif mb-4">“</div>
              <p className="text-gray-600 italic mb-6">
                "Placement support is excellent. I secured an internship in my second year thanks to the college's industry connections."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100" alt="Student" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Aditya Patel</h5>
                  <span className="text-xs text-red-600 font-bold uppercase">BBA, Alumni</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BANNER ================= */}
      <section className="bg-red-900 py-20 text-white border-t border-red-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-red-800/50">
            {[
              ["50+", "Courses Offered"],
              ["200+", "Expert Faculty"],
              ["5k+", "Happy Students"],
              ["98%", "Placement Rate"],
            ].map(([value, label], idx) => (
              <div key={idx} className="p-4">
                <h4 className="text-4xl md:text-5xl font-extrabold mb-2 text-white">{value}</h4>
                <p className="text-red-200 text-sm uppercase font-semibold tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION (NEW) ================= */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-20 -mt-20"></div>

            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to start your journey?</h2>
              <p className="text-gray-600 text-lg mb-8 md:mb-0">
                Admissions for the 2025-26 academic session are now open. Secure your spot today.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Link to="/apply" className="bg-red-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-800 transition-all text-center">
                Apply Now
              </Link>
              <Link to="/contact" className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all text-center">
                Download Brochure
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;