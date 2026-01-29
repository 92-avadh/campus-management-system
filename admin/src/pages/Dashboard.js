import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; 

// Components
import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminOverview from "../components/dashboard/AdminOverview";
import AdminApplications from "../components/dashboard/AdminApplications";
import AdminUsers from "../components/dashboard/AdminUsers";
import AdminCourses from "../components/dashboard/AdminCourses";
import AdminNotices from "../components/dashboard/AdminNotices"; // ✅ Import

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ studentCount: 0, facultyCount: 0, pendingApps: 0 });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header with Theme Toggle */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-6 flex justify-between items-center sticky top-0 z-10 transition-colors border-b dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white capitalize tracking-tight">
              {activeTab === "users" ? "Manage Users" : activeTab === "applications" ? "Admissions" : activeTab}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
               A
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {activeTab === "dashboard" && <AdminOverview stats={stats} />}
          {activeTab === "applications" && <AdminApplications />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "courses" && <AdminCourses />}
          {activeTab === "notices" && <AdminNotices />} {/* ✅ Render */}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;