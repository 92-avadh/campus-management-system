import React from "react";
import { STATIC_BASE_URL } from "../../apiConfig";

const StudentSidebar = ({ user, activeTab, setActiveTab, resolvedQueries }) => {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "timetable", label: "Timetable", icon: "🕒" }, 
    { id: "courses", label: "My Courses", icon: "📚" },
    { id: "notices", label: "Notices", icon: "📢" },
    { id: "doubts", label: "Academic Doubts", icon: "❓" },
    { id: "fees", label: "Fee Payment", icon: "💳" },
  ];

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "/default-avatar.png"; 
    if (photoPath.startsWith("http")) return photoPath;
    let cleanPath = photoPath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!cleanPath.startsWith("uploads/")) {
        cleanPath = `uploads/${cleanPath}`;
    }
    return `${STATIC_BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-2xl transition-colors duration-300 relative overflow-hidden">
      
      {/* 🔹 DECORATIVE BACKGROUND BLOB */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none" />

      {/* 🔹 HEADER SECTION */}
      <div className="relative pt-10 pb-6 px-6 text-center z-10">
        
        {/* Profile Image with Gradient Ring */}
        <div className="relative inline-block group mb-2">
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-orange-400 shadow-lg">
            <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-900">
              <img 
                src={getPhotoUrl(user.photo)} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  if (e.target.src.includes("default-avatar.png")) return;
                  e.target.onerror = null; 
                  e.target.src = "/default-avatar.png"; 
                }}
              />
            </div>
          </div>
          {/* Status Indicator (Static - No Blink) */}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
        </div>
        
        {/* Full Name Only */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
          {user.name}
        </h3>
      </div>

      {/* 🔹 NAVIGATION MENU */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-2 py-4 [&::-webkit-scrollbar]:hidden relative z-10">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]" 
                  : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {/* Icon (Always Colorful - Removed grayscale) */}
              <span className={`text-xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              
              {/* Label */}
              <span className="font-bold text-sm tracking-wide">
                {item.label}
              </span>
              
              {/* Notification Badge */}
              {item.id === "doubts" && resolvedQueries > 0 && !isActive && (
                 <span className="absolute right-4 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                   {resolvedQueries}
                 </span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full blur-[1px]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 🔹 FOOTER */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 z-10">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
            activeTab === "settings" 
              ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 shadow-lg" 
              : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <span className="text-base">⚙️</span> Settings
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;