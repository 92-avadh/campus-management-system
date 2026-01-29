import React, { useState, useEffect } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this user?")) return;
    try {
      await fetch(`http://localhost:5000/api/admin/user/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) { alert("Failed to delete"); }
  };

  const filteredUsers = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Manage Users</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {["all", "student", "faculty"].map(role => (
            <button 
              key={role}
              onClick={() => setFilter(role)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === role ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase tracking-widest">
            <tr><th className="p-4 rounded-tl-xl">Name</th><th className="p-4">Role</th><th className="p-4">ID / Email</th><th className="p-4 rounded-tr-xl">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map(user => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-4 font-bold text-gray-800 dark:text-white">{user.name}</td>
                <td className="p-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${user.role === 'faculty' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{user.userId || user.email}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(user._id)} className="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;