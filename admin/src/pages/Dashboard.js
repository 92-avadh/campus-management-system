import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [selectedApp, setSelectedApp] = useState(null); 
  const [meritFilter, setMeritFilter] = useState("all"); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState({ title: "", content: "" });

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", department: ""
  });

  const fetchApplications = () => {
    setIsRefreshing(true);
    fetch("http://localhost:5000/api/admin/applications")
      .then((res) => res.json())
      .then((data) => {
        // Filter out any applications that might still have 'rejected' status 
        // if they weren't deleted previously
        const pendingApps = data.filter(app => app.status !== "rejected");
        setApplications(pendingApps);
        setFilteredApps(pendingApps);
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 500);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let apps = [...applications];
    if (meritFilter === "80") {
      apps = apps.filter(app => parseFloat(app.percentage) >= 80);
    } else if (meritFilter === "70") {
      apps = apps.filter(app => parseFloat(app.percentage) >= 70);
    } else if (meritFilter === "60") {
      apps = apps.filter(app => parseFloat(app.percentage) >= 60);
    } else if (meritFilter === "below60") {
      apps = apps.filter(app => parseFloat(app.percentage) < 60);
    }
    setFilteredApps(apps.sort((a, b) => b.percentage - a.percentage));
  }, [meritFilter, applications]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this student? Credentials will be emailed.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve/${id}`, { method: "POST" });
      const data = await res.json();
      alert(data.message);
      fetchApplications(); 
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter the reason for rejection:");
    if (!reason) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      alert(data.message);
      fetchApplications(); 
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/send-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });
      const data = await res.json();
      alert(data.message);
      setNotice({ title: "", content: "" });
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-red-900 font-bold tracking-widest animate-pulse">LOADING ADMIN PANEL...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      <aside className="w-64 bg-red-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-red-800">
          <img src="/logo3.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab("requests")} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "requests" ? "bg-red-800 shadow-lg scale-105" : "hover:bg-red-800/50"}`}
          >
            🏠 Admission Requests
          </button>
          <button 
            onClick={() => setActiveTab("broadcast")} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "broadcast" ? "bg-red-800 shadow-lg scale-105" : "hover:bg-red-800/50"}`}
          >
            📢 Broadcast Notice
          </button>
          <button 
            onClick={() => navigate("/manage-users")} 
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-800/50 font-bold text-sm transition-all"
          >
            👥 Manage Users
          </button>
          <div className="pt-6 pb-2 px-3 text-[10px] uppercase font-black text-red-300 tracking-widest">User Controls</div>
          <button onClick={() => { setModalType("Faculty"); setShowModal(true); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-800/50 font-bold text-sm transition-all">
            👨‍🏫 Add Faculty
          </button>
          <button onClick={() => { setModalType("Admin"); setShowModal(true); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-800/50 font-bold text-sm transition-all">
            🛡️ Add Admin
          </button>
        </nav>

        <div className="p-4 border-t border-red-800">
          <button onClick={handleLogout} className="w-full p-3 rounded-xl bg-red-700 hover:bg-red-600 font-bold text-sm transition-colors shadow-lg">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b dark:border-gray-700 sticky top-0 z-10">
          <h2 className="text-lg font-bold dark:text-white uppercase tracking-tight">
            {activeTab === "requests" ? "Dashboard / Admissions" : "Dashboard / Notice System"}
          </h2>
          <ThemeToggle />
        </header>

        <div key={activeTab} className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "broadcast" ? (
            <div className="max-w-3xl mx-auto">
              <section className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border dark:border-gray-700">
                <h3 className="text-3xl font-black mb-2 dark:text-white">Broadcast System Notice</h3>
                <p className="text-gray-500 mb-8">This will be instantly visible to Students and Faculty on their dashboards.</p>
                <form onSubmit={handleSendNotice} className="space-y-5">
                  <input 
                    required placeholder="Notice Title"
                    className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-transparent focus:border-red-900 outline-none transition-all"
                    value={notice.title}
                    onChange={(e) => setNotice({...notice, title: e.target.value})}
                  />
                  <textarea 
                    required placeholder="Detailed message content..."
                    rows="6"
                    className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-transparent focus:border-red-900 outline-none transition-all"
                    value={notice.content}
                    onChange={(e) => setNotice({...notice, content: e.target.value})}
                  ></textarea>
                  <button type="submit" className="w-full py-4 bg-red-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-900/20 active:scale-95">
                    Broadcast Now
                  </button>
                </form>
              </section>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-black dark:text-white tracking-tighter">Admission Requests</h3>
                  <p className="text-gray-500">Manage student enrollment applications.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={fetchApplications} className="p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:text-red-700 transition-all active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                  <select value={meritFilter} onChange={(e) => setMeritFilter(e.target.value)} className="p-3 rounded-xl border dark:bg-gray-800 dark:text-white text-xs font-bold outline-none cursor-pointer">
                    <option value="all">Show All</option>
                    <option value="80">Merit: 80%+</option>
                    <option value="70">Merit: 70%+</option>
                    <option value="60">Merit: 60%+</option>
                    <option value="below60">Merit: Below 60%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredApps.map((app) => (
                  <div key={app._id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700 flex items-center gap-6 transition-all hover:border-red-200">
                    <img src={`http://localhost:5000/${app.photo?.replace(/\\/g, '/')}`} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 dark:bg-gray-700" alt="Student" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold dark:text-white text-lg truncate">{app.name}</h4>
                      <p className="text-xs text-red-600 font-bold uppercase tracking-widest">{app.course}</p>
                      <p className="text-xl font-black dark:text-white mt-1">{app.percentage}%</p>
                    </div>
                    <button onClick={() => setSelectedApp(app)} className="px-6 py-2 bg-gray-50 dark:bg-gray-700/50 dark:text-white rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors">Details</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border dark:border-gray-700 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black dark:text-white mb-2 tracking-tighter">Add {modalType}</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Email" type="email" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="Phone" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required placeholder="Department" className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 dark:text-white border dark:border-gray-600 rounded-2xl outline-none focus:border-red-500" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-900/20 active:scale-95">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border dark:border-gray-700 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black dark:text-white tracking-tighter">Student Profile</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-red-600 text-2xl">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={`http://localhost:5000/${selectedApp.photo?.replace(/\\/g, '/')}`} className="w-28 h-28 rounded-3xl object-cover border-4 border-gray-50 dark:border-gray-700 shadow-lg" alt="Profile" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Course</p>
                    <p className="text-xl font-black text-red-700">{selectedApp.course}</p>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase mt-1 inline-block">Pending Review</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Name</label>
                    <p className="font-bold text-lg dark:text-white">{selectedApp.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Gender</label>
                      <p className="font-bold dark:text-white capitalize">{selectedApp.gender || "Not Provided"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Date of Birth</label>
                      <p className="font-bold dark:text-white">{selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString() : "Not Provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Residential Address</label>
                    <p className="text-sm font-medium dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl italic border dark:border-gray-700">
                      "{selectedApp.address || "No address details available."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/20">
                  <label className="text-[10px] font-black uppercase text-red-400 block mb-1">Academic Merit (12th)</label>
                  <p className="text-5xl font-black text-red-900 dark:text-red-500">{selectedApp.percentage}%</p>
                </div>
                
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 block px-1">Contact Information</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border dark:border-gray-700">
                        <span className="text-lg">📧</span>
                        <p className="text-sm font-bold dark:text-white truncate">{selectedApp.email}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border dark:border-gray-700">
                        <span className="text-lg">📞</span>
                        <p className="text-sm font-bold dark:text-white">{selectedApp.phone}</p>
                    </div>
                </div>

                <div className="pt-2">
                  <a href={`http://localhost:5000/${selectedApp.marksheet?.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Marksheet PDF
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 pt-6 border-t dark:border-gray-700">
               <button onClick={() => { handleReject(selectedApp._id); setSelectedApp(null); }} className="flex-1 py-4 bg-red-100 text-red-700 rounded-2xl font-bold text-sm hover:bg-red-200 transition-colors">Reject Application</button>
               <button onClick={() => { handleApprove(selectedApp._id); setSelectedApp(null); }} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">Approve Admission</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;