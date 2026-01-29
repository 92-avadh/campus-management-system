import React, { useState } from "react";

const FacultyMaterials = ({ user, subjects, myMaterials, fetchMyMaterials }) => {
  const [form, setForm] = useState({ title: "", subject: "", file: null });
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("course", user.department);
    formData.append("subject", form.subject);
    formData.append("uploadedBy", user._id || user.id);
    formData.append("material", form.file);

    try {
      await fetch("http://localhost:5000/api/faculty/upload-material", { method: "POST", body: formData });
      setForm({ title: "", subject: "", file: null });
      fetchMyMaterials(user._id || user.id);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(`http://localhost:5000/api/faculty/delete-material/${id}`, { method: "DELETE" });
      fetchMyMaterials(user._id || user.id);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. UPLOAD FORM (Full Width & Spacious) */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-xl border border-blue-50 dark:border-blue-900/20 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Upload Study Material</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Share notes, assignments, and resources with your students.</p>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title Input */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">File Title</label>
              <input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                placeholder="Ex: Unit 1 - Introduction to Java" 
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800 dark:text-white placeholder-gray-400 transition-all" 
                required 
              />
            </div>

            {/* Subject Select */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
              <div className="relative">
                <select 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})} 
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800 dark:text-white appearance-none cursor-pointer" 
                  required
                >
                  <option value="">Select a Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>

            {/* File Input (Full Width) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attachment</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors bg-gray-50 dark:bg-gray-700/30 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-300 font-bold">
                    {form.file ? (
                      <span className="text-blue-600 dark:text-blue-400">{form.file.name}</span>
                    ) : (
                      <span className="group-hover:text-blue-600 transition-colors">Click to upload document (PDF, DOCX, PPT)</span>
                    )}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={e => setForm({...form, file: e.target.files[0]})} required />
              </label>
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2">
              <button 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Publish Material 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. RECENT UPLOADS (Underneath & Clean List) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 px-2">Recent Uploads</h3>
        
        {myMaterials.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            No materials uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Row (Optional, for clarity) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-5">File Name</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* List Items */}
            {myMaterials.map((m) => (
              <div key={m._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group">
                
                {/* File Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center text-lg shadow-sm">
                    📄
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {m.title}
                  </span>
                </div>

                {/* Subject */}
                <div className="col-span-4">
                  <span className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
                    {m.subject}
                  </span>
                </div>

                {/* Time/Date */}
                <div className="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                  {new Date(m.uploadDate).toLocaleDateString()} 
                  <span className="hidden lg:inline text-gray-400 font-normal ml-1">
                    {new Date(m.uploadDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {/* Delete Action */}
                <div className="col-span-1 text-center">
                  <button 
                    onClick={() => handleDelete(m._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete File"
                  >
                    🗑️
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FacultyMaterials;