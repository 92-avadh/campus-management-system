import React from "react";

const FacultySidebar = ({ user, activeTab, setActiveTab, handleLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "attendance", label: "Attendance", icon: "📷" },
    { id: "notices", label: "Notices", icon: "📢" },
    { id: "material", label: "Materials", icon: "📚" },
    { id: "queries", label: "Student Queries", icon: "❓" }
  ];

  return (
    <aside className="h-full flex flex-col bg-slate-900 text-white">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-wider">FACULTY<span className="text-blue-400">PORTAL</span></h2>
        
        {/* ✅ REMOVED First Letter Circle */}
        <div className="mt-6">
          <p className="font-bold text-sm">{user.name}</p>
          <p className="text-xs text-slate-400">{user.department}</p>
        </div>
      </div>

      {/* ✅ ADDED: overflow-y-auto [&::-webkit-scrollbar]:hidden */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 text-sm font-bold ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <span className="text-lg opacity-80">{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>

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