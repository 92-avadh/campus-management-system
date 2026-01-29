import React, { useState, useEffect, useCallback } from "react"; // ✅ Import useCallback

const NotificationBell = ({ studentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ FIX: Wrap function in useCallback so it doesn't get re-created on every render
  const fetchNotifications = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/student/notifications/${studentId}`);
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.count);
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  }, [studentId]); // ✅ Only re-create if studentId changes

  // ✅ AUTO-REFRESH LOGIC
  useEffect(() => {
    fetchNotifications(); // 1. Fetch immediately on load

    const interval = setInterval(() => {
      fetchNotifications(); // 2. Fetch every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // 3. Cleanup on unmount
  }, [fetchNotifications]); // ✅ Added 'fetchNotifications' to dependency array

  return (
    <div className="relative">
      {/* 🔔 BELL ICON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all duration-300 
                   text-gray-600 hover:bg-rose-50 hover:text-rose-600 
                   dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* DYNAMIC RED DOT */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
        )}
      </button>

      {/* 📂 DROPDOWN MENU */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              ) : (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">All caught up</span>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-bold group-hover:text-rose-600 transition-colors">{n.subject}</p>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.text}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">
                  No new notifications.
                </div>
              )}
            </div>
            
            {unreadCount > 0 && (
               <div className="p-3 bg-gray-50 dark:bg-gray-700/30 text-center">
                 <button className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors">View All Materials</button>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;