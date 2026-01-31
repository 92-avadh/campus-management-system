import React, { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

const StudentAttendance = ({ user }) => {
  const [mode, setMode] = useState("scan");
  const [camera, setCamera] = useState(false);
  const [history, setHistory] = useState([]);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    if (mode === "history" && user) {
      fetch(`http://localhost:5000/api/student/attendance/${user.id || user._id}`)
        .then(res => res.json()).then(data => setHistory(data)).catch(console.error);
    }
  }, [mode, user]);

  const handleScan = async (result) => {
    if (result) {
      setCamera(false);
      try {
        const res = await fetch(`http://localhost:5000/api/student/mark-attendance`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: user.id || user._id, qrData: result?.text })
        });
        const data = await res.json();
        alert(data.success ? "✅ Success" : "❌ " + data.message);
      } catch (e) { alert("Error"); }
    }
  };

  // Calendar Logic
  const renderCalendar = () => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(month.getFullYear(), month.getMonth(), d).toDateString();
      const present = history.some(h => new Date(h.date).toDateString() === dateStr);
      days.push(
        <div key={d} className={`h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${present ? 'bg-green-100 border-green-200' : 'bg-white dark:bg-gray-800 border-transparent'}`}>
          <span className={`text-sm font-bold ${present ? 'text-green-700' : 'text-gray-400'}`}>{d}</span>
          {present && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Stylish Toggle */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-xl flex mb-10 border border-gray-100 dark:border-gray-700 relative">
        <button 
          onClick={() => { setMode("scan"); setCamera(false); }} 
          className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 relative z-10 ${mode === "scan" ? "text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
        >
          📷 Scan QR
        </button>
        <button 
          onClick={() => setMode("history")} 
          className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 relative z-10 ${mode === "history" ? "text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
        >
          📅 History
        </button>
        
        {/* Sliding Background */}
        <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-rose-600 rounded-full transition-all duration-300 ${mode === "scan" ? "left-2" : "left-[calc(50%+4px)]"}`}></div>
      </div>

      {mode === "scan" && (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
          {!camera ? (
            <button onClick={() => setCamera(true)} className="group relative w-72 h-72 rounded-[3rem] bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-2xl shadow-rose-500/40 flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-black/10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-7xl mb-4 group-hover:-translate-y-2 transition-transform duration-300">📸</span>
              <span className="text-xl font-black tracking-wider uppercase">Tap to Scan</span>
              <p className="text-xs text-rose-100 mt-2 opacity-80">Mark your attendance</p>
            </button>
          ) : (
            <div className="w-full max-w-md bg-black p-4 rounded-[3rem] shadow-2xl border-8 border-gray-900 relative overflow-hidden">
              <button onClick={() => setCamera(false)} className="absolute top-6 right-6 z-20 bg-white/20 text-white p-3 rounded-full backdrop-blur-md hover:bg-red-600 transition-colors">✕</button>
              <h2 className="text-white text-center font-bold mb-4 mt-2">Point at Screen</h2>
              <div className="rounded-2xl overflow-hidden bg-gray-800">
                <QrReader onResult={handleScan} constraints={{ facingMode: "environment" }} style={{ width: "100%" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "history" && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[3rem] animate-in fade-in slide-in-from-bottom-8">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => setMonth(new Date(month.setMonth(month.getMonth()-1)))} className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:scale-110 transition">◀</button>
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => setMonth(new Date(month.setMonth(month.getMonth()+1)))} className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:scale-110 transition">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-3 text-center mb-2">
             {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-xs font-bold text-gray-400">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
          
          <div className="mt-8 flex justify-center gap-6 text-sm font-bold text-gray-500">
             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Present</div>
             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-gray-300 rounded-full"></span> Absent</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentAttendance;