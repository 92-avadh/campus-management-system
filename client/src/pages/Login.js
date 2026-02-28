import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { API_BASE_URL } from "../apiConfig";

const Login = () => {
  const navigate = useNavigate();
  // Role Selection
  const [activeRole, setActiveRole] = useState("student");
  
  // View State
  const [view, setView] = useState("login"); 

  // --- LOGIN STATES ---
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // --- FORGOT PASSWORD STATES ---
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
        
        if (data.user.role === 'admin') {
            const adminUrl = `http://localhost:3001/login?token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`;
            window.location.href = adminUrl; 
        } else {
            sessionStorage.setItem("currentUser", JSON.stringify(sessionData));
            if (activeRole === "faculty") {
                navigate("/faculty-dashboard");
            } else {
                navigate("/student-dashboard");
            }
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
            setForgotStep(2); 
        } else {
            alert("❌ " + data.message);
        }
    } catch (err) {
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };

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
            setForgotStep(3); 
        } else {
            alert("❌ " + data.message);
        }
    } catch (err) {
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };

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

  // ==========================
  //    DYNAMIC THEME LOGIC
  // ==========================
  
  let btnGradient = "from-brand-primary to-rose-500 shadow-brand-primary/30";
  let ringColor = "focus:ring-brand-primary";
  let textColor = "text-brand-primary";
  let iconBg = "bg-rose-50 text-brand-primary";

  if (activeRole === "faculty") {
    btnGradient = "from-blue-700 to-blue-500 shadow-blue-500/30";
    ringColor = "focus:ring-blue-500";
    textColor = "text-blue-700";
    iconBg = "bg-blue-50 text-blue-700";
  } else if (activeRole === "admin") {
    btnGradient = "from-gray-800 to-gray-600 shadow-gray-500/30";
    ringColor = "focus:ring-gray-700";
    textColor = "text-gray-800";
    iconBg = "bg-gray-100 text-gray-800";
  }

  return (
    // ✨ CHANGED: Main background is now a soft, clean slate-50
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans selection:bg-rose-200 selection:text-brand-dark">
      
      {/* ✨ CHANGED: Soft, light blurred floating orbs instead of heavy background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] left-[50%] w-[30rem] h-[30rem] bg-rose-400/10 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>

      {/* ✨ CHANGED: Text color updated to gray-600 to be visible on the light background */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-gray-600 hover:text-brand-primary font-medium transition-all hover:-translate-x-1 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white transition-all duration-500 z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 mb-4">
             <img src="/logo3.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
             {/* Fallback icon if logo fails to load */}
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-primary absolute -z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 9v4M3 9v4" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {view === "login" ? "Welcome Back" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {view === "login" ? "Sign in to access your campus dashboard" : "Recover your account access"}
          </p>
        </div>

        {/* ==========================
                  LOGIN VIEW
           ========================== */}
        {view === "login" && (
          <div className="animate-fade-in transition-all duration-300">
            {step === 1 && (
              <>
                {/* Modern Segmented Role Selector */}
                <div className="flex p-1.5 mb-8 bg-gray-100/80 rounded-2xl backdrop-blur-sm">
                  {["student", "faculty", "admin"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setActiveRole(role)}
                      className={`flex-1 py-2.5 text-sm font-bold capitalize rounded-xl transition-all duration-300 ease-in-out ${
                        activeRole === role 
                          ? "bg-white shadow-sm text-gray-900 scale-100" 
                          : "text-gray-500 hover:text-gray-700 scale-95"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleStep1} className="space-y-5">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input 
                      name="id" required placeholder={`${activeRole.toUpperCase()} ID`} 
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white focus:ring-2 ${ringColor} focus:border-transparent`}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input 
                      name="password" type="password" required placeholder="Password" 
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white focus:ring-2 ${ringColor} focus:border-transparent`}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-1">
                    <button 
                        type="button"
                        onClick={() => { setView("forgot"); setForgotStep(1); }}
                        className={`text-sm font-semibold ${textColor} hover:underline transition-all`}
                    >
                        Forgot Password?
                    </button>
                  </div>

                  <button 
                    type="submit" disabled={loading} 
                    className={`w-full py-4 mt-2 text-white font-bold rounded-xl bg-gradient-to-r ${btnGradient} hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {loading ? (
                       <span className="flex items-center justify-center gap-2">
                           <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Authenticating...
                       </span>
                    ) : "Sign In ➜"}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-6 animate-fade-in">
                <div className="text-center bg-green-50/80 border border-green-100 text-green-700 p-4 rounded-2xl text-sm">
                  <div className="font-bold mb-1 flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      OTP Sent Successfully!
                  </div>
                  <span className="font-mono text-xs text-green-600/80 tracking-wide">{maskedEmail}</span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Secure Code</label>
                  <input 
                    type="text" required maxLength="6" placeholder="• • • • • •"
                    className="w-full p-4 text-center text-3xl tracking-[1em] font-mono bg-gray-50 border-2 border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                    {loading ? "Verifying Code..." : "Verify & Access Dashboard"}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                    ← Use a different account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ==========================
              FORGOT PASSWORD VIEW
           ========================== */}
        {view === "forgot" && (
            <div className="animate-fade-in transition-all duration-300">
                {forgotStep === 1 && (
                    <form onSubmit={handleForgotStep1} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-focus-within:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <input 
                                type="email" required placeholder="Registered Email Address"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                            />
                        </div>

                        <div className="pt-2 space-y-3">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                                {loading ? "Locating Account..." : "Send OTP"}
                            </button>
                            <button type="button" onClick={() => setView("login")} className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {forgotStep === 2 && (
                    <form onSubmit={handleForgotStep2} className="space-y-6">
                        <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${iconBg}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
                             <div className="text-xs">
                                <span className="block font-semibold">Verification code sent</span>
                                <span className="opacity-80 break-all">{forgotEmail}</span>
                             </div>
                        </div>

                        <div>
                            <input 
                                type="text" required maxLength="6" placeholder="• • • • • •"
                                className={`w-full p-4 text-center text-3xl tracking-[1em] font-mono bg-gray-50 border-2 border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-transparent focus:ring-4 ${ringColor}`}
                                value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)}
                            />
                        </div>

                        <div className="pt-2 space-y-3">
                            <button type="submit" disabled={loading} className={`w-full py-4 bg-gradient-to-r ${btnGradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300`}>
                                {loading ? "Checking Code..." : "Verify Code"}
                            </button>
                            <button type="button" onClick={() => setForgotStep(1)} className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                                ← Change Email Address
                            </button>
                        </div>
                    </form>
                )}

                {forgotStep === 3 && (
                    <form onSubmit={handleForgotStep3} className="space-y-5">
                        <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center border border-green-100 font-medium mb-2 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Code verified. Create a new password.
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-focus-within:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input 
                                    type="password" required placeholder="New Password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-focus-within:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <input 
                                    type="password" required placeholder="Confirm New Password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-300">
                                {loading ? "Updating Security..." : "Secure My Account"}
                            </button>
                            <button type="button" onClick={() => { setView("login"); setForgotStep(1); }} className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                                Cancel & Return
                            </button>
                        </div>
                    </form>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default Login;