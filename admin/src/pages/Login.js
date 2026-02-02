import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../logo3.png"; 

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login-step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, role: "admin" })
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2); 
      } else {
        alert(`❌ Login Failed: ${data.message}`);
      }
    } catch (err) {
      alert("⚠️ Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login-step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("adminUser", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        alert(`❌ OTP Error: ${data.message}`);
      }
    } catch (err) {
      alert("⚠️ Server Error during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gray-100 flex items-center justify-center font-sans"
    >
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-t-8 border-red-700">
        <div className="w-24 h-24 mb-6">
          <img src={logo} alt="Admin Logo" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-gray-800 text-2xl font-bold mb-2 uppercase tracking-wide">
          {step === 1 ? "Admin Portal" : "Security Check"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {step === 1 ? "Please sign in to continue" : "Enter the verification code"}
        </p>

        {step === 1 && (
          <form onSubmit={handleStep1} className="w-full space-y-5">
            <div>
              <label className="text-gray-600 text-xs font-bold uppercase tracking-wider block mb-1">Admin ID</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition font-medium"
                placeholder="userID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-bold uppercase tracking-wider block mb-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition font-medium"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "Checking Credentials..." : "Login Securely"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="w-full space-y-6 text-center">
            <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 border border-red-100">
              ⚡ Check your server console for the OTP code
            </div>
            <div>
                <input 
                type="text" 
                autoComplete="off"              
                maxLength="6"
                className="w-full bg-white text-gray-900 text-3xl text-center tracking-[0.5rem] p-4 rounded-xl border-2 border-gray-200 focus:border-red-600 outline-none font-bold placeholder-gray-300"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                required
                />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Access"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="text-gray-400 text-xs hover:text-red-600 transition underline"
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
      <div className="absolute bottom-6 text-gray-400 text-xs">
        &copy; 2026 SDJIC Campus System
      </div>
    </motion.div>
  );
};

export default Login;