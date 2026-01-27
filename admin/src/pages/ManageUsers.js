import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users instantly on load
  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/all-users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleRemoveUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/remove-user/${id}`, { 
        method: "DELETE" 
      });
      const data = await res.json();
      alert(data.message);
      fetchAllUsers(); // Refresh the list instantly
    } catch (err) {
      console.error(err);
    }
  };

  // Animation Variants (Matching your PageTransition style)
  const pageVariants = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -25 }
  };

  const pageTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1]
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
    >
      <nav className="bg-red-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <img src="/logo3.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => navigate("/dashboard")} className="text-sm font-bold hover:underline">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black dark:text-white tracking-tight">System Users</h2>
          <p className="text-gray-500 dark:text-gray-400">View and manage all registered Admins, Faculty, and Students.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 overflow-hidden"
        >
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400">User Details</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400">Role</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-6">
                    <p className="font-bold dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => handleRemoveUser(user._id, user.role)} className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && <p className="p-10 text-center text-gray-400 font-bold">No registered users found.</p>}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ManageUsers;