import React, { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig";

const StudentTimetable = ({ user }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Fetch Timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        // user.course usually holds "BCA", "BBA", etc.
        // If your user model uses 'department', switch this to user.department
        const dept = user.course || user.department; 
        const res = await fetch(`${API_BASE_URL}/student/timetable/${dept}`);
        const data = await res.json();
        setSchedule(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTimetable();
  }, [user]);

  // Check if class is currently live
  const isClassLive = (timeRange) => {
    try {
      const [start, end] = timeRange.split("-").map(t => t.trim());
      const now = new Date();
      
      const startTime = new Date();
      const [startH, startM] = start.split(":").map(Number);
      startTime.setHours(startH, startM, 0);

      const endTime = new Date();
      const [endH, endM] = end.split(":").map(Number);
      endTime.setHours(endH, endM, 0);

      return now >= startTime && now <= endTime;
    } catch (e) { return false; }
  };

  const handleMarkAttendance = async (subject) => {
    const code = prompt(`Enter the 6-digit code for ${subject}:`);
    if (!code) return;

    setAttendanceLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/student/mark-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId: user._id || user.id, 
          manualCode: code 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Present marked for ${subject}!`);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Server Error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Schedule...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
            <FaClock size={24} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Today's Timetable</h2>
            <p className="text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {schedule.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold">
                No classes scheduled for today.
            </div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-6">Time</th>
                        <th className="p-6">Subject</th>
                        <th className="p-6">Faculty</th>
                        <th className="p-6">Location</th>
                        <th className="p-6 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {schedule.map((slot, index) => {
                        const live = isClassLive(slot.time);
                        return (
                            <tr key={index} className={`transition-colors ${live ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                                <td className="p-6 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    {slot.time}
                                    {live && <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                                </td>
                                <td className="p-6 font-bold text-gray-900 dark:text-white">{slot.subject}</td>
                                <td className="p-6 text-sm text-gray-500 dark:text-gray-400">{slot.facultyName}</td>
                                <td className="p-6 text-sm text-gray-500 dark:text-gray-400">{slot.room}</td>
                                <td className="p-6 text-center">
                                    {live ? (
                                        <button 
                                            onClick={() => handleMarkAttendance(slot.subject)}
                                            disabled={attendanceLoading}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg transition active:scale-95"
                                        >
                                            Mark Present
                                        </button>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-300 dark:text-gray-600">--</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default StudentTimetable;