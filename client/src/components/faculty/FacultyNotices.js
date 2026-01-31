import React, { useState, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaBullhorn } from "react-icons/fa";

const FacultyNotices = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  // ✅ GET USER ID AND NAME
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const facultyName = user ? user.name : "Faculty";
  const facultyId = user ? user.id : null; // <--- We need this ID for the database

  // 1. Fetch Notices
  const fetchNotices = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/notices`);
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
    if (!facultyId) {
      alert("Error: User ID not found. Please re-login.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/add-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ SEND BOTH NAME (for Notice) AND ID (for Notification)
        body: JSON.stringify({ 
          ...formData, 
          target: "student", 
          postedBy: facultyName, 
          userId: facultyId 
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
      const res = await fetch(`http://localhost:5000/api/faculty/delete-notice/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchNotices();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Manage Notices</h2>
        <p className="text-gray-500 dark:text-gray-400">Post updates for all students.</p>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FaPaperPlane className="text-blue-600" /> Create New Notice
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text" required placeholder="Notice Title"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <textarea
            required placeholder="Write your message here..."
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 h-32 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Notice"}
            </button>
          </div>
        </form>
      </div>

      {/* NOTICE LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaBullhorn className="text-orange-500" /> Recent Notices
        </h3>
        {notices.length === 0 ? (
          <p className="text-gray-400 italic">No notices posted yet.</p>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start group transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    Students
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(notice.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-white">{notice.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-2 font-medium">Posted by: {notice.postedBy}</p>
              </div>
              <button 
                onClick={() => handleDelete(notice._id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                title="Delete Notice"
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

export default FacultyNotices;