import React, { useState, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaHistory, FaBullhorn } from "react-icons/fa";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "", target: "all" });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/add-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, postedBy: "Admin" })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Notice Broadcasted Successfully!");
        setFormData({ title: "", content: "", target: "all" }); // Reset form
        fetchNotices(); // Refresh list
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
    if (!window.confirm("Delete this notice?")) return;
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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white">Broadcast Notice</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Send important updates to the entire college or specific groups.</p>
      </div>

      {/* ✅ FORM SECTION (Now Full Width & Larger) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <FaPaperPlane className="text-indigo-600" /> Compose Message
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Title Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notice Title</label>
              <input
                type="text" required placeholder="Ex: Holiday Announcement"
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 dark:text-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Target Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <select
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 dark:text-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none cursor-pointer"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
              >
                <option value="all">📢 Everyone (Global)</option>
                <option value="student">🎓 Students Only</option>
                <option value="faculty">👨‍🏫 Faculty Only</option>
              </select>
            </div>
          </div>

          {/* Content Area (Maximized Height) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
            <textarea
              required placeholder="Type your detailed notice here..."
              className="w-full p-4 h-64 bg-gray-50 dark:bg-gray-900/50 dark:text-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none resize-none"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
            >
              {loading ? "Broadcasting..." : <><FaBullhorn /> Publish Notice</>}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ HISTORY SECTION (Under the Form) */}
      <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaHistory className="text-gray-400" /> Notice History
        </h3>

        {notices.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 font-bold text-lg">No notices found in history.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notices.map((notice) => (
              <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      notice.target === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                      notice.target === 'student' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                      {notice.target}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(notice.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white">{notice.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-4xl line-clamp-2">{notice.content}</p>
                </div>

                <button 
                  onClick={() => handleDelete(notice._id)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Notice"
                >
                  <FaTrash className="text-lg" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminNotices;