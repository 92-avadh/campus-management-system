import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const ApplyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "BCA (Computer Applications)",
    dob: "",       // Added missing field
    gender: "Male", // Added missing field
    address: "",    // Added missing field
    percentage: "",
  });
  
  const [photo, setPhoto] = useState(null);
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "photo") setPhoto(e.target.files[0]);
    if (e.target.name === "marksheet") setMarksheet(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (photo) data.append("photo", photo);
    if (marksheet) data.append("marksheet", marksheet);

    try {
      const response = await axios.post(`http://localhost:5000/api/applications/apply`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "Application Submitted!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100" >
          <div className="bg-rose-950 p-8 text-white relative">
            <h2 className="text-3xl font-black tracking-tighter">Start Your Journey</h2>
            <button onClick={onClose} className="absolute top-6 right-8 text-rose-200 hover:text-white transition-colors">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" onChange={handleChange} required placeholder="Full Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none" />
              <input name="email" type="email" onChange={handleChange} required placeholder="Email Address" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none" />
            </div>

            {/* Phone & Percentage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="phone" onChange={handleChange} required placeholder="Phone Number" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none" />
              <input name="percentage" type="number" onChange={handleChange} required placeholder="12th Percentage" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none" />
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Date of Birth</label>
                <input name="dob" type="date" onChange={handleChange} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Gender</label>
                <select name="gender" onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Course & Address */}
            <select name="course" onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none">
              <option>BCA (Computer Applications)</option>
              <option>BBA (Business Administration)</option>
              <option>B.Com (Commerce)</option>
            </select>

            <textarea name="address" onChange={handleChange} required placeholder="Residential Address" rows="2" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none transition-all"></textarea>

            {/* Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-rose-300 relative">
                <input type="file" name="photo" onChange={handleFileChange} required className="absolute inset-0 opacity-0 cursor-pointer" />
                <p className="text-xs font-bold text-slate-400 uppercase">{photo ? photo.name : "Upload Photo"}</p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-rose-300 relative">
                <input type="file" name="marksheet" onChange={handleFileChange} required className="absolute inset-0 opacity-0 cursor-pointer" />
                <p className="text-xs font-bold text-slate-400 uppercase">{marksheet ? marksheet.name : "12th Marksheet"}</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-rose-600 text-white rounded-full font-black text-lg hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/20">
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplyModal;