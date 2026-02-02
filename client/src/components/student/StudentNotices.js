import React, { useState, useEffect, useCallback } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig"; // Suggesting using your config if available, otherwise fallback is below

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [savedNotices, setSavedNotices] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 
  
  // Get Current User ID
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const studentId = user ? (user.id || user._id) : null; 

  // ✅ 1. FETCH DATA (Wrapped in useCallback to fix warning)
  const fetchData = useCallback(async () => {
    if (!studentId) return;

    try {
      // Use config or construct dynamic URL
      const baseUrl = typeof API_BASE_URL !== 'undefined' 
        ? API_BASE_URL 
        : `${window.location.protocol}//${window.location.hostname}:5000`;

      // Fetch All Public Notices
      const noticeRes = await fetch(`${baseUrl}/student/notices`);
      const noticeData = await noticeRes.json();
      setNotices(Array.isArray(noticeData) ? noticeData : []);

      // Fetch User Profile (to get Bookmarks)
      const profileRes = await fetch(`${baseUrl}/student/profile/${studentId}`);
      const profileData = await profileRes.json();
      if (profileData.bookmarks) {
        setSavedNotices(profileData.bookmarks);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [studentId]); // ✅ Depends on studentId

  // ✅ 2. EFFECT: INITIAL FETCH + AUTO-POLLING
  useEffect(() => {
    fetchData(); // Run immediately

    const intervalId = setInterval(() => {
      fetchData(); 
    }, 5000); 

    // Cleanup
    return () => clearInterval(intervalId);
  }, [fetchData]); // ✅ dependency added (fetchData is now stable thanks to useCallback)

  // ✅ 3. HANDLE BOOKMARK TOGGLE
  const toggleBookmark = async (notice) => {
    const originalId = notice.noticeId || notice._id; 
    const baseUrl = typeof API_BASE_URL !== 'undefined' 
        ? API_BASE_URL 
        : `${window.location.protocol}//${window.location.hostname}:5000`;

    try {
      const res = await fetch(`${baseUrl}/student/toggle-bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, noticeId: originalId })
      });
      
      const data = await res.json();
      if (data.success) {
        setSavedNotices(data.bookmarks); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Bookmark Error:", err);
    }
  };

  const displayList = activeTab === "all" ? notices : savedNotices;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Notice Board</h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Live Updates enabled</p>
          </div>
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
            const currentId = notice.noticeId || notice._id;
            const isSaved = savedNotices.some(n => n.noticeId === currentId);
            const author = notice.sender || notice.postedBy || "Faculty";
            const dateStr = notice.date || notice.createdAt || new Date(); 

            return (
              <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group relative overflow-hidden">
                
                {/* Decorative Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${author === "Admin" ? "bg-rose-500" : "bg-blue-500"}`}></div>

                <div className="flex justify-between items-start pl-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${author === "Admin" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>
                        {author}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {new Date(dateStr).toLocaleDateString()}
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
                    className="focus:outline-none transition-transform active:scale-90"
                    title={isSaved ? "Remove from Saved" : "Save for later"}
                  >
                    {isSaved ? (
                        <FaBookmark className="text-blue-600 text-xl" />
                    ) : (
                        <FaRegBookmark className="text-gray-400 text-xl hover:text-blue-600" />
                    )}
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