import React from "react";

const AdminOverview = ({ stats }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Overview</h2>
      
      {/* ✅ Updated Grid with correct icons and verified data keys */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <StatCard 
          title="Total Students" 
          count={stats.students || 0} 
          color="bg-blue-500" 
          icon="🎓" 
        />
        <StatCard 
          title="Total Faculty" 
          count={stats.faculty || 0} 
          color="bg-purple-500" 
          icon="👨‍🏫" 
        />
        <StatCard 
          title="Pending Applications" 
          count={stats.applications || 0} 
          color="bg-orange-500" 
          icon="⏳" 
        />
        <StatCard 
          title="Courses Active" 
          count={stats.courses || 0} 
          color="bg-emerald-500" 
          icon="📚" 
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => (
  <div className={`${color} text-white p-8 rounded-[2rem] shadow-xl hover:scale-105 transition-transform duration-300`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-5xl font-black">{count}</h3>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminOverview;