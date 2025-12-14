import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const Home = () => {
  const { scrollY } = useScroll();

  // Parallax controls
  const bgY = useTransform(scrollY, [0, 500], [0, 120]);
  const textY = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[80vh] overflow-hidden">

        {/* Parallax Background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')] bg-cover bg-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-red-900/70" />

        {/* Content */}
        <motion.div
          style={{ y: textY }}
          className="relative z-10 h-full flex items-center justify-center text-center px-6 text-white"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Excellence in <span className="text-red-300">Education</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-10 max-w-3xl mx-auto">
              Empowering students with knowledge, skills, and values.
            </p>

            <div className="space-x-4">
              <Link
                to="/about"
                className="bg-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg"
              >
                Read More
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-red-900 transition shadow-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="relative py-24 bg-gray-50">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-red-800 text-sm font-bold uppercase mb-2">
              Welcome Inside Campus
            </h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              A Legacy of Academic Excellence
            </h3>
            <p className="text-gray-800 text-lg mb-6">
              Our campus provides state-of-the-art facilities, world-class faculty,
              and a vibrant student community.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-red-600 mr-2 text-xl">✓</span>
                Certified & Experienced Faculty
              </li>
              <li className="flex items-center">
                <span className="text-red-600 mr-2 text-xl">✓</span>
                Modern Computer Labs & Library
              </li>
              <li className="flex items-center">
                <span className="text-red-600 mr-2 text-xl">✓</span>
                Strong Placement Support
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="h-[500px] rounded-xl shadow-2xl overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070"
              alt="Students"
              className="w-full h-full object-cover"
            />
          </motion.div>

        </div>
      </section>

      {/* ================= STATS ================= */}
      <motion.div
        className="bg-red-900 py-16 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["50+", "Courses"],
            ["200+", "Faculty"],
            ["5k+", "Students"],
            ["100%", "Support"],
          ].map(([value, label]) => (
            <div key={label}>
              <h4 className="text-5xl font-extrabold mb-2">{value}</h4>
              <p className="text-red-200 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
