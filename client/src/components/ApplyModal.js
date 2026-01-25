import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Ensure axios is installed in your client folder

const ApplyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "BCA (Computer Applications)",
    percentage: "",
  });
  const [photo, setPhoto] = useState(null);
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Using FormData to handle file uploads
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("course", formData.course);
    data.append("percentage", formData.percentage);
    if (photo) data.append("photo", photo);
    if (marksheet) data.append("marksheet", marksheet);

    try {
      // POST to your studentRoutes endpoint
      await axios.post("http://localhost:5000/api/applications/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Application Submitted Successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="bg-rose-950 p-8 text-white">
            <h2 className="text-3xl font-black">Start Your Journey</h2>
            <button onClick={onClose} className="absolute top-6 right-8 text-rose-200 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" onChange={handleChange} required placeholder="Full Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-rose-500" />
              <input name="email" type="email" onChange={handleChange} required placeholder="Email Address" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-rose-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="phone" onChange={handleChange} required placeholder="Phone Number" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-rose-500" />
              <input name="percentage" type="number" onChange={handleChange} required placeholder="12th Percentage" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-rose-500" />
            </div>

            <select name="course" onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none">
              <option>BCA (Computer Applications)</option>
              <option>BBA (Business Administration)</option>
              <option>B.Com (Commerce)</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                <input type="file" onChange={(e) => setPhoto(e.target.files[0])} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer text-xs font-bold text-slate-500 uppercase">
                  {photo ? photo.name : "Upload Photo"}
                </label>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                <input type="file" onChange={(e) => setMarksheet(e.target.files[0])} className="hidden" id="marksheet-upload" />
                <label htmlFor="marksheet-upload" className="cursor-pointer text-xs font-bold text-slate-500 uppercase">
                  {marksheet ? marksheet.name : "12th Marksheet"}
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-rose-600 text-white rounded-full font-black text-lg hover:bg-rose-700 transition-all">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplyModal;