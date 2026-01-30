import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; 

// Components
import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminOverview from "../components/dashboard/AdminOverview";
import AdminApplications from "../components/dashboard/AdminApplications";
import AdminUsers from "../components/dashboard/AdminUsers";
import AdminCourses from "../components/dashboard/AdminCourses";
import AdminNotices from "../components/dashboard/AdminNotices"; 
import AdminSettings from "../components/dashboard/AdminSettings"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ studentCount: 0, facultyCount: 0, pendingApps: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Mobile State

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Stats fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold animate-pulse">Loading Administrator Panel...</p>
    </div>
  );

  return (
    // ✅ FIXED: h-screen overflow-hidden locks the outer window and prevents double scrollbars
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 relative">
      
      {/* ✅ MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* ✅ SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* ✅ MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10 transition-colors border-b dark:border-gray-700">
          
          <div className="flex items-center gap-4">
             {/* ✅ HAMBURGER FOR MOBILE */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white capitalize tracking-tight">
                {activeTab === "settings" ? "Settings" : activeTab === "users" ? "Manage Users" : activeTab.replace('-', ' ')}
              </h1>
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                Admin Panel • Welcome back, Administrator
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* DESKTOP LOGOUT */}
            <button 
              onClick={handleLogout} 
              className="hidden md:block bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
            >
              LOGOUT
            </button>
            
            {/* MOBILE LOGOUT */}
            <button onClick={handleLogout} className="md:hidden text-red-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* ✅ CONTENT AREA - Scrollable with HIDDEN scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "dashboard" && <AdminOverview stats={stats} />}
            {activeTab === "applications" && <AdminApplications />}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "courses" && <AdminCourses />}
            {activeTab === "notices" && <AdminNotices />}
            {activeTab === "settings" && <AdminSettings />} 
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;