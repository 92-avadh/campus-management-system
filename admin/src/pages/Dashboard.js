import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  
  // REMOVED userId and password from state (handled by server now)
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", department: ""
  });

  // --- FETCH APPLICATIONS ---
  const fetchApplications = () => {
    fetch("http://localhost:5000/api/admin/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // --- ACTIONS ---
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this student? Credentials will be emailed.")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Approved! Credentials sent.");
        fetchApplications();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) { alert("Server Error"); }
    finally { setLoading(false); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this application?")) return;
    await fetch(`http://localhost:5000/api/admin/reject/${id}`, { method: "POST" });
    fetchApplications();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // POST without userId/password (Backend handles it)
      const res = await fetch("http://localhost:5000/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: modalType })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + modalType.toUpperCase() + " Added! Credentials sent to email.");
        setShowModal(false);
        setFormData({ name: "", email: "", phone: "", department: "" });
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) { alert("Server Error"); }
  };

  const openModal = (type) => { setModalType(type); setShowModal(true); setShowMenu(false); };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center border-t-4 border-red-700 sticky top-0 z-50 transition-colors">
        <h1 className="text-2xl font-bold text-red-700 tracking-wider">
          ADMIN <span className="text-gray-800 dark:text-white">DASHBOARD</span>
        </h1>
        
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button onClick={handleLogout} className="text-sm font-bold text-gray-500 dark:text-gray-300 hover:text-red-600">LOGOUT</button>

          {/* PLUS BUTTON */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className={`w-10 h-10 rounded-full bg-red-700 text-white text-2xl flex items-center justify-center shadow-lg transition-transform duration-300 ${showMenu ? "rotate-45" : "rotate-0"} hover:bg-red-800`}>+</button>
            {showMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <button onClick={() => openModal("faculty")} className="w-full text-left px-6 py-3 hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold border-b border-gray-100 dark:border-gray-700">👨‍🏫 Add Faculty</button>
                <button onClick={() => openModal("admin")} className="w-full text-left px-6 py-3 hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold">🛡️ Add Admin</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-8 max-w-6xl mx-auto">
        
        {/* HEADER WITH REFRESH BUTTON */}
        <div className="flex justify-between items-center mb-6 border-l-4 border-red-600 pl-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Pending Admission Requests
          </h2>
          <button 
            onClick={fetchApplications} 
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-bold transition"
          >
            🔄 Refresh Data
          </button>
        </div>

        {applications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No pending applications.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <table className="w-full text-left text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Documents</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-bold">{app.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{app.email}</div>
                    </td>
                    <td className="p-4">{app.course}</td>
                    
                    {/* DOCUMENTS COLUMN (With path fix) */}
                    <td className="p-4 text-sm space-x-3">
                      {app.photo ? (
                        <a 
                          href={`http://localhost:5000/${app.photo.replace(/\\/g, "/")}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          📸 Photo
                        </a>
                      ) : <span className="text-gray-400">No Photo</span>}
                      
                      {app.marksheet ? (
                         <a 
                           href={`http://localhost:5000/${app.marksheet.replace(/\\/g, "/")}`} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                         >
                           📄 Marksheet
                         </a>
                      ) : <span className="text-gray-400">No Sheet</span>}
                    </td>

                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => handleApprove(app._id)} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">
                        {loading ? "..." : "APPROVE"}
                      </button>
                      <button onClick={() => handleReject(app._id)} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded text-xs font-bold hover:bg-red-200">
                        REJECT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL (For Adding Users) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-8 rounded-2xl shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 capitalize">Add New {modalType}</h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="flex gap-4">
                <input required placeholder="Email" type="email" className="w-1/2 p-3 bg-gray-50 dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required placeholder="Phone" className="w-1/2 p-3 bg-gray-50 dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              {/* Removed ID/Password Inputs - Handled by Server */}
              
              <input required placeholder="Department (e.g. Computer Science)" className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              
              <button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded mt-4">
                Auto-Generate & Email Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;