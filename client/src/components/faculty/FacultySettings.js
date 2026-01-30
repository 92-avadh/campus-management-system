import React, { useState, useEffect } from "react";

const FacultySettings = ({ user }) => {
  const [activeSection, setActiveSection] = useState("info");
  const [loading, setLoading] = useState(false);

  // --- STATE: Personal Info ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    dob: ""
  });

  // --- STATE: Password Change ---
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = user.id || user._id; 
        const res = await fetch(`http://localhost:5000/api/faculty/profile/${userId}`);
        const data = await res.json();
        
        if (res.ok) {
          setFormData({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "" 
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  // 2. UPDATE INFO
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/faculty/update-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ " + data.message);
        setIsEditing(false);
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

  // 3. CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("❌ New passwords do not match!");
    
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/faculty/change-password/${userId}`, {
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
        setPassData({ old: "", new: "", confirm: "" }); 
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
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-800 dark:text-white">Profile Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your faculty profile and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* TABS */}
        <div className="lg:col-span-1 space-y-3">
          <button 
            onClick={() => setActiveSection("info")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${
              activeSection === "info" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span>📝</span> Profile Info
          </button>
          <button 
            onClick={() => setActiveSection("password")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${
              activeSection === "password" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span>🔑</span> Security
          </button>
        </div>

        {/* FORMS */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
            
            {activeSection === "info" && (
              <form onSubmit={handleUpdateInfo} className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Personal Details</h3>
                  {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                      Edit Details
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Faculty Name</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{user.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{user.department}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Email</label>
                      <input 
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${isEditing ? "bg-white dark:bg-gray-900 border-blue-300" : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Phone</label>
                      <input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${isEditing ? "bg-white dark:bg-gray-900 border-blue-300" : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500"}`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Date of Birth</label>
                      <input 
                        type="date"
                        disabled={!isEditing}
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${isEditing ? "bg-white dark:bg-gray-900 border-blue-300" : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Address</label>
                      <input 
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className={`w-full p-4 rounded-xl border font-bold text-sm outline-none transition-all ${isEditing ? "bg-white dark:bg-gray-900 border-blue-300" : "bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500"}`}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}

            {activeSection === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">Change Password</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-2xl text-xs font-bold border border-amber-100 dark:border-amber-800/30 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="mt-0.5">Changing your password will log you out of other sessions.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Current Password</label>
                  <input type="password" required value={passData.old} onChange={(e) => setPassData({...passData, old: e.target.value})} className="w-full p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white font-bold" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">New Password</label>
                    <input type="password" required value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="w-full p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Confirm Password</label>
                    <input type="password" required value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} className="w-full p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white font-bold" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                   <button type="submit" disabled={loading} className="px-10 py-4 rounded-xl font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black transition">
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

export default FacultySettings;