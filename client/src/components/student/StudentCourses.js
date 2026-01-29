import React, { useState, useEffect } from "react";

const StudentCourses = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Initial Fetch
  useEffect(() => {
    if (user?.isFeePaid && user?.course) {
      const normalizedCourse = user.course.includes("BCA") ? "BCA" : user.course;
      fetch(`http://localhost:5000/api/courses/${encodeURIComponent(normalizedCourse)}`)
        .then((res) => res.json())
        .then((data) => { if (data.subjects) setSubjects(data.subjects); })
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Fetch Materials
  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setLoadingMaterials(true);
    try {
      const response = await fetch(`http://localhost:5000/api/student/materials/${encodeURIComponent(user.course.toUpperCase().trim())}/${encodeURIComponent(subject)}`);
      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) { setMaterials([]); } 
    finally { setLoadingMaterials(false); }
  };

  // Download Logic
  const handleDownload = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/student/view-material/${id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: user.id || user._id })
      });
      window.open(`http://localhost:5000/api/student/download/${id}`, "_blank");
    } catch (e) { console.error(e); }
  };

  // ✅ VIBRANT COLORS: Increased opacity (100/200) for Light Mode
  const colors = [
    // Orange
    "bg-orange-100 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800/50 dark:text-orange-300",
    // Violet
    "bg-violet-100 border-violet-200 text-violet-900 dark:bg-violet-900/20 dark:border-violet-800/50 dark:text-violet-300",
    // Emerald
    "bg-emerald-100 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300",
    // Blue
    "bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300",
    // Rose
    "bg-rose-100 border-rose-200 text-rose-900 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-300",
  ];

  if (!user.isFeePaid) return (
    <div className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-lg text-center border-2 border-red-100 dark:border-gray-700">
      <div className="text-5xl mb-4 grayscale opacity-50">🔒</div>
      <h2 className="text-xl font-black text-gray-800 dark:text-white">Content Locked</h2>
      <p className="text-gray-500 mt-2 text-sm">Clear fees to access subjects.</p>
    </div>
  );

  return (
    <div className="min-h-[500px]">
      {!selectedSubject ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">My Subjects</h2>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((sub, idx) => {
                const themeClass = colors[idx % colors.length];
                return (
                  <button 
                    key={idx} 
                    onClick={() => handleSubjectClick(sub)} 
                    className={`group relative p-6 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left ${themeClass}`}
                  >
                    <div className="flex justify-between items-start">
                       <h4 className="font-black text-lg pr-4 leading-tight">{sub}</h4>
                       <span className="text-4xl font-black opacity-10 absolute top-4 right-4">
                         {(idx + 1).toString().padStart(2, '0')}
                       </span>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                      <span>View Files</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <p className="text-gray-500">No subjects found.</p>}
        </div>
      ) : (
        <div className="animate-in fade-in">
          <button onClick={() => setSelectedSubject(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-rose-600 transition-colors">
            <span className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm">←</span> Back
          </button>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{selectedSubject}</h2>
          
          {loadingMaterials ? (
            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-rose-100 dark:hover:border-gray-600 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 text-rose-500 rounded-xl flex items-center justify-center text-xl">📄</div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors text-sm md:text-base">{m.title}</h4>
                      <p className="text-xs text-gray-500">{new Date(m.uploadDate).toLocaleDateString()} • {m.uploadedBy?.name || 'Faculty'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(m._id)} className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-600 dark:hover:bg-white dark:hover:text-black transition-colors shadow-lg active:scale-95">
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 font-bold text-sm">No materials yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;