import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeePayment from "../components/FeePayment"; 
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  /* ============================
     1️⃣ LOAD USER (ONCE)
  ============================ */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, [navigate]);

  /* ============================
     2️⃣ FETCH SUBJECTS (FIXED)
  ============================ */
  useEffect(() => {
    if (user?.isFeePaid && user?.course) {
      const normalizedCourse = user.course.includes("BCA") ? "BCA" : user.course;
      const encodedCourse = encodeURIComponent(normalizedCourse);

      fetch(`http://localhost:5000/api/courses/${encodedCourse}`)
        .then(res => res.json())
        .then(data => {
          if (data.subjects) {
            setSubjects(data.subjects);
          }
        })
        .catch(err => console.error("Error loading subjects:", err));
    }
  }, [user?.course, user?.isFeePaid]);

  /* ============================
     3️⃣ FETCH MATERIALS
  ============================ */
  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setLoadingMaterials(true);

    try {
      const encodedCourse = encodeURIComponent(
        user.course.toUpperCase().trim()
      );
      const encodedSubject = encodeURIComponent(subject);

      const response = await fetch(
        `http://localhost:5000/api/student/materials/${encodedCourse}/${encodedSubject}`
      );

      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  /* ============================
     4️⃣ DOWNLOAD MATERIAL
  ============================ */
  const handleDownloadMaterial = async (materialId) => {
    try {
      await fetch(
        `http://localhost:5000/api/student/view-material/${materialId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: user._id })
        }
      );

      window.open(
        `http://localhost:5000/api/student/download/${materialId}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error downloading material:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleFeePaymentSuccess = () => {
    const updatedUser = { ...user, isFeePaid: true };
    setUser(updatedUser);
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    window.location.reload();
  };

  if (!user) return null;

  /* ============================
     ⬇️ UI BELOW IS UNCHANGED
  ============================ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* NAVBAR */}
      <nav className="bg-red-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo3.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tight">Student Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && user._id && <NotificationBell studentId={user._id} />}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl font-bold"
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
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedSubject(null);
                }}
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
                  onPageRefresh={handleFeePaymentSuccess} 
                />
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              {user.isFeePaid ? (
                <>
                  {/* Subject List View */}
                  {!selectedSubject && (
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
                      <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black dark:text-white tracking-tighter">Course Subjects</h2>
                        <span className="bg-red-100 text-red-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{user.course}</span>
                      </div>
                      {subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subjects.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSubjectClick(sub)}
                              className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center border border-transparent hover:border-red-200 dark:hover:border-red-700 transition-all group cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:scale-110 transition-transform">
                                {idx + 1}
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{sub}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Click to view materials</p>
                              </div>
                              <div className="text-red-600 dark:text-red-400 text-xl">→</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">No subjects found for this course.</p>
                      )}
                    </div>
                  )}

                  {/* Materials View */}
                  {selectedSubject && (
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <button 
                            onClick={() => setSelectedSubject(null)}
                            className="text-red-600 dark:text-red-400 font-bold mb-2 hover:underline flex items-center gap-2"
                          >
                            ← Back to Subjects
                          </button>
                          <h2 className="text-3xl font-black dark:text-white tracking-tighter">{selectedSubject}</h2>
                          <p className="text-sm text-gray-500 mt-1">Study Materials & Resources</p>
                        </div>
                      </div>

                      {loadingMaterials ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                          <p className="text-gray-500 mt-4">Loading materials...</p>
                        </div>
                      ) : materials.length > 0 ? (
                        <div className="space-y-4">
                          {materials.map((material) => (
                            <div 
                              key={material._id} 
                              className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                                    {material.title}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>📄 {material.fileName}</span>
                                    <span>•</span>
                                    <span>👤 {material.uploadedBy?.name || 'Faculty'}</span>
                                    <span>•</span>
                                    <span>📅 {new Date(material.uploadDate).toLocaleDateString()}</span>
                                  </div>
                                  {material.isNewForStudents && (
                                    <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDownloadMaterial(material._id)}
                                  className="ml-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2"
                                >
                                  <span>📥</span> Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <div className="text-6xl mb-6">📚</div>
                          <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">No Materials Yet</h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                            Your faculty hasn't uploaded any materials for this subject yet. Check back soon!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">Please complete your fee payment to unlock your academic subjects and materials.</p>
                  </div>
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