import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSave, FaCalendarAlt, FaBan, FaCheckCircle, FaClock, FaEdit } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig";

const FacultyTimetable = ({ user, subjects }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([{ time: "", subject: "", room: "" }]);
  const [allSchedule, setAllSchedule] = useState([]); 
  const [loading, setLoading] = useState(false);

  // ✅ Fetch ALL Upcoming Schedule (No Date Filter required for view)
  const fetchSchedule = useCallback(async () => {
    if (!user.department) return;
    try {
        const res = await fetch(`${API_BASE_URL}/faculty/timetable?department=${encodeURIComponent(user.department)}`);
        const data = await res.json();
        setAllSchedule(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, [user.department]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // ✅ Cancel/Restore Function
  const handleCancelClass = async (slotId, date) => {
    if(!window.confirm("Confirm: Cancel/Restore this class?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/faculty/cancel-class`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                department: user.department, 
                date: date, 
                slotId 
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            fetchSchedule();
        }
    } catch (err) { alert("Error updating status"); }
  };

  // ✅ Edit Function: Load data into form & delete old entry
  const handleEditClass = async (slot, rawDate) => {
    if(!window.confirm("Edit this class? It will be moved to the form above for updating.")) return;
    
    // 1. Populate Form
    const dateStr = new Date(rawDate).toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setRows([{ time: slot.time, subject: slot.subject, room: slot.room }]);
    
    // 2. Delete old entry from DB
    try {
      await fetch(`${API_BASE_URL}/faculty/delete-class-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: user.department, date: rawDate, slotId: slot._id })
      });
      fetchSchedule(); // Refresh list to show it's gone from table
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    } catch(err) { console.error(err); }
  };

  // Form Handlers
  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };
  const addRow = () => setRows([...rows, { time: "", subject: "", room: "" }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/upload-timetable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          department: user.department, 
          date: selectedDate, 
          schedule: rows.map(r => ({ ...r, facultyName: user.name })) 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Timetable Published!");
        setRows([{ time: "", subject: "", room: "" }]); 
        fetchSchedule(); 
      } else { alert("❌ " + data.message); }
    } catch (err) { alert("Error"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <FaCalendarAlt size={24} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Daily Timetable</h2>
            <p className="text-gray-500 dark:text-gray-400">Manage schedule for {user.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* === PUBLISH BOX === */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <FaPlus className="text-blue-500" /> Upload / Edit Schedule
            </h3>
            
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
                <input type="date" required className="w-full md:w-1/3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition"
                    value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        <div className="col-span-3">Time</div>
                        <div className="col-span-5">Subject</div>
                        <div className="col-span-3">Room</div>
                        <div className="col-span-1 text-center">Del</div>
                    </div>
                    {rows.map((row, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <input required placeholder="09:00 - 10:00" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition text-sm"
                                    value={row.time} onChange={(e) => handleChange(index, "time", e.target.value)} />
                            </div>
                            <div className="col-span-5">
                                <select required className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition appearance-none text-sm"
                                    value={row.subject} onChange={(e) => handleChange(index, "subject", e.target.value)}>
                                <option value="">Select Subject</option>
                                {subjects && subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3">
                                <input required placeholder="Room 101" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition text-sm"
                                    value={row.room} onChange={(e) => handleChange(index, "room", e.target.value)} />
                            </div>
                            <div className="col-span-1 text-center">
                                {rows.length > 1 && <button type="button" onClick={() => removeRow(index)} className="p-3 text-red-400 hover:bg-red-50 rounded-lg"><FaTrash /></button>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={addRow} className="px-6 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-2"><FaPlus /> Add Row</button>
                    <div className="flex-1"></div>
                    <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition flex items-center gap-2 disabled:opacity-50">{loading ? "Publishing..." : <><FaSave /> Publish</>}</button>
                </div>
            </form>
        </div>

        {/* === UPCOMING CLASSES TABLE (Student Style) === */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <FaClock className="text-indigo-500" /> Upcoming Schedule
            </h3>

            {allSchedule.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <p className="text-gray-400 font-bold">No upcoming classes found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-400">
                                <th className="py-4 px-4">Date</th>
                                <th className="py-4 px-4">Time</th>
                                <th className="py-4 px-4">Subject</th>
                                <th className="py-4 px-4">Room</th>
                                <th className="py-4 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {allSchedule.map((slot) => {
                                const dateObj = new Date(slot.rawDate);
                                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                return (
                                <tr key={slot._id} className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${slot.isCancelled ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{dateStr}</td>
                                    <td className={`py-4 px-4 font-bold ${slot.isCancelled ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>{slot.time}</td>
                                    <td className={`py-4 px-4 font-bold ${slot.isCancelled ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>{slot.subject}</td>
                                    <td className="py-4 px-4 text-sm text-gray-500">{slot.room}</td>
                                    <td className="py-4 px-4 text-center flex justify-center gap-2">
                                        {/* Edit Button */}
                                        <button onClick={() => handleEditClass(slot, slot.rawDate)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
                                            <FaEdit />
                                        </button>
                                        {/* Cancel/Restore Button */}
                                        <button onClick={() => handleCancelClass(slot._id, slot.rawDate)} 
                                            className={`p-2 rounded-lg transition ${slot.isCancelled ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                            title={slot.isCancelled ? "Restore Class" : "Cancel Class"}>
                                            {slot.isCancelled ? <FaCheckCircle /> : <FaBan />}
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default FacultyTimetable;