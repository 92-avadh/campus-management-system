import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // 1. Check Login
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchStudents(parsedUser.department);
    }
  }, [navigate]);

  // 2. Fetch Students
  const fetchStudents = async (dept) => {
    try {
      const response = await fetch(`http://localhost:5000/api/faculty/students?department=${dept}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Welcome, <span className="font-bold text-blue-700">{user.name}</span> ({user.department})
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            Logout 
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/30">
            <h3 className="text-lg font-semibold opacity-80">Total Students</h3>
            <p className="text-4xl font-bold">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold">Department</h3>
            <p className="text-xl font-bold text-gray-800">{user.department}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold">My ID</h3>
            <p className="text-xl font-bold text-gray-800">{user.userId}</p>
          </div>
        </div>

        {/* Student List Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Enrolled Students</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-700">{student.userId}</td>
                    <td className="p-4 font-semibold">{student.name}</td>
                    <td className="p-4 text-sm text-gray-500">{student.email}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                        {student.course}
                      </span>
                    </td>
                    <td className="p-4">
                      {student.isFeePaid ? (
                        <span className="text-green-600 font-bold text-sm">✅ Paid</span>
                      ) : (
                        <span className="text-red-500 font-bold text-sm">❌ Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {students.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No students found in the database.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;