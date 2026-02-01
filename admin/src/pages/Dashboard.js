import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

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

  // ✅ Persist active tab
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("adminActiveTab") || "overview";
  });

  const [adminUser, setAdminUser] = useState(undefined); // 👈 IMPORTANT
  const [loading, setLoading] = useState(true);

  // Mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ SAFE AUTH CHECK (never causes unmount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminUser");
      const parsed = raw ? JSON.parse(raw) : null;
      const resolvedUser = parsed?.user || parsed;

      if (!resolvedUser || resolvedUser.role !== "admin") {
        setAdminUser(null);
      } else {
        setAdminUser(resolvedUser);
      }
    } catch (err) {
      console.error("Admin session error:", err);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("adminActiveTab", tabId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminActiveTab");
    navigate("/");
  };

  /* ---------------- SAFE RENDER STATES ---------------- */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 font-bold">
        Loading dashboard...
      </div>
    );
  }

  if (adminUser === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-red-500 font-bold">
        <p>Session expired or unauthorized.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-red-500 text-white rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  /* ---------------- MAIN DASHBOARD ---------------- */

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col relative">
          <div className="md:hidden absolute top-4 right-4 z-50">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2">
              <FaTimes size={24} />
            </button>
          </div>

          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2"
            >
              <FaBars size={22} />
            </button>

            <div>
              <h2 className="text-xl md:text-2xl font-black capitalize">
                {activeTab}
              </h2>
              <p className="hidden md:block text-xs text-gray-400 uppercase">
                Admin Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="hidden md:block px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20">
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
