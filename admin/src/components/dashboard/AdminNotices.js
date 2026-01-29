import React, { useState, useEffect } from "react";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target: "all" // Default target
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing notices
  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/notices");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Handle Form Submit
  const handleSendNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/api/admin/send-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ " + data.message);
        setFormData({ title: "", content: "", target: "all" }); // Reset form
        fetchNotices(); // Refresh list
      } else {
        alert("❌ Failed: " + data.message);
      }
    } catch (err) {
      alert("Error sending notice");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await fetch(`http://localhost:5000/api/admin/notice/${id}`, { method: "DELETE" });
      fetchNotices();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      
      {/* 1. CREATE NOTICE FORM */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 sticky top-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">📢 Broadcast Notice</h2>
          <form onSubmit={handleSendNotice} className="space-y-4">
            
            {/* Target Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="all">🌍 Everyone (All Users)</option>
                <option value="student">🎓 Students Only</option>
                <option value="faculty">👨‍🏫 Faculty Only</option>
              </select>
            </div>

            <input 
              type="text" 
              placeholder="Notice Title" 
              className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required 
            />
            
            <textarea 
              rows="5" 
              placeholder="Write your announcement here..." 
              className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            ></textarea>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Publish Notice 🚀"}
            </button>
          </form>
        </div>
      </div>

      {/* 2. NOTICE HISTORY LIST */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">Notice History</h2>
          
          {notices.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-500 dark:text-gray-400 font-bold">No notices posted yet.</p>
             </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {notices.map((notice) => (
                <div key={notice._id} className="group p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{notice.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                          notice.target === 'student' ? 'bg-red-100 text-red-700' :
                          notice.target === 'faculty' ? 'bg-blue-100 text-blue-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          To: {notice.target}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notice.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(notice._id)}
                      className="opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg text-xs font-bold transition"
                      title="Delete Notice"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminNotices;