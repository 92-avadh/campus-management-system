import React from "react";

const FacultySidebar = ({ user, activeTab, setActiveTab, handleLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "notices", label: "Notices", icon: "📢" },
    { id: "material", label: "Materials", icon: "📂" }
  ];

  return (
    <aside className="h-full flex flex-col bg-slate-900 text-white">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-wider">FACULTY<span className="text-blue-400">PORTAL</span></h2>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm">{user.name}</p>
            <p className="text-xs text-slate-400">{user.department}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
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
        <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider">
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default FacultySidebar;