import React from "react";

const FacultyOverview = ({ user, students, materialsCount }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. WELCOME BANNER (Blue Gradient) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 mb-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black border border-white/10 shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome, Prof. {user.name.split(' ')[0]}</h2>
            <p className="text-blue-100 font-medium text-lg opacity-90">{user.department} Department</p>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (Clean Faculty Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Students Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
              🎓
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white">{students.length}</h3>
          <p className="text-xs text-gray-500 mt-1 font-bold">Enrolled in {user.department}</p>
        </div>

        {/* Materials Uploaded Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl">
              📂
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resources</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white">{materialsCount}</h3>
          <p className="text-xs text-gray-500 mt-1 font-bold">Files Shared</p>
        </div>

        {/* Department Status Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all">
           <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl">
              🏫
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Active</h3>
          <p className="text-xs text-emerald-600 mt-1 font-bold">Session 2025-26</p>
        </div>

      </div>

      {/* 3. STUDENT LIST TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Enrolled Students</h3>
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold">
            {students.length} Students
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-6">Student Name</th>
                <th className="p-6">Enrollment ID</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {s.userId}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-500 font-bold">
                    No students found in this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FacultyOverview;