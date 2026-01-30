import React, { useState, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaBullhorn } from "react-icons/fa";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  // Get Admin Session Data
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const adminName = user ? user.name : "Admin";
  const adminId = user ? (user._id || user.id) : null;

  // 1. Fetch Notices
  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/notices");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) {
      alert("Error: User ID not found. Please re-login.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/add-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          target: "student", 
          postedBy: adminName, 
          userId: adminId 
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Notice Posted!");
        setFormData({ title: "", content: "" }); 
        fetchNotices(); 
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-notice/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchNotices();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    // ✅ Adjusted to 'max-w-4xl' for Medium size
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Campus Notices</h2>
        <p className="text-gray-500 dark:text-gray-400">Broadcast important updates to students and faculty.</p>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <FaPaperPlane className="text-blue-600" /> Create New Notice
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Subject Line</label>
            <input
              type="text" required placeholder="Enter notice title..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Message Content</label>
            <textarea
              required placeholder="Type your detailed message here..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 h-40"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaBullhorn className="text-orange-500" /> Published Notices
        </h3>
        {notices.length === 0 ? (
          <p className="text-gray-400 italic">No notices have been posted yet.</p>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start group">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {notice.target || "All"}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(notice.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{notice.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-4 font-semibold uppercase tracking-wider">Author: {notice.postedBy}</p>
              </div>
              <button 
                onClick={() => handleDelete(notice._id)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminNotices;