import React, { useState, useEffect } from "react";
// ✅ FIXED: Removed FaEnvelope and FaPhone to resolve ESLint warnings
import { FaUserShield, FaLock, FaSave } from "react-icons/fa";

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState("info");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", address: "", dob: "" });
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchProfile = async () => {
      // ✅ Matches AdminDashboard storage key
      const storedUser = JSON.parse(localStorage.getItem("adminUser"));
      if (!storedUser) return;
      setUser(storedUser);

      try {
        const userId = storedUser.id || storedUser._id; 
        // ✅ Matches route in your adminRoutes.js
        const res = await fetch(`http://localhost:5000/api/admin/profile/${userId}`);
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
        console.error("Error fetching admin profile:", err); 
      }
    };
    fetchProfile();
  }, []);

  // 2. UPDATE INFO
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/admin/update-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Admin Profile Updated!");
        setIsEditing(false);
        // Sync local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("adminUser", JSON.stringify(updatedUser));
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
      const res = await fetch(`http://localhost:5000/api/admin/change-password/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: passData.old, newPassword: passData.new }),
      });
      const data = await res.json();
      if (data.success) { 
        alert("🔒 Password Changed Successfully!"); 
        setPassData({ old: "", new: "", confirm: "" }); 
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) { 
      alert("Error updating password"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-800 dark:text-white">Admin Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system administrator details and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <button 
            onClick={() => setActiveSection("info")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm flex gap-3 transition-all ${
              activeSection === "info" ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-500"
            }`}
          >
            <FaUserShield /> Profile Info
          </button>
          <button 
            onClick={() => setActiveSection("password")} 
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm flex gap-3 transition-all ${
              activeSection === "password" ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-500"
            }`}
          >
            <FaLock /> Security
          </button>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
            
            {/* PROFILE INFO FORM */}
            {activeSection === "info" && (
              <form onSubmit={handleUpdateInfo} className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Admin Details</h3>
                  {!isEditing && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(true)} 
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Email Address</label>
                    <input 
                      disabled={!isEditing} 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className={`w-full p-3 rounded-xl border font-bold text-sm outline-none transition-all ${
                        isEditing ? "bg-white dark:bg-gray-900 border-indigo-300 dark:text-white" : "bg-gray-100 dark:bg-gray-700 border-transparent text-gray-500 cursor-not-allowed"
                      }`} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Phone Number</label>
                    <input 
                      disabled={!isEditing} 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className={`w-full p-3 rounded-xl border font-bold text-sm outline-none transition-all ${
                        isEditing ? "bg-white dark:bg-gray-900 border-indigo-300 dark:text-white" : "bg-gray-100 dark:bg-gray-700 border-transparent text-gray-500 cursor-not-allowed"
                      }`} 
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50"
                    >
                      <FaSave className="inline mr-2 mb-1" /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* PASSWORD SECURITY FORM */}
            {activeSection === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-4 dark:border-gray-700">Change Admin Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={passData.old} 
                      onChange={e => setPassData({...passData, old: e.target.value})} 
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 outline-none transition font-bold" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">New Password</label>
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        required 
                        value={passData.new} 
                        onChange={e => setPassData({...passData, new: e.target.value})} 
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 outline-none transition font-bold" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm" 
                        required 
                        value={passData.confirm} 
                        onChange={e => setPassData({...passData, confirm: e.target.value})} 
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 outline-none transition font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50"
                >
                  <FaLock className="inline mr-2 mb-1" /> {loading ? "Updating..." : "Update Security Settings"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;