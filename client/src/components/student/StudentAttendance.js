import React, { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { FaFilePdf } from "react-icons/fa"; // ✅ IMPORTED ICON
import { API_BASE_URL } from "../../apiConfig";

const StudentAttendance = ({ user }) => {
  const [mode, setMode] = useState("code"); 
  const [camera, setCamera] = useState(false);
  const [history, setHistory] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    if (mode === "history" && user) {
      fetch(`${API_BASE_URL}/student/attendance/${user.id || user._id}`)
        .then(res => res.json()).then(data => setHistory(data)).catch(console.error);
    }
  }, [mode, user]);

  const handleScan = async (result) => {
    if (result) {
      setCamera(false);
      submitAttendance({ qrData: result?.text });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.length < 6) return alert("Enter 6-digit code");
    submitAttendance({ manualCode });
  };

  const submitAttendance = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/student/mark-attendance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id || user._id, ...payload })
      });
      const data = await res.json();
      if(data.success) {
          alert("✅ Success: " + data.message);
          setMode("history"); 
          setManualCode("");
      } else {
          alert("❌ " + data.message);
      }
    } catch (e) { alert("Server Connection Error"); }
    finally { setLoading(false); }
  };

  // ✅ NEW FUNCTION: DOWNLOAD REPORT
  const downloadReport = () => {
    const url = `${API_BASE_URL}/student/download-report/${user.id || user._id}`;
    window.open(url, "_blank");
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(month.getFullYear(), month.getMonth(), d).toDateString();
      const present = history.some(h => new Date(h.date).toDateString() === dateStr);
      days.push(
        <div key={d} className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${present ? 'bg-green-100 border-green-200' : 'bg-white dark:bg-gray-800 border-transparent'}`}>
          <span className={`text-xs font-bold ${present ? 'text-green-700' : 'text-gray-400'}`}>{d}</span>
          {present && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-0.5"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-lg flex mb-8 border border-gray-100 dark:border-gray-700">
        {["code", "scan", "history"].map((m) => (
            <button 
                key={m}
                onClick={() => { setMode(m); setCamera(false); }} 
                className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${mode === m ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
                {m === "code" ? "🔢 Enter Code" : m === "scan" ? "📷 Scan QR" : "📅 History"}
            </button>
        ))}
      </div>

      {mode === "code" && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-gray-700 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⌨️</div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Enter Session Code</h2>
            <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code shown on the faculty screen.</p>
            
            <form onSubmit={handleManualSubmit}>
                <input 
                    type="text" 
                    placeholder="000000" 
                    className="w-full text-center text-4xl font-black tracking-[0.5em] p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 focus:border-indigo-500 outline-none transition-all mb-6 dark:text-white"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.replace(/\D/g,''))}
                    maxLength={6}
                />
                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50">
                    {loading ? "Verifying..." : "Mark Present"}
                </button>
            </form>
        </div>
      )}

      {mode === "scan" && (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
          {!camera ? (
            <button onClick={() => setCamera(true)} className="group relative w-72 h-72 rounded-[3rem] bg-black text-white shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <span className="text-6xl mb-4">📸</span>
              <span className="text-lg font-bold">Tap to Open Camera</span>
            </button>
          ) : (
            <div className="w-full max-w-md bg-black p-4 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <button onClick={() => setCamera(false)} className="absolute top-6 right-6 z-20 bg-white/20 text-white p-3 rounded-full backdrop-blur-md">✕</button>
              <div className="rounded-2xl overflow-hidden bg-gray-800">
                <QrReader onResult={handleScan} constraints={{ facingMode: "environment" }} style={{ width: "100%" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "history" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-bottom-4">
          
          {/* ✅ DOWNLOAD BUTTON */}
          <div className="flex justify-end mb-4">
            <button 
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-xs font-bold transition"
            >
                <FaFilePdf /> Download Report
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setMonth(new Date(month.setMonth(month.getMonth()-1)))} className="p-2 hover:bg-gray-100 rounded-full">◀</button>
            <h2 className="font-black text-gray-800 dark:text-white uppercase tracking-widest">{month.toLocaleString('default', { month: 'short', year: 'numeric' })}</h2>
            <button onClick={() => setMonth(new Date(month.setMonth(month.getMonth()+1)))} className="p-2 hover:bg-gray-100 rounded-full">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
             {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};
export default StudentAttendance;