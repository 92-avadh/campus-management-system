import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const FacultyAttendance = ({ user, subjects }) => {
  const [qr, setQr] = useState("");
  const [active, setActive] = useState(false);
  const [subject, setSubject] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => () => intervalId && clearInterval(intervalId), [intervalId]);

  const generate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/faculty/generate-qr", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ course: user.department, subject, facultyId: user._id || user.id })
      });
      const data = await res.json();
      setQr(data.qrData);
    } catch (e) { console.error(e); }
  };

  const start = () => {
    if (!subject) return alert("Select Subject");
    setActive(true); generate();
    setIntervalId(setInterval(generate, 30000));
  };

  const stop = () => { setActive(false); setQr(""); clearInterval(intervalId); };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
      {!active ? (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto">📅</div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">Start Attendance</h2>
          <select onChange={(e) => setSubject(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 font-bold outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={start} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">Generate Session</button>
        </div>
      ) : (
        <div className="animate-in zoom-in">
          <h2 className="text-2xl font-black text-red-500 animate-pulse mb-6">LIVE SESSION</h2>
          <div className="bg-white p-6 rounded-3xl shadow-lg inline-block mb-8 border-4 border-gray-100">
            {qr && <QRCodeCanvas value={qr} size={220} />}
          </div>
          <p className="text-sm text-gray-500 font-bold mb-8">Refreshing every 30s...</p>
          <button onClick={stop} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">End Session</button>
        </div>
      )}
    </div>
  );
};
export default FacultyAttendance;