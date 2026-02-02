import React, { useState } from "react";
import { FaPlus, FaTrash, FaSave, FaCalendarAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../apiConfig";

const FacultyTimetable = ({ user }) => {
  // Initial state with one empty row
  const [rows, setRows] = useState([
    { time: "", subject: "", room: "" }
  ]);
  const [loading, setLoading] = useState(false);

  // Handle input changes for specific rows
  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  // Add a new empty row
  const addRow = () => {
    setRows([...rows, { time: "", subject: "", room: "" }]);
  };

  // Remove a row
  const removeRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // Submit to Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.department) return alert("Error: Department not found for faculty.");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/upload-timetable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          department: user.department, 
          schedule: rows.map(r => ({ ...r, facultyName: user.name })) // Auto-add faculty name
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("✅ Timetable Published Successfully!");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <FaCalendarAlt size={24} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Daily Timetable</h2>
            <p className="text-gray-500 dark:text-gray-400">Manage today's schedule for {user.department} Department</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                <div className="col-span-3">Time Slot</div>
                <div className="col-span-5">Subject</div>
                <div className="col-span-3">Room No.</div>
                <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Input Rows */}
            {rows.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                        <input 
                            required
                            placeholder="e.g. 09:00 - 10:00"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition"
                            value={row.time}
                            onChange={(e) => handleChange(index, "time", e.target.value)}
                        />
                    </div>
                    <div className="col-span-5">
                        <input 
                            required
                            placeholder="Subject Name"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition"
                            value={row.subject}
                            onChange={(e) => handleChange(index, "subject", e.target.value)}
                        />
                    </div>
                    <div className="col-span-3">
                        <input 
                            required
                            placeholder="Room/Lab"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition"
                            value={row.room}
                            onChange={(e) => handleChange(index, "room", e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 text-center">
                        {rows.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeRow(index)}
                                className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button 
                type="button" 
                onClick={addRow}
                className="px-6 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-2"
            >
                <FaPlus /> Add Period
            </button>
            <div className="flex-1"></div>
            <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? "Publishing..." : <><FaSave /> Publish Schedule</>}
            </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyTimetable;