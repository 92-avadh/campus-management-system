import React from "react";

const TABS = {
  OVERVIEW: "overview",
  APPLICATIONS: "applications",
  USERS: "users",
  COURSES: "courses",
  NOTICES: "notices",
  SETTINGS: "settings"
};

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: TABS.OVERVIEW, label: "Overview", icon: "🏠" },
    { id: TABS.APPLICATIONS, label: "Admissions", icon: "📄" },
    { id: TABS.USERS, label: "Manage Users", icon: "👥" },
    { id: TABS.COURSES, label: "Courses", icon: "📚" },
    { id: TABS.NOTICES, label: "Notices", icon: "📢" }
  ];

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-full shadow-2xl z-20">
      
      {/* HEADER */}
      <div className="p-8 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
            A
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            ADMIN<span className="text-indigo-600">PANEL</span>
          </h2>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 font-bold text-sm transition ${
              activeTab === item.id
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* SETTINGS */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setActiveTab(TABS.SETTINGS)}
          className={`w-full p-3 rounded-2xl font-bold text-sm transition ${
            activeTab === TABS.SETTINGS
              ? "bg-gray-100 dark:bg-gray-800 text-indigo-600"
              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          ⚙️ Settings
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
