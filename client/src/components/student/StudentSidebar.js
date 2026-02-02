import React from "react";
// ✅ Import Realistic (Color) Icons
import { 
  FcHome, 
  FcCalendar, 
  FcReading, 
  FcAdvertising, // Megaphone for Notices
  FcComments,    // Chat for Doubts
  FcMoneyTransfer, 
  FcSettings 
} from "react-icons/fc"; 
import { STATIC_BASE_URL } from "../../apiConfig"; // ✅ Imports http://localhost:5000 or your IP

const StudentSidebar = ({ user, activeTab, setActiveTab, resolvedQueries }) => {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FcHome size={22} /> },
    { id: "attendance", label: "Attendance", icon: <FcCalendar size={22} /> },
    { id: "courses", label: "My Courses", icon: <FcReading size={22} /> },
    { id: "notices", label: "Notices", icon: <FcAdvertising size={22} /> },
    { id: "doubts", label: "Academic Doubts", icon: <FcComments size={22} /> },
    { id: "fees", label: "Fee Payment", icon: <FcMoneyTransfer size={22} /> },
  ];

  // ✅ FIX: Construct the correct URL for server-stored images
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "/default-avatar.png"; // Fallback if DB is empty
    
    // If it's already a full URL (external link), use it
    if (photoPath.startsWith("http")) return photoPath;
    
    // ✅ Fix Windows paths: Convert 'uploads\image.jpg' to 'uploads/image.jpg'
    const cleanPath = photoPath.replace(/\\/g, "/");
    
    // ✅ Result: http://localhost:5000/uploads/image-123.jpg
    return `${STATIC_BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      
      {/* PROFILE SECTION */}
      <div className="pt-8 pb-4 px-8 flex flex-col items-center text-center">
        <div className="relative mb-4 group">
          <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
            {/* ✅ IMAGE FETCHING LOGIC */}
            <img 
              src={getPhotoUrl(user.photo)} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover bg-gray-100"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "/default-avatar.png"; // ✅ Fallback if server image is missing
              }}
            />
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
          {user.name}
        </h3>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-2 [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative border ${
              activeTab === item.id 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none translate-x-1" 
                : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-100 dark:hover:border-gray-600"
            }`}
          >
            {/* Icon */}
            <span className="text-xl drop-shadow-sm">
              {item.icon}
            </span>
            
            {/* Label */}
            <span className={`font-black text-xs uppercase tracking-wider ${activeTab === item.id ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
              {item.label}
            </span>
            
            {/* Badge for Doubts */}
            {item.id === "doubts" && resolvedQueries > 0 && activeTab !== "doubts" && (
               <span className="absolute right-4 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                 {resolvedQueries}
               </span>
            )}

            {activeTab === item.id && (
              <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
            activeTab === "settings" 
              ? "bg-gray-900 text-white shadow-lg" 
              : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FcSettings className="text-lg" /> Settings
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;