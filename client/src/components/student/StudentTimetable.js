import React, { useState, useEffect } from "react";
import { FaClock, FaTimesCircle } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig";

const StudentTimetable = ({ user }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user) return;
      try {
        let dept = user.course || user.department; 
        
        // Frontend Normalization Safety
        if (dept) {
            const upperDept = dept.toUpperCase();
            if (upperDept.includes("BCA") || upperDept.includes("COMPUTER")) dept = "BCA";
            else if (upperDept.includes("BBA") || upperDept.includes("BUSINESS")) dept = "BBA";
            else if (upperDept.includes("BCOM") || upperDept.includes("COMMERCE")) dept = "BCOM";
        }

        const res = await fetch(`${API_BASE_URL}/student/timetable/${encodeURIComponent(dept)}`);
        const data = await res.json();
        setSchedule(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [user]);

  // Check if class is LIVE
  const isClassLive = (timeRange, rawDate) => {
    try {
      if (!rawDate) return false;
      const slotDate = new Date(rawDate);
      const today = new Date();
      
      // Match Day/Month/Year
      if (slotDate.getDate() !== today.getDate() || 
          slotDate.getMonth() !== today.getMonth() || 
          slotDate.getFullYear() !== today.getFullYear()) {
          return false;
      }

      // Check Time Match
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Schedule...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      
      {/* HEADER - ICON ONLY */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
            <FaClock size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {schedule.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold">
                No upcoming classes found.
            </div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-6">Date</th> 
                        <th className="p-6">Time</th>
                        <th className="p-6">Subject</th>
                        <th className="p-6">Faculty</th>
                        <th className="p-6">Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {schedule.map((slot, index) => {
                        const live = !slot.isCancelled && isClassLive(slot.time, slot.rawDate);
                        
                        // ✅ FORMAT DATE (Client Side)
                        const dateObj = slot.rawDate ? new Date(slot.rawDate) : new Date();
                        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                        return (
                            <tr key={index} className={`transition-colors border-b last:border-0 ${slot.isCancelled ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"} ${live ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""}`}>
                                
                                {/* 1. DATE */}
                                <td className="p-6 font-bold text-gray-900 dark:text-white whitespace-nowrap align-top">
                                    <div className={slot.isCancelled ? "opacity-50" : ""}>
                                      {dateStr}
                                    </div>
                                </td>

                                {/* 2. TIME & STATUS */}
                                <td className="p-6 align-top">
                                    <div className={`font-bold whitespace-nowrap ${slot.isCancelled ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>
                                        {slot.time}
                                    </div>
                                    
                                    {/* STATUS INDICATORS */}
                                    <div className="mt-1">
                                      {live && (
                                        <span className="inline-block text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse font-bold tracking-wide">
                                          LIVE NOW
                                        </span>
                                      )}
                                      
                                      {/* ✅ CANCELLED BADGE (Fixed Layout) */}
                                      {slot.isCancelled && (
                                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wide border border-red-200">
                                           <FaTimesCircle size={10} /> Cancelled
                                        </span>
                                      )}
                                    </div>
                                </td>

                                {/* 3. SUBJECT */}
                                <td className={`p-6 font-bold align-top ${slot.isCancelled ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                                    {slot.subject}
                                </td>

                                {/* 4. FACULTY */}
                                <td className={`p-6 text-sm align-top ${slot.isCancelled ? "text-gray-300 line-through" : "text-gray-500 dark:text-gray-400"}`}>
                                    {slot.facultyName}
                                </td>

                                {/* 5. ROOM */}
                                <td className={`p-6 text-sm align-top ${slot.isCancelled ? "text-gray-300 line-through" : "text-gray-500 dark:text-gray-400"}`}>
                                    {slot.room}
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