import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";

// Components
import StudentSidebar from "../components/student/StudentSidebar";
import StudentOverview from "../components/student/StudentOverview";
import StudentFees from "../components/student/StudentFees";
import StudentCourses from "../components/student/StudentCourses";
import StudentAttendance from "../components/student/StudentAttendance";
import StudentSettings from "../components/student/StudentSettings";
import StudentDoubts from "../components/student/StudentDoubts"; 
import StudentNotices from "../components/student/StudentNotices"; // ✅ IMPORTED

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initStudent = () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        navigate("/login");
      } else {
        setUser(JSON.parse(storedUser));
        setTimeout(() => setLoading(false), 600);
      }
    };
    initStudent();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleFeePaymentSuccess = () => {
    alert("Payment Recorded! Refreshing...");
    window.location.reload();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 relative">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden glass" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR WRAPPER */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <StudentSidebar user={user} activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        
        {/* HEADER */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          
          <div className="flex items-center gap-4">
            {/* Hamburger (Mobile) */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white capitalize tracking-tight truncate max-w-[200px] md:max-w-none">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'notices' ? 'Notice Board' : 
                 activeTab === 'fees' ? 'Tuition & Fees' : 
                 activeTab === 'courses' ? 'My Academics' : 
                 activeTab === 'attendance' ? 'Attendance' : 
                 activeTab === 'doubts' ? 'Query & Doubts' : 
                 'Settings'}
              </h1>
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                Welcome back, {user.name.split(' ')[0]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
             <NotificationBell studentId={user.id || user._id} />
             <ThemeToggle />
             <button onClick={handleLogout} className="hidden md:block bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-rose-100 dark:border-rose-900/30 shadow-sm">
              LOGOUT
            </button>
            <button onClick={handleLogout} className="md:hidden text-rose-600 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-8 pb-20">
            {activeTab === "dashboard" && <StudentOverview user={user} />}
            {activeTab === "notices" && <StudentNotices />} {/* ✅ RENDER COMPONENT */}
            {activeTab === "fees" && <StudentFees user={user} handlePaymentSuccess={handleFeePaymentSuccess} />}
            {activeTab === "courses" && <StudentCourses user={user} />}
            {activeTab === "attendance" && <StudentAttendance user={user} />}
            {activeTab === "settings" && <StudentSettings user={user} />}
            {activeTab === "doubts" && <StudentDoubts user={user} />} 
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;