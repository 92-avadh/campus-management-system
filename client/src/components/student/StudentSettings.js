import React, { useState, useEffect } from "react";

const StudentSettings = ({ user }) => {
  const [activeSection, setActiveSection] = useState("info");
  const [loading, setLoading] = useState(false);

  // --- STATE: Personal Info ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: ""
  });

  // --- STATE: Password Change ---
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

  // ✅ 1. FETCH DATA FROM DB ON LOAD
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = user.id || user._id; // Handle both id formats
        const res = await fetch(`http://localhost:5000/api/student/profile/${userId}`);
        const data = await res.json();
        
        if (res.ok) {
          setFormData({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  // ✅ 2. UPDATE INFO FUNCTION
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/student/update-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ " + data.message);
        setIsEditing(false);
        
        // Optional: Update Session Storage so sidebar updates immediately without refresh
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        sessionStorage.setItem("currentUser", JSON.stringify({ ...currentUser, ...formData }));
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. CHANGE PASSWORD FUNCTION
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("❌ New passwords do not match!");
    
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/student/change-password/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          oldPassword: passData.old, 
          newPassword: passData.new 
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("🔒 " + data.message);
        setPassData({ old: "", new: "", confirm: "" }); // Clear form
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Profile Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-1 space-y-3">
          <button 
            onClick={() => setActiveSection("info")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${
              activeSection === "info" 
                ? "bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none" 
                : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span>📝</span> Personal Info
          </button>
          <button 
            onClick={() => setActiveSection("password")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${
              activeSection === "password" 
                ? "bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none" 
                : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span>🔑</span> Security
          </button>
        </div>

        {/* MAIN CONTENT FORM */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
            
            {/* --- SECTION 1: PERSONAL INFO --- */}
            {activeSection === "info" && (
              <form onSubmit={handleUpdateInfo} className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Admission Details</h3>
                  {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition">
                      Edit Details
                    </button>
                  )}
                </div>

                {/* Read Only Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{user.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrollment No.</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-lg font-mono">{user.userId}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Email Address</label>
                      <input 
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${
                          isEditing 
                            ? "bg-white dark:bg-gray-900 border-rose-300 focus:ring-4 focus:ring-rose-500/10 dark:text-white" 
                            : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Phone Number</label>
                      <input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${
                          isEditing 
                            ? "bg-white dark:bg-gray-900 border-rose-300 focus:ring-4 focus:ring-rose-500/10 dark:text-white" 
                            : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Home Address</label>
                    <textarea 
                      rows="3"
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full p-4 rounded-xl border font-bold text-sm outline-none resize-none transition-all ${
                        isEditing 
                          ? "bg-white dark:bg-gray-900 border-rose-300 focus:ring-4 focus:ring-rose-500/10 dark:text-white" 
                          : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition transform active:scale-95 disabled:opacity-50">
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* --- SECTION 2: CHANGE PASSWORD --- */}
            {activeSection === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">Change Password</h3>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-2xl text-xs font-bold border border-amber-100 dark:border-amber-800/30 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="mt-0.5">Changing your password will log you out of all other active sessions.</p>
                </div>
                
                <div className="max-w-md">
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Current Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition font-bold"
                    value={passData.old}
                    onChange={(e) => setPassData({...passData, old: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">New Password</label>
                    <input 
                      type="password"
                      placeholder="New Pass"
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition font-bold"
                      value={passData.new}
                      onChange={(e) => setPassData({...passData, new: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Confirm Password</label>
                    <input 
                      type="password"
                      placeholder="Confirm"
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition font-bold"
                      value={passData.confirm}
                      onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                   <button type="submit" disabled={loading} className="px-10 py-4 rounded-xl font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-200 shadow-xl transition transform active:scale-95 disabled:opacity-50">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;