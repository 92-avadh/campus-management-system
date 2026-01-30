import React, { useState, useEffect } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "faculty", // Default to faculty
    department: ""
  });

  // ✅ 1. FETCH USERS (Corrected API Endpoint)
  const fetchUsers = async () => {
    try {
      // Changed from '/users' to '/all-users' to match adminRoutes.js
      const res = await fetch("http://localhost:5000/api/admin/all-users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ 2. DELETE USER (Remove Access)
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Are you sure? This will remove the user's access permanently.")) return;
    try {
      // Changed from '/user/${id}' to '/remove-user/${id}' to match adminRoutes.js
      const res = await fetch(`http://localhost:5000/api/admin/remove-user/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ User access removed successfully.");
        fetchUsers();
      } else {
        alert("❌ Failed to delete user.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // ✅ 3. ADD NEW USER
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ User added! Credentials sent via Email.");
        setShowModal(false);
        setFormData({ name: "", email: "", phone: "", role: "faculty", department: "" });
        fetchUsers();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding user.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 animate-in fade-in relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-black text-gray-800 dark:text-white">Manage Users</h2>
           <p className="text-gray-500 text-sm">Control access for Faculty & Admins</p>
        </div>
        
        <div className="flex gap-4">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {["all", "student", "faculty", "admin"].map((role) => (
                <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === role
                    ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                >
                {role}
                </button>
            ))}
            </div>

            {/* ✅ ADD USER BUTTON */}
            <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
            >
                <span>+</span> Add User
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 rounded-tl-xl">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">ID / Email</th>
              <th className="p-4 rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-4">
                    <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                    {user.department && <p className="text-[10px] text-gray-400 font-bold">{user.department}</p>}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      user.role === "faculty"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : user.role === "admin"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-300">{user.userId}</span>
                    <span className="text-[10px]">{user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition border border-red-100 dark:border-red-900/30"
                  >
                    Remove Access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ ADD USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border dark:border-gray-700 transform transition-all scale-100">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Add New User</h3>
            <p className="text-sm text-gray-500 mb-6">Create credentials for a new Faculty or Admin.</p>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Full Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="e.g. Dr. Sarah Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Role</label>
                    <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                    </select>
                </div>
                {/* Show Department only if Faculty */}
                {formData.role === "faculty" && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Department</label>
                        <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                        <option value="">Select Dept</option>
                        <option value="BCA">BCA</option>
                        <option value="BBA">BBA</option>
                        <option value="BCOM">BCOM</option>
                        </select>
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Email (Login ID)</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="sarah@college.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Phone Number</label>
                <input 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="9876543210"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;