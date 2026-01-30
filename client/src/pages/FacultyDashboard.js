import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

// Sub-components
import FacultySidebar from "../components/faculty/FacultySidebar";
import FacultyOverview from "../components/faculty/FacultyOverview";
import FacultyAttendance from "../components/faculty/FacultyAttendance";
import FacultyNotices from "../components/faculty/FacultyNotices";
import FacultyMaterials from "../components/faculty/FacultyMaterials";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data States
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  
  useEffect(() => {
    const initDashboard = async () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      try {
        await Promise.all([
          fetchStudents(parsedUser.department),
          fetchSubjects(parsedUser.department),
          parsedUser._id || parsedUser.id ? fetchMyMaterials(parsedUser._id || parsedUser.id) : Promise.resolve()
        ]);
      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [navigate]);

  // --- DATA FETCHERS ---
  const fetchStudents = async (dept) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/students?department=${encodeURIComponent(dept)}`);
      const data = await res.json();
      setStudents(data);
    } catch (e) { console.error(e); }
  };
  const fetchSubjects = async (course) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${encodeURIComponent(course)}`);
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch (e) { console.error(e); }
  };
  const fetchMyMaterials = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/my-materials/${id}`);
      const data = await res.json();
      setMyMaterials(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    // ✅ FIXED: h-screen overflow-hidden removes outer scrollbar & whitespace
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 md:translate-x-0 md:static">
        <FacultySidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleLogout={handleLogout} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white capitalize tracking-tight">
              {activeTab === 'material' ? 'Study Materials' : activeTab === 'notices' ? 'Broadcast Notice' : activeTab === 'attendance' ? 'Smart Attendance' : 'Dashboard Overview'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Faculty Panel • {user.department} Dept.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            
            {/* ✅ LOGOUT BUTTON ADDED */}
            <button 
              onClick={handleLogout} 
              className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Content Area */}
        {/* ✅ ADDED: [&::-webkit-scrollbar]:hidden to hide scrollbar visuals */}
        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "dashboard" && <FacultyOverview user={user} students={students} materialsCount={myMaterials.length} />}
            {activeTab === "attendance" && <FacultyAttendance user={user} subjects={subjects} />}
            {activeTab === "notices" && <FacultyNotices />}
            {activeTab === "material" && <FacultyMaterials user={user} subjects={subjects} myMaterials={myMaterials} fetchMyMaterials={fetchMyMaterials} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;