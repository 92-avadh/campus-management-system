import React from "react";

const StudentSidebar = ({ user, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: "🏠" },
    { id: "fees", label: "Tuition & Fees", icon: "💳" },
    { id: "courses", label: "My Academics", icon: "📚" },
    { id: "attendance", label: "Attendance", icon: "📷" }
  ];

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl relative overflow-hidden">
      
      {/* 1. PROFILE CARD */}
      <div className="p-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/30">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl font-black border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">{user.name}</h2>
              <p className="text-[10px] text-rose-100 font-medium opacity-90">{user.course}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center relative z-10">
             <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">ID Code</span>
             <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded text-white/90">{user.userId}</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="flex-1 px-4 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-5 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-4 group relative ${
              activeTab === item.id 
                ? "bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none translate-x-1" 
                : "text-gray-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-700/50 hover:text-rose-600"
            }`}
          >
            <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm">{item.label}</span>
            {activeTab === item.id && <span className="ml-auto w-2 h-2 bg-white rounded-full opacity-50"></span>}
          </button>
        ))}
      </nav>

      {/* 3. SETTINGS BUTTON (Treated as a Tab) */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab("settings")} // ✅ Switch Tab
          className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all border group ${
             activeTab === "settings"
               ? "bg-gray-100 dark:bg-gray-700 border-rose-300 dark:border-gray-500"
               : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
          }`}
        >
          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
             activeTab === "settings" ? "bg-rose-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 group-hover:text-rose-600"
          }`}>
            ⚙️
          </span>
          <div className="text-left">
            <p className={`text-xs font-bold ${activeTab === "settings" ? "text-rose-600" : "text-gray-800 dark:text-white"}`}>Profile & Settings</p>
            <p className="text-[10px] text-gray-400">Update Info & Password</p>
          </div>
        </button>
      </div>

    </aside>
  );
};

export default StudentSidebar;