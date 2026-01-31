import React from "react";

const FacultySidebar = ({ user, activeTab, setActiveTab, pendingQueries }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "attendance", label: "Attendance", icon: "📷" },
    { id: "notices", label: "Notices", icon: "📢" },
    { id: "material", label: "Materials", icon: "📚" },
    { id: "queries", label: "Student Queries", icon: "❓" }
  ];

  return (
    <aside className="h-full flex flex-col bg-slate-900 text-white">
      {/* HEADER SECTION */}
      <div className="p-8 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-6">
           {/* ✅ ADDED: 'F' Logo Circle */}
           <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/50">
             F
           </div>
           <h2 className="text-xl font-bold tracking-wider leading-none">
             FACULTY<br/><span className="text-blue-400">PORTAL</span>
           </h2>
        </div>
        
        <div>
          <p className="font-bold text-sm text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.department}</p>
        </div>
      </div>

      {/* MENU ITEMS */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 text-sm font-bold ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <span className="text-lg opacity-80">{item.icon}</span> 
            <span className="flex-1">{item.label}</span>
            
            {/* ✅ Red Notification Dot */}
            {item.id === "queries" && pendingQueries > 0 && (
               <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                 {pendingQueries}
               </span>
            )}
          </button>
        ))}
      </nav>

      {/* SETTINGS (Logout Removed) */}
      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${activeTab === "settings" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
        >
          ⚙️ Settings
        </button>
      </div>
    </aside>
  );
};

export default FacultySidebar;