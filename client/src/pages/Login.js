import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const Login = () => {
  const navigate = useNavigate();
  // UI keeps only Student/Faculty as requested, but logic handles Admin too
  const [activeRole, setActiveRole] = useState("student");
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // --- STEP 1: VALIDATE PASSWORD & SEND OTP ---
  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanId = credentials.id.trim();
      // ✅ Dynamic URL for mobile access
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/login-step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: cleanId,
          password: credentials.password,
          role: activeRole
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMaskedEmail(data.email); 
        setStep(2); 
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("Server Error. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanId = credentials.id.trim();
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/login-step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: cleanId,
          otp: otp
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        // ✅ FIX: Save Session Data (User + Token)
        const sessionData = { ...data.user, token: data.token }; 
        sessionStorage.setItem("currentUser", JSON.stringify(sessionData));
        
        if (data.user.role === 'admin') {
            // ✅ FIX: Persist Admin Token explicitly for Admin Dashboard
            localStorage.setItem("adminUser", JSON.stringify(sessionData));
            navigate("/dashboard");
        } else if (activeRole === "faculty") {
            navigate("/faculty-dashboard");
        } else {
            navigate("/student-dashboard");
        }
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const themeColor = activeRole === "faculty" ? "bg-blue-700" : "bg-red-700";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">SDJIC Login</h1>
          <p className="text-sm text-gray-500">Secure 2-Step Verification</p>
        </div>

        {step === 1 && (
          <>
            <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
              {["student", "faculty"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${activeRole === role ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <input 
                name="id" required placeholder={`${activeRole.toUpperCase()} ID`} 
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
              <input 
                name="password" type="password" required placeholder="Password" 
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
              <button type="submit" disabled={loading} className={`w-full py-3 text-white font-bold rounded-xl ${themeColor}`}>
                {loading ? "Sending OTP..." : "Next ➜"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6 animate-fade-in">
            <div className="text-center bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              ✅ OTP sent to your email!<br/>
              <span className="font-mono text-xs text-gray-500">({maskedEmail})</span>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP</label>
              <input 
                type="text" required maxLength="6" placeholder="123456"
                className="w-full p-4 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg outline-none focus:border-green-500"
                value={otp} onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg">
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-gray-400 hover:text-gray-600">
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;