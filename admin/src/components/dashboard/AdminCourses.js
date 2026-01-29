import React, { useState, useEffect } from "react";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", subjects: "" });

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const subjectsArray = newCourse.subjects.split(",").map(s => s.trim());
    try {
      await fetch("http://localhost:5000/api/admin/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCourse.name, subjects: subjectsArray })
      });
      setNewCourse({ name: "", subjects: "" });
      fetchCourses();
    } catch (err) { alert("Failed to add course"); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
      {/* Add Form */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 h-fit">
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">Add New Course</h2>
        <form onSubmit={handleAddCourse} className="space-y-4">
          <input 
            className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Course Name (e.g., BCA Sem 1)" 
            value={newCourse.name} 
            onChange={e => setNewCourse({...newCourse, name: e.target.value})} 
            required
          />
          <textarea 
            className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Subjects (comma separated)" 
            rows="3"
            value={newCourse.subjects} 
            onChange={e => setNewCourse({...newCourse, subjects: e.target.value})}
            required
          />
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg transition active:scale-95">Add Course</button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">Existing Courses</h2>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {courses.map(c => (
            <div key={c._id} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{c.name}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {c.subjects.map(sub => (
                  <span key={sub} className="text-xs bg-white dark:bg-gray-600 border dark:border-gray-500 px-3 py-1 rounded-full font-semibold text-gray-600 dark:text-gray-200">{sub}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;