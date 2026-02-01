import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/apiConfig";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    applications: 0,
    courses: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`);
        if (!res.ok) throw new Error("Failed to load stats");

        const data = await res.json();
        if (!cancelled) {
          setStats({
            students: data.students ?? 0,
            faculty: data.faculty ?? 0,
            applications: data.applications ?? 0,
            courses: data.courses ?? 0
          });
        }
      } catch (err) {
        if (!cancelled) setError("Unable to load overview statistics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Live summary of campus activity
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard
          title="Total Students"
          value={stats.students}
          gradient="from-blue-500 to-blue-700"
          icon="🎓"
        />
        <StatCard
          title="Total Faculty"
          value={stats.faculty}
          gradient="from-purple-500 to-purple-700"
          icon="👨‍🏫"
        />
        <StatCard
          title="Pending Applications"
          value={stats.applications}
          gradient="from-orange-500 to-orange-700"
          icon="⏳"
        />
        <StatCard
          title="Active Courses"
          value={stats.courses}
          gradient="from-emerald-500 to-emerald-700"
          icon="📚"
        />
      </div>
    </div>
  );
};

/* ---------------- STAT CARD ---------------- */

const StatCard = ({ title, value, gradient, icon }) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br ${gradient}`}
  >
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-1">
          {title}
        </p>
        <h3 className="text-5xl font-black tracking-tight">
          {value}
        </h3>
      </div>

      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur-md shadow">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminOverview;
