import React, { useEffect, useState, useCallback } from "react";
// ✅ Replace with your dynamic URL logic if API_BASE_URL isn't imported
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const AdminOverview = () => {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    applications: 0,
    courses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ROBUST FETCH FUNCTION
  const fetchStats = useCallback(async () => {
    try {
      // ✅ Get Token (Fixed from Login.js)
      const userStr = localStorage.getItem("adminUser");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }) 
        }
      });
      
      if (!response.ok) {
        throw new Error(`Connection Error: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data || { students: 0, faculty: 0, applications: 0, courses: 0 });
      setError(null);
    } catch (err) {
      console.error("Stats Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ AUTO-REFRESH (Prevents blank screen)
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); 
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats.students) {
    return (
      <div className="flex justify-center items-center h-48 animate-pulse">
        <div className="text-gray-400 text-lg font-medium">📊 Loading Live Data...</div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Overview</h2>
        <button 
          onClick={() => { setLoading(true); fetchStats(); }}
          className="text-xs font-bold text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-bold flex justify-between items-center">
          <span>⚠️ Live data disconnected: {error}</span>
          <span className="text-xs font-normal opacity-80">Showing cached values</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <StatCard title="Total Students" count={stats.students || 0} color="bg-blue-600" icon="🎓" />
        <StatCard title="Total Faculty" count={stats.faculty || 0} color="bg-purple-600" icon="👨‍🏫" />
        <StatCard title="Pending Applications" count={stats.applications || 0} color="bg-orange-500" icon="⏳" />
        <StatCard title="Courses Active" count={stats.courses || 0} color="bg-emerald-500" icon="📚" />
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => (
  <div className={`${color} text-white p-8 rounded-[2rem] shadow-xl hover:scale-105 transition-transform duration-300 relative overflow-hidden`}>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-5xl font-black tracking-tighter">{count}</h3>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm shadow-sm">
        {icon}
      </div>
    </div>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
  </div>
);

export default AdminOverview;