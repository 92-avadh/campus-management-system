import React from "react";

const StudentOverview = ({ user }) => {
  // Mock Updates (You can replace this with a fetch from your 'Notices' API later)
  const updates = [
    { id: 1, text: "Mid-Term Exams start from March 10th.", time: "2h ago", type: "alert" },
    { id: 2, text: "Holiday declared on Friday (Campus Closed).", time: "1d ago", type: "info" },
    { id: 3, text: "New assignment uploaded for Java.", time: "2d ago", type: "work" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. PROFILE CARD */}
      <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-500/20 mb-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black border border-white/10 shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-rose-100 font-medium text-lg opacity-90">{user.course} Student</p>
            <div className="flex items-center gap-3 mt-3">
               <span className="px-3 py-1 bg-black/20 rounded-lg text-xs font-mono font-bold border border-white/10">
                 ID: {user.userId}
               </span>
               <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold border border-white/10">
                 Semester 6
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Academic Info (Kept as is) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all h-full">
          <div className="flex items-center justify-between mb-6">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
               📚
             </div>
             <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide">
               Active
             </span>
          </div>
          
          <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Course</p>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{user.course}</h3>
             
             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                   <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mode</span>
                   <span className="text-xs font-bold text-gray-800 dark:text-white">Full Time - On Campus</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                   <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Attendance</span>
                   <span className="text-xs font-bold text-emerald-600">85% (Good)</span>
                </div>
             </div>
          </div>
        </div>

        {/* Card 2: QUICK UPDATES (Replaced Fee Box) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all h-full relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center text-xl animate-pulse">
               📢
             </div>
             <div>
               <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none">Quick Updates</h3>
               <p className="text-xs font-bold text-gray-400 mt-1">Latest announcements</p>
             </div>
          </div>

          <div className="space-y-4 relative z-10">
            {updates.map((update) => (
              <div key={update.id} className="flex gap-4 items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-default group">
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  update.type === 'alert' ? 'bg-rose-500' : 
                  update.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}></div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-snug group-hover:text-rose-600 transition-colors">
                    {update.text}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-full blur-2xl z-0"></div>
        </div>

      </div>
    </div>
  );
};

export default StudentOverview;