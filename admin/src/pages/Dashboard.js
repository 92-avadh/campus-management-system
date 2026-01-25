import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [selectedApp, setSelectedApp] = useState(null); 
  const [meritFilter, setMeritFilter] = useState("all"); 
  const [isRefreshing, setIsRefreshing] = useState(false); // For button animation
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", department: ""
  });

  // --- FETCH APPLICATIONS ---
  const fetchApplications = () => {
    setIsRefreshing(true);
    fetch("http://localhost:5000/api/admin/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setFilteredApps(data);
        setTimeout(() => setIsRefreshing(false), 500); // Smooth animation
      })
      .catch((err) => {
        console.error(err);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // --- MERIT FILTER & SORTING LOGIC ---
  useEffect(() => {
    let apps = [...applications];
    if (meritFilter === "high") {
      apps = apps.filter(app => parseFloat(app.percentage) >= 80);
    } else if (meritFilter === "mid") {
      apps = apps.filter(app => parseFloat(app.percentage) >= 60 && parseFloat(app.percentage) < 80);
    } else if (meritFilter === "low") {
      apps = apps.filter(app => parseFloat(app.percentage) < 60);
    }
    setFilteredApps(apps.sort((a, b) => b.percentage - a.percentage));
  }, [meritFilter, applications]);

  // --- ACTIONS ---
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this student? Credentials will be emailed.")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve/${id}`, { method: "POST" });
      const data = await res.json();
      alert(data.message);
      fetchApplications(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter the reason for rejection (this will be sent to the student):");
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      alert(data.message);
      fetchApplications(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: modalType.toLowerCase() }),
      });
      const data = await res.json();
      alert(data.message);
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", department: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* --- NAVBAR --- */}
      <nav className="bg-red-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo3.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setShowMenu(!showMenu)} className="hover:text-gray-300 transition-colors">
            Menu ☰
          </button>
        </div>
      </nav>

      {/* --- SIDE MENU --- */}
      {showMenu && (
        <div className="absolute right-4 top-16 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-4 z-50 border border-gray-100 dark:border-gray-700 w-48 animate-in fade-in slide-in-from-top-2">
          <button onClick={() => { setModalType("Faculty"); setShowModal(true); setShowMenu(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors">Add Faculty</button>
          <button onClick={() => { setModalType("Admin"); setShowModal(true); setShowMenu(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors">Add Admin</button>
          <hr className="my-2 dark:border-gray-700" />
          <button onClick={handleLogout} className="block w-full text-left p-3 rounded-lg text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight">Admission Requests</h2>
            <p className="text-gray-500 dark:text-gray-400">Review applicants based on merit criteria.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* --- REFRESH BUTTON --- */}
            <button 
              onClick={fetchApplications}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 text-gray-400 hover:text-red-700 transition-all active:scale-90"
              title="Refresh Data"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* MERIT FILTER UI - FIXED FOR DARK MODE */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border dark:border-gray-700">
              <label className="text-xs font-bold uppercase text-gray-400 ml-2">Merit Filter:</label>
              <select 
                value={meritFilter} 
                onChange={(e) => setMeritFilter(e.target.value)}
                className="bg-transparent dark:text-white font-bold outline-none cursor-pointer text-sm pr-4 dark:bg-gray-800"
              >
                <option className="dark:bg-gray-800 dark:text-white" value="all">All Applicants</option>
                <option className="dark:bg-gray-800 dark:text-white" value="high">80% and Above</option>
                <option className="dark:bg-gray-800 dark:text-white" value="mid">60% - 80%</option>
                <option className="dark:bg-gray-800 dark:text-white" value="low">Below 60%</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredApps.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
             <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">No applications match the current criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApps.map((app) => (
              <div key={app._id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col group transition-all hover:border-red-200 dark:hover:border-red-900">
                <div className="flex gap-5 mb-6">
                  <img 
                    src={`http://localhost:5000/${app.photo?.replace(/\\/g, '/')}`} 
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-100 dark:bg-gray-700" 
                    alt="Student" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold dark:text-white text-lg truncate">{app.name}</h3>
                    <p className="text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-wide">{app.course}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xl font-black text-gray-900 dark:text-white">{app.percentage}%</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Merit Score</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <button 
                    onClick={() => setSelectedApp(app)} 
                    className="w-full text-center py-3 bg-gray-50 dark:bg-gray-700/50 dark:text-white rounded-2xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Full Details
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(app._id)} disabled={loading} className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">Approve</button>
                    <button onClick={() => handleReject(app._id)} disabled={loading} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold text-xs hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black dark:text-white tracking-tighter">Student Profile</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-red-600 text-2xl">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src={`http://localhost:5000/${selectedApp.photo?.replace(/\\/g, '/')}`} className="w-24 h-24 rounded-3xl object-cover border-4 border-gray-50 dark:border-gray-700" alt="Profile" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Department</p>
                    <p className="text-xl font-black text-red-700">{selectedApp.course}</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Name</label>
                  <p className="font-bold dark:text-white">{selectedApp.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">DOB & Gender</label>
                  <p className="font-bold dark:text-white">{selectedApp.dob} • {selectedApp.gender}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Residential Address</label>
                  <p className="text-sm font-medium dark:text-gray-300 leading-relaxed">{selectedApp.address}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-3xl">
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">12th Percentage</label>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">{selectedApp.percentage}%</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Contact Info</label>
                  <p className="font-bold dark:text-white">{selectedApp.email}</p>
                  <p className="font-bold dark:text-white">{selectedApp.phone}</p>
                </div>
                <div className="pt-4">
                  <a 
                    href={`http://localhost:5000/${selectedApp.marksheet?.replace(/\\/g, '/')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full text-center py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                  >
                    Open Marksheet
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 pt-6 border-t dark:border-gray-700">
               <button onClick={() => { handleReject(selectedApp._id); setSelectedApp(null); }} className="flex-1 py-4 bg-red-100 text-red-700 rounded-2xl font-bold text-sm hover:bg-red-200 transition-colors">Reject</button>
               <button onClick={() => { handleApprove(selectedApp._id); setSelectedApp(null); }} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all">Approve Admission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD USER MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border dark:border-gray-700">
            <h2 className="text-3xl font-black dark:text-white mb-2 tracking-tighter">Add {modalType}</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Email" type="email" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="Phone" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required placeholder="Department" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-900/20">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;