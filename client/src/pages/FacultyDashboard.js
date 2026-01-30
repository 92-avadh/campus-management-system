import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

// Sidebar
import FacultySidebar from "../components/faculty/FacultySidebar";

// Dashboard Sections
import FacultyOverview from "../components/faculty/FacultyOverview";
import FacultyAttendance from "../components/faculty/FacultyAttendance";
import FacultyNotices from "../components/faculty/FacultyNotices";
import FacultyMaterials from "../components/faculty/FacultyMaterials";

// Pages
import FacultyDoubts from "../components/faculty/FacultyDoubts";
import FacultySettings from "../components/faculty/FacultySettings";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);

  /* =====================
     INIT DASHBOARD
  ====================== */
  useEffect(() => {
    const init = async () => {
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
          fetchMyMaterials(parsedUser._id || parsedUser.id),
        ]);
      } catch (err) {
        console.error("Dashboard Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  /* =====================
     API CALLS
  ====================== */
  const fetchStudents = async (dept) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/faculty/students?department=${encodeURIComponent(dept)}`
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (course) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${encodeURIComponent(course)}`
      );
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyMaterials = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/faculty/my-materials/${id}`
      );
      const data = await res.json();
      setMyMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================
     LOGOUT
  ====================== */
  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  /* =====================
     LOADER
  ====================== */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">Loading Faculty Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white dark:bg-gray-800 shadow-xl fixed inset-y-0 left-0 z-50 md:static">
        <FacultySidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight capitalize">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "attendance" && "Smart Attendance"}
              {activeTab === "notices" && "Broadcast Notice"}
              {activeTab === "material" && "Study Materials"}
              {activeTab === "queries" && "Student Queries"}
              {activeTab === "settings" && "Account Settings"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Faculty Panel • {user.department} Dept.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <section className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {activeTab === "dashboard" && (
              <FacultyOverview
                user={user}
                students={students}
                materialsCount={myMaterials.length}
              />
            )}

            {activeTab === "attendance" && (
              <FacultyAttendance user={user} subjects={subjects} />
            )}

            {activeTab === "notices" && <FacultyNotices />}

            {activeTab === "material" && (
              <FacultyMaterials
                user={user}
                subjects={subjects}
                myMaterials={myMaterials}
                fetchMyMaterials={fetchMyMaterials}
              />
            )}

            {activeTab === "queries" && <FacultyDoubts />}

            {activeTab === "settings" && <FacultySettings />}

          </div>
        </section>

      </main>
    </div>
  );
};

export default FacultyDashboard;
