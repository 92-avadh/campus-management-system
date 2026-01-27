import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeePayment from "../components/FeePayment"; 
import ThemeToggle from "../components/ThemeToggle"; 

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
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
      if (userData.isFeePaid && userData.course) {
        // Use encodeURIComponent to handle spaces and brackets in course names
        const encodedCourse = encodeURIComponent(userData.course);
        fetch(`http://localhost:5000/api/courses/${encodedCourse}`)
          .then(res => res.json())
          .then(data => {
            if (data.subjects) {
              setSubjects(data.subjects);
            }
          })
          .catch(err => console.error("Error loading subjects:", err));
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-red-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo3.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tight">Student Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={handleLogout} 
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl font-bold transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 min-h-screen bg-white dark:bg-gray-800 shadow-xl p-6 hidden md:block">
          <div className="flex flex-col items-center mb-10 pb-6 border-b dark:border-gray-700">
            <div className="w-20 h-20 bg-red-100 text-red-700 rounded-3xl flex items-center justify-center text-3xl font-black mb-3">
              {user.name.charAt(0)}
            </div>
            <h2 className="font-bold text-gray-800 dark:text-white text-center">{user.name}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user.course}</p>
          </div>

          <nav className="space-y-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: "🏠" },
              { id: "fees", label: "Fee Payment", icon: "💳" },
              { id: "courses", label: "My Courses", icon: "📚" },
              { id: "attendance", label: "Attendance", icon: "📅" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
                  activeTab === item.id 
                    ? "bg-red-50 text-red-700 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Area */}
        <main className="flex-1 p-6 md:p-12">
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Enrollment</p>
                    <h3 className="text-2xl font-black text-red-700">{user.course}</h3>
                    <p className="text-sm text-gray-500 mt-4">University ID: <span className="font-mono font-bold text-gray-900 dark:text-white">{user.userId}</span></p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Financial Status</p>
                    <div className="flex items-center gap-3 mt-1">
                       <div className={`w-3 h-3 rounded-full ${user.isFeePaid ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                       <h3 className={`text-2xl font-black ${user.isFeePaid ? 'text-emerald-600' : 'text-red-700'}`}>
                          {user.isFeePaid ? "Fees Fully Paid" : "Payment Pending"}
                       </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Last verified: {new Date().toLocaleDateString()}</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
              {user.isFeePaid ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-2xl text-center border-t-[12px] border-emerald-500">
                   <div className="text-7xl mb-6">✅</div>
                   <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Everything is Clear!</h2>
                   <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium">Your academic fees for the current session have been successfully processed.</p>
                </div>
              ) : (
                <FeePayment 
                  studentId={user.userId} 
                  amount={5000} 
                  onPageRefresh={() => {
                    const updatedUser = { ...user, isFeePaid: true };
                    setUser(updatedUser);
                    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
                    // Re-fetch subjects immediately after payment
                    window.location.reload(); 
                  }} 
                />
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
               {user.isFeePaid ? (
                 <>
                   <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black dark:text-white tracking-tighter">Course Subjects</h2>
                      <span className="bg-red-100 text-red-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{user.course}</span>
                   </div>
                   {subjects.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub, idx) => (
                          <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center border border-transparent hover:border-red-200 transition-all group">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-800 dark:text-white">{sub}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Core Subject</p>
                            </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-center text-gray-500">No subjects found for this course.</p>
                   )}
                 </>
               ) : (
                 <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">Please complete your fee payment to unlock your academic subjects and materials.</p>
                 </div>
               )}
            </div>
          )}
          
          {activeTab === "attendance" && (
             <div className="p-20 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Attendance Module Coming Soon</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;