import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaSave } from "react-icons/fa";

const FacultySettings = () => {
  const [profile, setProfile] = useState({
    email: "", phone: "", address: "", dob: ""
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: ""
  });
  const [loading, setLoading] = useState(false);

  // Get Current Faculty ID
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const facultyId = user ? user.id : null;

  // 1. Fetch Profile Data on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!facultyId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/faculty/profile/${facultyId}`);
        const data = await res.json();
        // Pre-fill form
        setProfile({
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          dob: data.dob ? data.dob.split('T')[0] : ""
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [facultyId]);

  // 2. Update Info Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/update-profile/${facultyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) alert("✅ Profile Updated!");
      else alert("❌ " + data.message);
    } catch (err) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/change-password/${facultyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Password Changed!");
        setPasswords({ oldPassword: "", newPassword: "" });
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Account Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your personal information and security.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* 📝 PROFILE FORM */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FaUser className="text-blue-600" /> Personal Info
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input 
                type="email" 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
              <textarea 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={profile.dob}
                onChange={(e) => setProfile({...profile, dob: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex justify-center items-center gap-2"
            >
              {loading ? "Saving..." : <><FaSave /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* 🔐 SECURITY FORM */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FaLock className="text-rose-600" /> Security
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
              <input 
                type="password" required
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-rose-500"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
              <input 
                type="password" required
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-rose-500"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-rose-500/30"
            >
              Change Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default FacultySettings;