import React from "react";

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: "📊" },
    { id: "applications", label: "Admissions", icon: "📝" },
    { id: "users", label: "Manage Users", icon: "👥" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "notices", label: "Notices", icon: "📢" } // ✅ Added this line
  ];

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen sticky top-0 shadow-2xl z-20 transition-colors duration-300">
      <div className="p-8 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">A</div>
            <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">ADMIN<span className="text-indigo-600 dark:text-indigo-400">PANEL</span></h2>
         </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center gap-4 font-bold text-sm ${
              activeTab === item.id 
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 py-4 rounded-2xl text-sm font-black transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;