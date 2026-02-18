import React, { useState, useEffect } from "react";
import { API_BASE_URL, BASE_URL } from "../../services/apiConfig"; // ✅ Import Config

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      // ✅ Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/admin/applications`);
      const data = await res.json();
      setApplications(data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  // ✅ SMART IMAGE URL HELPER
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("https")) {
      return path; // Return Cloudinary/External URL as is
    }
    // Return Local Server URL
    return `${BASE_URL}/${path.replace(/\\/g, "/")}`;
  };

  // Handle Approve/Reject
  const handleAction = async (id, status) => {
    let reason = "";

    if (status === 'rejected') {
      reason = prompt("Please enter the reason for rejection:");
      if (reason === null) return; 
      if (reason.trim() === "") {
        alert("Rejection reason is required!");
        return;
      }
    } else {
      if(!window.confirm(`Are you sure you want to approve this student?`)) return;
    }

    const endpoint = status === 'approved' ? 'approve-application' : 'reject-application';

    try {
      // ✅ Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/admin/${endpoint}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }) 
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || "Action Successful");
        fetchApplications(); 
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) { 
      alert("Action failed: Server error"); 
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold">Loading Applications...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 animate-in fade-in">
      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-8">Pending Admissions</h2>
      
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
           <p className="text-gray-500 font-bold">No pending applications found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
              
              {/* --- 1. APPLICANT PHOTO --- */}
              <div className="flex-shrink-0">
                {app.photo ? (
                  <img 
                    src={getImageUrl(app.photo)} 
                    alt={app.name} 
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                    onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150"}}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                )}
              </div>

              {/* --- 2. MAIN DETAILS --- */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white">{app.name}</h4>
                  <span className="bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {app.course}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <p>📧 {app.email}</p>
                  <p>📞 {app.phone}</p>
                  <p>🎂 {app.dob} ({app.gender})</p>
                  <p>📊 12th Score: <span className="font-bold text-emerald-600">{app.percentage}%</span></p>
                </div>

                <p className="text-xs text-gray-500 mb-4 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
                  📍 {app.address}
                </p>

                {/* --- 3. ACTIONS & FILES --- */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Marksheet Link */}
                  {app.marksheet && (
                    <a 
                      href={getImageUrl(app.marksheet)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      📄 View Marksheet
                    </a>
                  )}

                  <div className="flex-1"></div> 

                  <button 
                    onClick={() => handleAction(app._id, "approved")} 
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition active:scale-95 text-sm"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(app._id, "rejected")} 
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition active:scale-95 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;