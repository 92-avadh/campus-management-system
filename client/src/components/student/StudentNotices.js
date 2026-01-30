import React, { useState, useEffect } from "react";

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [savedNotices, setSavedNotices] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'saved'

  // ✅ 1. FETCH NOTICES & LOAD BOOKMARKS
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/student/notices");
        const data = await res.json();
        setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching notices:", err);
      }
    };

    // Load bookmarks from Local Storage
    const saved = JSON.parse(localStorage.getItem("studentBookmarks")) || [];
    setSavedNotices(saved);
    
    fetchNotices();
  }, []);

  // ✅ 2. HANDLE BOOKMARK TOGGLE
  const toggleBookmark = (notice) => {
    let newSaved;
    const isAlreadySaved = savedNotices.some(n => n._id === notice._id);

    if (isAlreadySaved) {
      newSaved = savedNotices.filter(n => n._id !== notice._id);
    } else {
      newSaved = [...savedNotices, notice];
    }

    setSavedNotices(newSaved);
    localStorage.setItem("studentBookmarks", JSON.stringify(newSaved));
  };

  const displayList = activeTab === "all" ? notices : savedNotices;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Notice Board</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Updates from Faculty & Admin</p>
        </div>
        
        {/* TABS */}
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex">
          <button onClick={() => setActiveTab("all")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "all" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            📢 All Notices
          </button>
          <button onClick={() => setActiveTab("saved")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "saved" ? "bg-rose-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            ❤️ Saved ({savedNotices.length})
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-6">
        {displayList.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-400 font-bold">No notices found in this section.</p>
          </div>
        ) : (
          displayList.map((notice) => {
            const isSaved = savedNotices.some(n => n._id === notice._id);
            return (
              <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group relative overflow-hidden">
                
                {/* Decorative Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${notice.sender === "Admin" ? "bg-rose-500" : "bg-blue-500"}`}></div>

                <div className="flex justify-between items-start pl-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${notice.sender === "Admin" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>
                        {notice.sender || "Faculty"}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{notice.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                      {notice.content}
                    </p>
                  </div>

                  {/* BOOKMARK BUTTON */}
                  <button 
                    onClick={() => toggleBookmark(notice)}
                    className={`p-3 rounded-full transition-all ${isSaved ? "bg-rose-50 text-rose-500" : "bg-gray-50 text-gray-400 hover:text-rose-400"}`}
                    title={isSaved ? "Remove from Saved" : "Save for later"}
                  >
                    <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default StudentNotices;