import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE_URL } from "../../apiConfig";

const FacultyAttendance = ({ user, subjects }) => {
  const [qr, setQr] = useState("");
  const [code, setCode] = useState(""); 
  const [active, setActive] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => () => intervalId && clearInterval(intervalId), [intervalId]);

  const generate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/generate-qr`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        // ✅ Hardcoded "Lecture" since selection box is removed
        body: JSON.stringify({ course: user.department, subject: "Lecture", facultyId: user._id || user.id })
      });
      const data = await res.json();
      setQr(data.qrData);
      setCode(data.code); 
    } catch (e) { console.error(e); }
  };

  const start = () => {
    // ✅ Removed Subject Validation
    setActive(true); generate();
    setIntervalId(setInterval(generate, 30000));
  };

  const stop = () => { setActive(false); setQr(""); setCode(""); clearInterval(intervalId); };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
      {!active ? (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto">📅</div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">Start Attendance</h2>
          
          {/* ❌ REMOVED SELECT BOX */}
          
          <button onClick={start} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">Generate Session</button>
        </div>
      ) : (
        <div className="animate-in zoom-in">
          <h2 className="text-2xl font-black text-red-500 animate-pulse mb-2">LIVE SESSION</h2>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Manual Code</p>
             <h1 className="text-5xl font-black text-blue-600 tracking-wider">{code || "...."}</h1>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-lg inline-block mb-6 border-4 border-gray-100">
            {qr && <QRCodeCanvas value={qr} size={200} />}
          </div>
          <p className="text-sm text-gray-500 font-bold mb-8">Refreshes every 30s...</p>
          <button onClick={stop} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">End Session</button>
        </div>
      )}
    </div>
  );
};
export default FacultyAttendance;