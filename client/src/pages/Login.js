import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { API_BASE_URL } from "../apiConfig";

const Login = () => {
  const navigate = useNavigate();
  // Role Selection
  const [activeRole, setActiveRole] = useState("student");
  
  // View State: 'login' | 'forgot'
  const [view, setView] = useState("login"); 

  // --- LOGIN STATES ---
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // --- FORGOT PASSWORD STATES ---
  // Step 1: Email, Step 2: OTP, Step 3: Password
  const [forgotStep, setForgotStep] = useState(1); 
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // ==========================
  //      LOGIN LOGIC
  // ==========================

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanId = credentials.id.trim();
      const response = await fetch(`${API_BASE_URL}/auth/login-step1`, {
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

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanId = credentials.id.trim();
      const response = await fetch(`${API_BASE_URL}/auth/login-step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: cleanId,
          otp: otp
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        const sessionData = { ...data.user, token: data.token }; 
        sessionStorage.setItem("currentUser", JSON.stringify(sessionData));
        
        if (data.user.role === 'admin') {
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

  // ==========================
  //   FORGOT PASSWORD LOGIC
  // ==========================

  // Step 1: Send OTP
  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password-step1`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: forgotEmail })
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ OTP Sent to your email!");
            setForgotStep(2); // Move to OTP entry
        } else {
            alert("❌ " + data.message);
        }
    } catch (err) {
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };

  // Step 2: Validate OTP
  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-forgot-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
        });
        const data = await res.json();
        if (res.ok) {
            setForgotStep(3); // Move to Password Reset
        } else {
            alert("❌ " + data.message);
        }
    } catch (err) {
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }
    
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Password Reset Successful! Please Login.");
            // Reset Everything
            setView("login");
            setForgotStep(1);
            setForgotOtp("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            alert("❌ " + data.message);
        }
    } catch (err) {
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };


  const themeColor = activeRole === "faculty" ? "bg-blue-700" : "bg-red-700";
  const themeText = activeRole === "faculty" ? "text-blue-700" : "text-red-700";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {view === "login" ? "SDJIC Login" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500">
            {view === "login" ? "Secure 2-Step Verification" : "Recover your account access"}
          </p>
        </div>

        {/* ==========================
                  LOGIN VIEW
           ========================== */}
        {view === "login" && (
          <>
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
                  
                  {/* FORGOT PASSWORD LINK */}
                  <div className="text-right">
                    <button 
                        type="button"
                        onClick={() => setView("forgot")}
                        className={`text-xs font-bold ${themeText} hover:underline`}
                    >
                        Forgot Password?
                    </button>
                  </div>

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
          </>
        )}

        {/* ==========================
              FORGOT PASSWORD VIEW
           ========================== */}
        {view === "forgot" && (
            <>
                {/* --- STEP 1: EMAIL INPUT --- */}
                {forgotStep === 1 && (
                    <form onSubmit={handleForgotStep1} className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Registered Email</label>
                            <input 
                                type="email" required placeholder="name@example.com"
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl">
                            {loading ? "Checking..." : "Send Reset OTP"}
                        </button>
                        <button type="button" onClick={() => setView("login")} className="w-full text-xs text-gray-400 hover:text-gray-600">
                            ← Back to Login
                        </button>
                    </form>
                )}

                {/* --- STEP 2: OTP VERIFICATION --- */}
                {forgotStep === 2 && (
                    <form onSubmit={handleForgotStep2} className="space-y-6 animate-fade-in">
                        <div className="text-center bg-blue-50 text-blue-800 p-2 rounded-lg text-xs mb-2">
                             OTP Sent to: <strong>{forgotEmail}</strong>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP</label>
                            <input 
                                type="text" required maxLength="6" placeholder="123456"
                                className="w-full p-4 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button type="button" onClick={() => setForgotStep(1)} className="w-full text-xs text-gray-400 hover:text-gray-600">
                            ← Change Email
                        </button>
                    </form>
                )}

                {/* --- STEP 3: PASSWORD RESET --- */}
                {forgotStep === 3 && (
                    <form onSubmit={handleForgotStep3} className="space-y-4 animate-fade-in">
                        <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs text-center border border-green-200">
                            ✅ OTP Verified. Set your new password.
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">New Password</label>
                            <input 
                                type="password" required placeholder="New Password"
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Password</label>
                            <input 
                                type="password" required placeholder="Confirm Password"
                                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg">
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button type="button" onClick={() => setView("login")} className="w-full text-xs text-gray-400 hover:text-gray-600">
                            Cancel
                        </button>
                    </form>
                )}
            </>
        )}

      </div>
    </div>
  );
};

export default Login;