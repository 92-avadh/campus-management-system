import React, { useState, useEffect } from "react";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) { console.error("Fetch error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleAction = async (id, status) => {
    if(!window.confirm(`Are you sure you want to ${status} this application?`)) return;
    try {
      await fetch(`http://localhost:5000/api/admin/application/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchApplications();
    } catch (err) { alert("Action failed"); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-bold">Loading Applications...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 animate-in fade-in">
      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-8">Pending Admissions</h2>
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
           <p className="text-gray-500 dark:text-gray-400 font-bold">No pending applications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
              <div className="mb-4 md:mb-0">
                <h4 className="font-bold text-xl text-gray-800 dark:text-white">{app.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{app.email} • {app.phone}</p>
                <div className="flex gap-2 mt-2">
                   <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold">{app.course}</span>
                   <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs px-3 py-1 rounded-full font-bold">Top {app.percentile}%</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction(app._id, "approved")} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95">Approve</button>
                <button onClick={() => handleAction(app._id, "rejected")} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;