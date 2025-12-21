import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 

const Login = () => {
  const navigate = useNavigate(); // Hook for redirection
  const [activeRole, setActiveRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    id: "",
    password: ""
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: credentials.id,
          password: credentials.password,
          role: activeRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save User Data to Local Storage
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        
        alert(`✅ Welcome back, ${data.user.name}!`);

        // 2. Redirect based on Role
        if (activeRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/student-dashboard"); 
        }
      } else {
        alert(`❌ Login Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server Error: Unable to connect.");
    } finally {
      setLoading(false);
    }
  };

  // Role Configurations (Colors & Labels)
  const roleConfig = {
    student: {
      color: "bg-red-700",
      hover: "hover:bg-red-800",
      light: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      label: "Enrollment Number",
      placeholder: "e.g. 2025001"
    },
    faculty: {
      color: "bg-blue-700",
      hover: "hover:bg-blue-800",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      label: "Employee ID",
      placeholder: "e.g. FAC101"
    },
    admin: {
      color: "bg-gray-800",
      hover: "hover:bg-gray-900",
      light: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      label: "Admin Username",
      placeholder: "e.g. admin_main"
    }
  };

  const currentConfig = roleConfig[activeRole];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Bar */}
        <div className={`absolute top-0 left-0 w-full h-2 ${currentConfig.color} transition-colors duration-300`}></div>

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
             {/* Ensure you have a logo image or remove this img tag */}
             <h1 className="text-2xl font-bold text-gray-800">SDJIC CAMPUS</h1>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Please select your role to login</p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center bg-gray-100 p-1 rounded-xl">
          {["student", "faculty", "admin"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => { setActiveRole(role); setCredentials({id: "", password: ""}); }}
              className={`flex-1 capitalize text-sm font-bold py-2 rounded-lg transition-all duration-300 ${
                activeRole === role
                  ? "bg-white text-gray-900 shadow-sm transform scale-105"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          <div className={`rounded-xl p-6 border-2 transition-colors duration-300 ${currentConfig.light} ${currentConfig.border}`}>
            <h3 className={`text-center font-bold text-lg uppercase tracking-wider mb-6 ${currentConfig.text}`}>
              {activeRole} Login
            </h3>

            <div className="space-y-4">
              {/* ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentConfig.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">👤</span>
                  <input
                    name="id"
                    type="text"
                    required
                    value={credentials.id}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all focus:border-transparent"
                    placeholder={currentConfig.placeholder}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                  <input
                    name="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${currentConfig.color} ${currentConfig.hover} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? "Verifying..." : `Sign in as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;