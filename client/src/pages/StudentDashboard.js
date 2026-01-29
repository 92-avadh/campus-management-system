import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";

// Sub-components
import StudentSidebar from "../components/student/StudentSidebar";
import StudentOverview from "../components/student/StudentOverview";
import StudentFees from "../components/student/StudentFees";
import StudentCourses from "../components/student/StudentCourses";
import StudentAttendance from "../components/student/StudentAttendance";
import StudentSettings from "../components/student/StudentSettings"; // ✅ Imported Settings

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initStudent = () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        navigate("/login");
      } else {
        setUser(JSON.parse(storedUser));
        // Simulate a smooth loading transition
        setTimeout(() => setLoading(false), 600);
      }
    };
    initStudent();
  }, [navigate]);

  // --- HANDLERS ---
  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleFeePaymentSuccess = () => {
    setLoading(true);
    const updatedUser = { ...user, isFeePaid: true };
    setUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setTimeout(() => window.location.reload(), 1000);
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Loading Portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. SIDEBAR (Fixed Width w-72) */}
      <div className="w-72 h-full hidden md:block relative z-20 shadow-xl">
        <StudentSidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* TOP HEADER */}
        <header className="px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div>
             <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight capitalize">
               {activeTab === 'dashboard' ? `Hello, ${user.name.split(' ')[0]}!` : activeTab.replace('-', ' ')}
             </h1>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Portal • {user.department}</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Online</span>
            </div>

            {/* Icons Area */}
            <div className="flex items-center gap-2">
               {/* Bell Icon */}
               <NotificationBell studentId={user.id || user._id} />
               {/* Theme Toggle */}
               <ThemeToggle />
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* DYNAMIC CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">
            
            {activeTab === "dashboard" && <StudentOverview user={user} />}
            
            {activeTab === "fees" && (
              <StudentFees user={user} handlePaymentSuccess={handleFeePaymentSuccess} />
            )}
            
            {activeTab === "courses" && <StudentCourses user={user} />}
            
            {activeTab === "attendance" && <StudentAttendance user={user} />}
            
            {/* ✅ Settings Page (Full Screen) */}
            {activeTab === "settings" && <StudentSettings user={user} />}

          </div>
        </main>

      </div>
    </div>
  );
};

export default StudentDashboard;