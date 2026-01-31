import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";
import { FaBars, FaTimes } from "react-icons/fa"; // ✅ Icons for mobile menu
// ✅ 1. Import the dynamic URL helper
import { API_BASE_URL } from "../apiConfig"; 

// Components
import StudentSidebar from "../components/student/StudentSidebar";
import StudentOverview from "../components/student/StudentOverview";
import StudentFees from "../components/student/StudentFees";
import StudentCourses from "../components/student/StudentCourses";
import StudentAttendance from "../components/student/StudentAttendance";
import StudentSettings from "../components/student/StudentSettings";
import StudentDoubts from "../components/student/StudentDoubts"; 
import StudentNotices from "../components/student/StudentNotices"; 

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvedQueries, setResolvedQueries] = useState(0);

  // ✅ 2. Mobile Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);

  // ✅ 3. Persist Active Tab
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("activeTab") || "dashboard";
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("activeTab", tabId);
    setIsSidebarOpen(false); // Close menu on mobile after selection
  };

  /* =====================
     API CALLS (STABLE)
  ====================== */
  const fetchAttendance = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/student/attendance/${id}`);
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/student/notices`);
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, []);

  // ✅ FIX: Removed [user] dependency to stop the Infinite Loop
  const fetchResolvedCount = useCallback(async (studentId) => {
    if (!studentId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/student/my-doubts/${studentId}`);
      if (!res.ok) return;
      const data = await res.json();
      const count = Array.isArray(data) ? data.filter(q => q.status === "Resolved").length : 0;
      setResolvedQueries(count);
    } catch (err) { }
  }, []);

  /* =====================
     INIT DASHBOARD
  ====================== */
  useEffect(() => {
    let intervalId;
    const initStudent = async () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const userId = parsedUser._id || parsedUser.id;

      try {
        await Promise.all([
          fetchAttendance(userId),
          fetchNotices(),
          fetchResolvedCount(userId)
        ]);

        // ✅ Polling every 60s
        intervalId = setInterval(() => {
          fetchResolvedCount(userId);
        }, 60000);

      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initStudent();

    return () => { 
      if (intervalId) clearInterval(intervalId); 
    };
  }, [navigate, fetchAttendance, fetchNotices, fetchResolvedCount]); 

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("activeTab"); 
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans relative">
      
      {/* ✅ 4. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ✅ 5. SIDEBAR WRAPPER (Z-50 Fixes Cut-off Issue) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 
        md:relative md:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
         {/* Mobile Close Button */}
         <div className="md:hidden absolute top-4 right-4 z-50">
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-rose-500 p-2">
               <FaTimes size={24} />
             </button>
         </div>

         <StudentSidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            resolvedQueries={resolvedQueries} 
         />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative [&::-webkit-scrollbar]:hidden">
        
        {/* HEADER */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            
            {/* ✅ Hamburger Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaBars size={24} />
            </button>

            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white capitalize truncate max-w-[180px] md:max-w-none">
                {activeTab.replace("-", " ")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
             <NotificationBell studentId={user.id || user._id} />
             <ThemeToggle />
             {/* Desktop Logout */}
             <button onClick={handleLogout} className="hidden md:block bg-rose-50 text-rose-600 px-5 py-2.5 rounded-xl text-xs font-bold border border-rose-100">LOGOUT</button>
             {/* Mobile Logout Icon */}
             <button onClick={handleLogout} className="md:hidden text-rose-600 p-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-8 pb-20">
            {activeTab === "dashboard" && <StudentOverview user={user} attendance={attendance} notices={notices} />}
            {activeTab === "notices" && <StudentNotices notices={notices} />}
            {activeTab === "fees" && <StudentFees user={user} />}
            {activeTab === "courses" && <StudentCourses user={user} />}
            {activeTab === "attendance" && <StudentAttendance user={user} attendance={attendance} />}
            {activeTab === "settings" && <StudentSettings user={user} />}
            {activeTab === "doubts" && <StudentDoubts user={user} onDoubtCheck={() => fetchResolvedCount(user._id)} />} 
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;