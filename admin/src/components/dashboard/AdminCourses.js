import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", subjects: "" });
  const [newSubjectInputs, setNewSubjectInputs] = useState({}); // Local state for "Add Subject" inputs per course

  const fetchCourses = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/courses`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

  // Create new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const subjectsArray = newCourse.subjects.split(",").map(s => s.trim()).filter(s => s !== "");
    try {
      const res = await fetch("http://localhost:5000/api/admin/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCourse.name, subjects: subjectsArray })
      });
      if (res.ok) {
        setNewCourse({ name: "", subjects: "" });
        fetchCourses();
      }
    } catch (err) { alert("Failed to add course"); }
  };

  // Delete whole course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entire course?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-course/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchCourses();
    } catch (err) { console.error(err); }
  };

  // Add single subject to existing course
  const handleAddSingleSubject = async (courseId) => {
    const subjectName = newSubjectInputs[courseId];
    if (!subjectName || !subjectName.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/add-subject/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName.trim() })
      });
      if (res.ok) {
        setNewSubjectInputs({ ...newSubjectInputs, [courseId]: "" });
        fetchCourses();
      }
    } catch (err) { console.error(err); }
  };

  // Delete single subject from course
  const handleDeleteSubject = async (courseId, subjectName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-subject/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName })
      });
      if (res.ok) fetchCourses();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      {/* Add New Course Form */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 h-fit">
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">Create Course</h2>
        <form onSubmit={handleAddCourse} className="space-y-4">
          <input 
            className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
            placeholder="Course Name (e.g., BCA)" 
            value={newCourse.name} 
            onChange={e => setNewCourse({...newCourse, name: e.target.value})} 
            required
          />
          <textarea 
            className="w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
            placeholder="Initial Subjects (comma separated)" 
            rows="3"
            value={newCourse.subjects} 
            onChange={e => setNewCourse({...newCourse, subjects: e.target.value})}
          />
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
            <FaPlus /> Create Course
          </button>
        </form>
      </div>

      {/* Existing Courses List */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-gray-700">
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">Course Management</h2>
        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar [&::-webkit-scrollbar]:hidden">
          {courses.map(c => (
            <div key={c._id} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700 relative group">
              {/* Delete Course Button */}
              <button 
                onClick={() => handleDeleteCourse(c._id)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete Course"
              >
                <FaTrash size={18}/>
              </button>

              <h3 className="font-black text-xl text-indigo-700 dark:text-indigo-400 mb-4">{c.name}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {c.subjects.map(sub => (
                  <span key={sub} className="group/tag flex items-center gap-2 text-xs bg-white dark:bg-gray-600 border dark:border-gray-500 px-3 py-1.5 rounded-full font-bold text-gray-600 dark:text-gray-200">
                    {sub}
                    <button 
                      onClick={() => handleDeleteSubject(c._id, sub)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Single Subject Input */}
              <div className="flex gap-2">
                <input 
                  className="flex-1 p-2 text-sm rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none"
                  placeholder="Add subject..."
                  value={newSubjectInputs[c._id] || ""}
                  onChange={(e) => setNewSubjectInputs({...newSubjectInputs, [c._id]: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSingleSubject(c._id)}
                />
                <button 
                  onClick={() => handleAddSingleSubject(c._id)}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="text-center text-gray-500 italic py-10">No courses available.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;