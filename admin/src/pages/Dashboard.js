import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // ✅ Icons for mobile toggle

// ✅ Define API_BASE_URL (Ensure this matches your backend IP)
const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

// Sidebar & Sections
import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminOverview from "../components/dashboard/AdminOverview";
import AdminUsers from "../components/dashboard/AdminUsers";
import AdminCourses from "../components/dashboard/AdminCourses";
import AdminNotices from "../components/dashboard/AdminNotices";
import AdminApplications from "../components/dashboard/AdminApplications";
import AdminSettings from "../components/dashboard/AdminSettings";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✅ 1. Initialize Active Tab from Storage
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("adminActiveTab") || "overview";
  });

  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ 2. Mobile Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("adminUser"));
    if (!user) {
      navigate("/");
    } else {
      setAdminUser(user);
    }
    setLoading(false);
  }, [navigate]);

  // ✅ 3. Wrapper to Persist Tab & Close Sidebar on Mobile
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("adminActiveTab", tabId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminActiveTab");
    navigate("/");
  };

  if (loading) return null;
  if (!adminUser) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative">

      {/* ✅ 4. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ✅ 5. RESPONSIVE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
         <div className="h-full flex flex-col relative">
           {/* Mobile Close Button */}
           <div className="md:hidden absolute top-4 right-4 z-50">
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-rose-500 p-2">
               <FaTimes size={24} />
             </button>
           </div>

           <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          
          <div className="flex items-center gap-4">
            {/* ✅ 6. HAMBURGER BUTTON (Mobile Only) */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaBars size={24} />
            </button>

            <div>
              <h2 className="text-xl md:text-2xl font-black capitalize truncate">
                {activeTab}
              </h2>
              <p className="hidden md:block text-xs text-gray-400 font-mono mt-0.5 uppercase">Admin Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            
            {/* Desktop Logout */}
            <button 
              onClick={handleLogout} 
              className="hidden md:block px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              LOGOUT
            </button>
            
            {/* Mobile Logout Icon */}
            <button onClick={handleLogout} className="md:hidden p-2 text-rose-500">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "courses" && <AdminCourses />}
            {activeTab === "notices" && <AdminNotices />}
            {activeTab === "applications" && <AdminApplications />}
            {activeTab === "settings" && <AdminSettings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;