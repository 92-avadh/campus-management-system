import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeePayment from "../components/FeePayment"; // <--- Import the Payment Component

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 1. Check Login Status on Load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login"); // Redirect if not logged in
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // 2. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null; // Show nothing while checking

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.name}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            Logout 
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Student Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-4 border-white shadow-sm">
                🎓
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.course} Student</p>
              
              <div className="text-left space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student ID:</span>
                  <span className="font-bold text-gray-900">{user.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="font-bold uppercase text-red-600">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Contact Support Box */}
            <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-blue-200 text-sm mb-4">Contact the admin office for any issues regarding fees or marks.</p>
              <button className="w-full bg-white text-blue-900 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                Contact Admin
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Fee Status & Notices */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. FEE PAYMENT COMPONENT (The one we just built) */}
            <FeePayment user={user} />

            {/* 2. Important Notices (Static for now) */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-red-100 p-2 rounded-lg mr-3 text-red-600">📢</span>
                Important Notices
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start text-sm text-gray-600 pb-4 border-b border-gray-50">
                  <span className="font-bold text-red-500 mr-2">•</span>
                  Orientation program for new batch starts on 15th August.
                </li>
                <li className="flex items-start text-sm text-gray-600 pb-4 border-b border-gray-50">
                  <span className="font-bold text-red-500 mr-2">•</span>
                  Please submit your original documents to the admin office before the semester begins.
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <span className="font-bold text-red-500 mr-2">•</span>
                  Library cards will be issued after fee payment verification.
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;