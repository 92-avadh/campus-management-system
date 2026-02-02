import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { FaBars, FaTimes } from "react-icons/fa"; 
import { API_BASE_URL } from "../apiConfig"; 

// Sidebar
import FacultySidebar from "../components/faculty/FacultySidebar";

// Components
import FacultyTimetable from "../components/faculty/FacultyTimetable";
import FacultyOverview from "../components/faculty/FacultyOverview";
import FacultyAttendance from "../components/faculty/FacultyAttendance";
import FacultyNotices from "../components/faculty/FacultyNotices";
import FacultyMaterials from "../components/faculty/FacultyMaterials";
import FacultyDoubts from "../components/faculty/FacultyDoubts";
import FacultySettings from "../components/faculty/FacultySettings";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingQueries, setPendingQueries] = useState(0);
  
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("activeTab") || "dashboard";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]); // ✅ This holds the subjects list
  const [myMaterials, setMyMaterials] = useState([]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("activeTab", tabId);
    setIsSidebarOpen(false);
  };

  /* =====================
     API CALLS
  ====================== */
  const fetchPendingCount = useCallback(async (facultyId) => {
    if (!facultyId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/doubts/${facultyId}`);
      if (!res.ok) return;
      const data = await res.json();
      const count = Array.isArray(data) ? data.filter(q => q.status === "Pending").length : 0;
      setPendingQueries(count);
    } catch (err) { }
  }, []);

  const fetchStudents = useCallback(async (dept) => {
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/students?department=${encodeURIComponent(dept)}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchSubjects = useCallback(async (course) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(course)}`);
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch (err) { console.error(err); }
  }, []);

  const fetchMyMaterials = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/my-materials/${id}`);
      const data = await res.json();
      setMyMaterials(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, []);

  /* =====================
     INIT DASHBOARD
  ====================== */
  useEffect(() => {
    let intervalId;
    const init = async () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      try {
        const userId = parsedUser._id || parsedUser.id;
        await Promise.all([
          fetchStudents(parsedUser.department),
          fetchSubjects(parsedUser.department),
          fetchMyMaterials(userId),
          fetchPendingCount(userId)
        ]);

        intervalId = setInterval(() => {
          fetchPendingCount(userId);
        }, 60000);

      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [navigate, fetchStudents, fetchSubjects, fetchMyMaterials, fetchPendingCount]); 

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("activeTab");
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col relative">
           <div className="md:hidden absolute top-4 right-4 z-50">
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-red-500 p-2">
               <FaTimes size={24} />
             </button>
           </div>

           <FacultySidebar
             user={user}
             activeTab={activeTab}
             setActiveTab={handleTabChange} 
             pendingQueries={pendingQueries}
           />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">

        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaBars size={24} />
            </button>

            <div>
              <h1 className="text-xl md:text-2xl font-black capitalize truncate max-w-[200px] md:max-w-none">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-1">
                Faculty Panel • {user.department} Dept.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <button 
              onClick={handleLogout} 
              className="hidden md:block px-5 py-2 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-all"
            >
              LOGOUT
            </button>
            <button onClick={handleLogout} className="md:hidden p-2 text-red-500">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "dashboard" && <FacultyOverview user={user} students={students} materialsCount={myMaterials.length} />}
            {activeTab === "attendance" && <FacultyAttendance user={user} subjects={subjects} />}
            
            {/* ✅ FIXED: Pass 'subjects' prop here */}
            {activeTab === "timetable" && <FacultyTimetable user={user} subjects={subjects} />} 
            
            {activeTab === "notices" && <FacultyNotices user={user} />}
            {activeTab === "material" && <FacultyMaterials user={user} subjects={subjects} myMaterials={myMaterials} fetchMyMaterials={() => fetchMyMaterials(user._id || user.id)} />}
            {activeTab === "queries" && <FacultyDoubts onDoubtResolved={() => fetchPendingCount(user._id || user.id)} />}
            {activeTab === "settings" && <FacultySettings user={user} />}
          </div>
        </section>

      </main>
    </div>
  );
};

export default FacultyDashboard;