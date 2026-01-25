import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo3.png"; // Ensure this file exists in src

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // --- STEP 1: VERIFY ID & PASSWORD ---
  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, role: "admin" })
      });

      if (response.ok) {
        setStep(2); 
      } else {
        alert("❌ Invalid ID or Password");
      }
    } catch (err) {
      alert("⚠️ Server Error");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert("❌ Wrong OTP");
      }
    } catch (err) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // CHANGED: Background is now gray-100 (Light), not black
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      
      {/* CHANGED: Card is White with Red Border */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-t-8 border-red-700">
        
        {/* LOGO AREA */}
        <div className="w-24 h-24 mb-6">
          <img src={logo} alt="Admin Logo" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-gray-800 text-2xl font-bold mb-2 uppercase tracking-wide">
          {step === 1 ? "Admin Portal" : "Security Check"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {step === 1 ? "Please sign in to continue" : "Enter the verification code"}
        </p>

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="w-full space-y-5">
            <div>
              <label className="text-gray-600 text-xs font-bold uppercase tracking-wider block mb-1">Admin ID</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition font-medium"
                placeholder="userID"
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-bold uppercase tracking-wider block mb-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition font-medium"
                placeholder="••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Authenticating..." : "Login Securely"}
            </button>
          </form>
        )}

        {/* STEP 2 FORM (OTP) */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="w-full space-y-6 text-center animate-fade-in">
            <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 border border-red-100">
              ⚡ Code sent to server console
            </div>

            {/* OTP INPUT - Clean & Modern */}
            <div>
                <input 
                type="text" 
                name="otp_field" 
                autoComplete="off"              
                maxLength="6"
                className="w-full bg-white text-gray-900 text-3xl text-center tracking-[1rem] p-4 rounded-xl border-2 border-gray-200 focus:border-red-600 outline-none font-bold placeholder-gray-300"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
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
      
      {/* Footer text */}
      <div className="absolute bottom-6 text-gray-400 text-xs">
        &copy; 2025 SDJIC Campus System
      </div>
    </div>
  );
};

export default Login;