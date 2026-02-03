import React, { useState } from "react";
import { FaUpload, FaFileAlt, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig";

const FacultyMaterials = ({ user, subjects, myMaterials, fetchMyMaterials }) => {
  // ✅ Default to "BCA", but allow changing it
  const [formData, setFormData] = useState({ title: "", course: "BCA", subject: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !formData.subject) return alert("Please select a file and subject");

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("course", formData.course); // ✅ Sends selected course
    data.append("subject", formData.subject);
    data.append("uploadedBy", user._id || user.id);
    data.append("material", file);

    try {
      const res = await fetch(`${API_BASE_URL}/faculty/upload-material`, {
        method: "POST",
        body: data, 
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Material Uploaded!");
        setFormData({ ...formData, title: "" }); // Keep course/subject selected for faster uploads
        setFile(null);
        fetchMyMaterials();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await fetch(`${API_BASE_URL}/faculty/material/${id}`, { method: "DELETE" });
      fetchMyMaterials();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <FaUpload className="text-blue-600" /> Upload Material
        </h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          
          {/* 1. TITLE */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Title</label>
            <input 
              required 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="e.g. Unit 1 Notes"
            />
          </div>

          {/* 2. COURSE SELECTOR (NEW) */}
          <div>
             <label className="text-xs font-bold text-gray-400 uppercase ml-1">Course</label>
             <select 
               required
               value={formData.course}
               onChange={(e) => setFormData({...formData, course: e.target.value})}
               className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
             >
               <option value="BCA">BCA</option>
               <option value="BBA">BBA</option>
               <option value="BCOM">BCOM</option>
             </select>
          </div>

          {/* 3. SUBJECT SELECTOR */}
          <div>
             <label className="text-xs font-bold text-gray-400 uppercase ml-1">Subject</label>
             <select 
               required
               value={formData.subject}
               onChange={(e) => setFormData({...formData, subject: e.target.value})}
               className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
             >
               <option value="">Select Subject</option>
               {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
             </select>
          </div>

          {/* 4. FILE INPUT */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
            <input 
              type="file" 
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-gray-400">
                {file ? (
                    <span className="text-green-600 font-bold text-sm">{file.name}</span>
                ) : (
                    <>
                        <FaFileAlt className="mx-auto text-2xl mb-2" />
                        <span className="text-xs font-bold">Click to Attach PDF/Doc</span>
                    </>
                )}
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">My Uploads</h3>
        {myMaterials.length === 0 ? (
            <p className="text-gray-400 italic">No materials uploaded yet.</p>
        ) : (
            myMaterials.map((m) => (
                <div key={m._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <FaFileAlt size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{m.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {m.course} • {m.subject} • {new Date(m.uploadDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleDelete(m._id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition"
                        title="Delete File"
                    >
                        <FaTrash />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default FacultyMaterials;