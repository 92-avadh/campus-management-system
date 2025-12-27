import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'faculty' or 'admin'

  // Form Data State
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", userId: "", password: "", department: ""
  });

  // 1. Fetch Students on Load
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  }, []);

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  // 3. Open Modal
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setShowMenu(false); // Close dropdown
  };

  // 4. Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: modalType })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + modalType.toUpperCase() + " Added Successfully!");
        setShowModal(false);
        setFormData({ name: "", email: "", phone: "", userId: "", password: "", department: "" });
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50 border-t-4 border-red-700">
        <h1 className="text-2xl font-bold text-red-700 tracking-wider">
          ADMIN <span className="text-gray-800">DASHBOARD</span>
        </h1>
        
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 font-bold">
            LOGOUT
          </button>

          {/* ➕ THE PLUS BUTTON ➕ */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`w-12 h-12 rounded-full bg-red-700 text-white text-3xl flex items-center justify-center shadow-lg transition-transform duration-300 ${showMenu ? "rotate-45" : "rotate-0"} hover:bg-red-800`}
            >
              +
            </button>

            {/* DROPDOWN MENU */}
            {showMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down z-50">
                <button 
                  onClick={() => openModal("faculty")}
                  className="w-full text-left px-6 py-4 hover:bg-red-50 text-gray-700 font-bold border-b border-gray-100 transition"
                >
                  👨‍🏫 Add Faculty
                </button>
                <button 
                  onClick={() => openModal("admin")}
                  className="w-full text-left px-6 py-4 hover:bg-red-50 text-gray-700 font-bold transition"
                >
                  🛡️ Add Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Admission Requests) --- */}
      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-3">
          Admission Requests
        </h2>

        {students.length === 0 ? (
          <p className="text-gray-500">No students found.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">{stu.name}</td>
                    <td className="p-4 text-gray-600">{stu.course}</td>
                    <td className="p-4 font-mono text-sm text-blue-600">{stu.userId}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${stu.isFeePaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {stu.isFeePaid ? "Active" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- POPUP MODAL (For Adding Users) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-2xl relative animate-scale-up">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
              Add New {modalType}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="flex gap-4">
                <input required placeholder="Email" type="email" className="w-1/2 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required placeholder="Phone" className="w-1/2 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="flex gap-4">
                <input required placeholder="User ID (e.g. FAC01)" className="w-1/2 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none font-mono uppercase" 
                  value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} />
                <input required placeholder="Password" type="password" className="w-1/2 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <input required placeholder="Department" className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
                value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />

              <button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl mt-4 transition">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;