import React from "react";
import { 
  FaHome, FaUserGraduate, FaClipboardList, FaBullhorn, 
  FaBook, FaQuestionCircle, FaCog, FaSignOutAlt 
} from "react-icons/fa";
// ✅ 1. Import BASE_URL (the root server URL without /api)
import { BASE_URL } from "../../apiConfig";

const StudentSidebar = ({ user, activeTab, setActiveTab, handleLogout, resolvedQueries }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "attendance", label: "Attendance", icon: <FaUserGraduate /> },
    { id: "courses", label: "My Courses", icon: <FaClipboardList /> },
    { id: "notices", label: "Notices", icon: <FaBullhorn /> },
    { id: "fees", label: "Fee Payment", icon: <FaBook /> },
    { id: "doubts", label: "Academic Doubts", icon: <FaQuestionCircle /> },
  ];

  // ✅ 2. Helper to get the correct photo URL for Mobile & PC
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    
    // If it's already a full web link, use it
    if (photoPath.startsWith("http")) return photoPath;

    // Convert Windows backslashes to forward slashes
    const cleanPath = photoPath.replace(/\\/g, "/");
    
    // Prepend the Server IP (e.g., http://192.168.1.5:5000/uploads/photo.jpg)
    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      
      {/* PROFILE SECTION */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
        <div className="relative mb-4 group">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
            {/* ✅ 3. Updated Image Source */}
            <img 
              src={getPhotoUrl(user.photo)} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 bg-white"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
              }}
            />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        
        {/* User Info - Optimized for Mobile spacing */}
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-1 truncate w-full px-2">
          {user.name}
        </h3>
        <p className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          {user.course} Student
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group relative ${
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            <span className={`text-xl ${activeTab === item.id ? "animate-pulse" : ""}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
            
            {item.id === "doubts" && resolvedQueries > 0 && (
               <span className="absolute right-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                 {resolvedQueries}
               </span>
            )}
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
            activeTab === "settings" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <FaCog className="text-lg" /> Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-bold text-xs uppercase tracking-wider"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;