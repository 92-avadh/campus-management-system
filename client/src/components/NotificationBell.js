import React, { useState, useEffect, useCallback } from "react"; 
import { API_BASE_URL } from "../apiConfig"; // ✅ Import dynamic URL

const NotificationBell = ({ studentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ 1. FETCH NOTIFICATIONS (Auto-Refreshes)
  const fetchNotifications = useCallback(async () => {
    if (!studentId) return;
    try {
      // ✅ FIX: Use API_BASE_URL instead of localhost
      const res = await fetch(`${API_BASE_URL}/notifications/notifications/${studentId}`);
      const data = await res.json();
      
      const notifs = data.notifications || (Array.isArray(data) ? data : []);
      setNotifications(notifs);
      
      // Calculate unread count
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(data.count || unread);

    } catch (error) {
      console.error("Notification error:", error);
    }
  }, [studentId]);

  // ✅ 2. MARK ALL AS READ
  const markAllAsRead = async () => {
    if (!studentId || unreadCount === 0) return;
    try {
      await fetch(`${API_BASE_URL}/notifications/notifications/read-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      setUnreadCount(0); 
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const toggleMenu = () => {
    if (!isOpen) {
      markAllAsRead(); 
    }
    setIsOpen(!isOpen);
  };

  // ✅ 3. POLLING: Refresh every 3 seconds (No page reload needed)
  useEffect(() => {
    fetchNotifications(); 
    const interval = setInterval(fetchNotifications, 3000); 
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="relative">
      {/* BELL ICON */}
      <button 
        onClick={toggleMenu}
        className="relative p-2 rounded-xl transition-all duration-300 
                   text-gray-600 hover:bg-rose-50 hover:text-rose-600 
                   dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          {/* ✅ UI FIX: 'fixed' positioning ensures it appears ON TOP of everything on mobile */}
          <div className="
              fixed top-16 right-4 left-4 z-50 
              sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-80 sm:mt-2
              bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden 
              animate-in fade-in slide-in-from-top-2 origin-top-right
          ">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              ) : (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Caught up</span>
              )}
            </div>
            
            {/* List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n._id || n.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-bold group-hover:text-rose-600 transition-colors line-clamp-1">
                        {n.title || n.text}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">
                  No new notifications.
                </div>
              )}
            </div>
            
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;