import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [activeRole, setActiveRole] = useState("student"); // 'student' | 'faculty' | 'admin'
  const [credentials, setCredentials] = useState({
    id: "",
    password: ""
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder for backend logic
    alert(`Logging in as ${activeRole.toUpperCase()}\nID: ${credentials.id}`);
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
             <img src="/logo.png" alt="SDJIC Logo" className="h-16 w-auto mx-auto" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Please select your role to login</p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center bg-gray-100 p-1 rounded-xl">
          {["student", "faculty", "admin"].map((role) => (
            <button
              key={role}
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
                    style={{ '--tw-ring-color': activeRole === 'student' ? '#ef4444' : activeRole === 'faculty' ? '#3b82f6' : '#1f2937' }}
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded border-gray-300 focus:ring-opacity-50 ${currentConfig.text}`}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              {/* FIXED: Replaced <a> with <button> to solve ESLint anchor-is-valid error */}
              <button 
                type="button"
                className={`font-medium hover:underline bg-transparent border-none p-0 cursor-pointer ${currentConfig.text}`}
                onClick={() => alert("Forgot Password functionality coming soon!")}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${currentConfig.color} ${currentConfig.hover}`}
          >
            Sign in as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our <span className="underline cursor-pointer hover:text-gray-700">Terms of Service</span> and <span className="underline cursor-pointer hover:text-gray-700">Privacy Policy</span>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;