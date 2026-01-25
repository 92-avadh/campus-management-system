import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeePayment from "../components/FeePayment"; 
import ThemeToggle from "../components/ThemeToggle"; 

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // New State for Subjects
  const [subjects, setSubjects] = useState([]);

  // 1. Check Login & Fetch Subjects
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // ONLY Fetch subjects if Fee is Paid
      if (userData.isFeePaid) {
        fetch(`http://localhost:5000/api/courses/${userData.course}`)
          .then(res => res.json())
          .then(data => {
            if (data.subjects) setSubjects(data.subjects);
          })
          .catch(err => console.error("Error loading subjects:", err));
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-red-900 dark:bg-black text-white flex flex-col shadow-2xl sticky top-0 h-screen z-20 transition-colors">
        <div className="p-6 border-b border-red-800 dark:border-gray-800">
          <h2 className="text-2xl font-bold tracking-wider">STUDENT<br/><span className="text-red-300 text-lg">PANEL</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["dashboard", "subjects", "attendance", "fees"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center capitalize
                ${activeTab === tab ? "bg-white text-red-900 font-bold" : "hover:bg-red-800 dark:hover:bg-gray-800 text-red-100"}`}
            >
              {tab === "fees" ? "💳 Fee Payment" : 
               tab === "subjects" ? "📚 My Subjects" : 
               tab === "attendance" ? "📅 Attendance" : "📊 Dashboard"}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-red-800 dark:border-gray-800">
          <button onClick={handleLogout} className="w-full bg-red-800 hover:bg-red-700 dark:bg-gray-800 dark:hover:bg-gray-700 py-3 rounded text-sm font-bold shadow-inner transition">LOGOUT</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        
        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 transition-colors border-b dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Welcome, {user.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{user.course} | {user.userId}</p>
          </div>
          <div className="flex items-center gap-6">
             <ThemeToggle />
             <div className="flex items-center gap-3 border-l pl-6 dark:border-gray-600">
               <span className="text-right text-xs font-bold text-red-900 dark:text-red-400 hidden md:block">SDJ INTERNATIONAL<br/>COLLEGE</span>
               <img src="/logo.png" alt="Logo" className="h-12 w-auto bg-white rounded shadow-sm border p-1" />
            </div>
          </div>
        </header>

        <div className="p-8">
          
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center transition-colors">
                  <div className="w-24 h-24 bg-red-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white dark:border-gray-600 shadow-sm">🎓</div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.course} Student</p>
                  <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm">
                     <p className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">ID:</span> <span className="font-bold">{user.userId}</span></p>
                     <p className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Fee Status:</span> <span className={user.isFeePaid ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{user.isFeePaid ? "PAID" : "PENDING"}</span></p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                 {/* IF FEE IS PAID -> SHOW SUBJECTS WIDGET */}
                 {user.isFeePaid ? (
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-green-500 transition-colors">
                      <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800 dark:text-white">
                        <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">📚</span>
                        Your {user.course} Subjects
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {subjects.map((sub, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-600">
                            📖 {sub}
                          </div>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
                      <h3 className="text-red-700 dark:text-red-400 font-bold text-lg">⚠️ Subjects Locked</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Please pay your admission fees to view your course subjects and start your classes.</p>
                   </div>
                 )}

                 <FeePayment user={user} />
              </div>
            </div>
          )}

          {/* 2. SUBJECTS TAB (Detailed View) */}
          {activeTab === "subjects" && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors">
               {user.isFeePaid ? (
                 <>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 Course Curriculum: {user.course}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {subjects.map((sub, idx) => (
                        <div key={idx} className="flex items-center p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border hover:border-red-300 dark:hover:border-red-500 transition shadow-sm">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center font-bold text-xl mr-4">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{sub}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Core Subject</p>
                          </div>
                        </div>
                      ))}
                   </div>
                 </>
               ) : (
                 <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Content Locked</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Complete your fee payment to access course materials.</p>
                 </div>
               )}
            </div>
          )}
          
          {/* Other Tabs */}
          {activeTab === "attendance" && <div className="p-10 bg-white dark:bg-gray-800 rounded-2xl shadow text-center dark:text-white">Attendance Module Coming Soon</div>}
          {activeTab === "fees" && <div className="max-w-2xl mx-auto"><FeePayment user={user} /></div>}

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;