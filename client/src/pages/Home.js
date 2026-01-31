import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ApplyModal from "../components/ApplyModal";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const Home = () => {
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/default-avatar.png"
            alt="University Campus"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-rose-900/40" />
        </div>

        {/* relative z-30 ensures buttons stay above the overlapping stats box */}
        <div className="relative z-30 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-white text-left max-w-2xl"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-rose-600/20 border border-rose-500/30 rounded-full backdrop-blur-md">
              Excellence in Education
            </motion.span>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
              Shape the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Future.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-300 mb-10 max-w-lg leading-relaxed font-light">
              Join a prestigious community where innovation meets tradition. Discover 
              a world-class learning environment designed for the leaders of tomorrow.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-5">
              <button
                onClick={() => setIsApplyOpen(true)}
                className="group relative z-40 bg-rose-600 text-white px-10 py-4 rounded-full font-bold transition-all hover:bg-rose-700 hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] active:scale-95"
              >
                Apply for 2026
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
              <Link 
                to="/courses" 
                className="relative z-40 bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-slate-950 transition-all active:scale-95"
              >
                Explore Courses
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />
      </section>

      {/* ================= STATS ROW (Floating Style) ================= */}
      {/* pointer-events-none ensures the invisible top margin doesn't block hero clicks */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-20 container mx-auto px-6 -mt-8 mb-16 pointer-events-none"
      >
        {/* pointer-events-auto restores clickability to the actual stats box */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 md:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 border border-slate-100 pointer-events-auto">
          {[
            ["50+", "Academic Programs"],
            ["200+", "World-Class Faculty"],
            ["5k+", "Success Stories"],
            ["98%", "Career Placement"],
          ].map(([value, label], idx) => (
            <div key={idx} className="text-center group">
              <h4 className="text-4xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">{value}</h4>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ================= NEWS & EVENTS ================= */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="max-w-xl">
              <h2 className="text-rose-600 text-sm font-black uppercase tracking-[0.3em] mb-4">University Pulse</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Latest News & Events</h3>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              { date: "Oct 24", title: "Convocation 2025", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800", desc: "Celebrating the academic achievements of our graduating batch." },
              { date: "Nov 02", title: "AI & Robotics Summit", img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800", desc: "Leading experts gather to discuss the next era of automation." },
              { date: "Nov 15", title: "Sports Championship", img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800", desc: "Our athletes prepare for the ultimate state-level finals." }
            ].map((news, i) => (
              <motion.div key={i} variants={fadeInUp} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
                <div className="overflow-hidden h-72 relative">
                  <img src={news.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-900">{news.date}</div>
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-tight mb-3">{news.title}</h4>
                  <p className="text-slate-600 text-sm font-light leading-relaxed">{news.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= RESEARCH HIGHLIGHT ================= */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 text-rose-400 font-black mb-6 tracking-[0.2em] uppercase text-xs">
                <span className="w-8 h-[2px] bg-rose-500"></span> Innovation Hub
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">Engineering <br /><span className="text-rose-500">Human Progress</span></h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">Representing the pinnacle of sustainable computing. We create technology.</p>
              <button className="bg-white text-slate-950 px-10 py-4 rounded-full font-bold hover:bg-rose-500 hover:text-white transition-all">Visit Lab</button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 aspect-video"
            >
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60" // Reliable Tech/Lab Image
                alt="Innovation Lab" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800"; // Fallback Image
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative bg-rose-950 rounded-[3rem] p-12 md:p-24 overflow-hidden text-center shadow-2xl"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to begin your journey?</h2>
            <p className="text-rose-200/70 text-lg mb-12 max-w-2xl mx-auto font-light">Admissions for the 2026 academic session are now open. Secure your spot today.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={() => setIsApplyOpen(true)} className="bg-rose-500 text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-rose-950 transition-all">Apply Now</button>
              <Link to="/contact" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-slate-950 transition-all">Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ApplyModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </div>
  );
};

export default Home;