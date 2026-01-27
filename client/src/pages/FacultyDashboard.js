import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Material upload states
  const [subjects, setSubjects] = useState([]);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    subject: "",
    file: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });
  const [myMaterials, setMyMaterials] = useState([]);

  
  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      console.log("Faculty User Data:", parsedUser); // Debug log
      setUser(parsedUser);
      fetchStudents(parsedUser.department);
      fetchSubjects(parsedUser.department);
      
      // Handle different ID field names (_id, id, userId)
      const facultyId = parsedUser._id || parsedUser.id || parsedUser.userId;
      if (facultyId) {
        fetchMyMaterials(facultyId);
      } else {
        console.error("No ID found in user object:", parsedUser);
      }
    }
  }, [navigate]);

  // --- 2. FETCH STUDENTS ---
  const fetchStudents = async (dept) => {
    try {
      const response = await fetch(`http://localhost:5000/api/faculty/students?department=${encodeURIComponent(dept)}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // --- 3. FETCH SUBJECTS ---
  const fetchSubjects = async (courseName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${encodeURIComponent(courseName)}`);
      const data = await response.json();
      if (data.subjects) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // --- 4. FETCH MY MATERIALS ---
  const fetchMyMaterials = async (facultyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/faculty/my-materials/${facultyId}`);
      const data = await response.json();
      setMyMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMyMaterials([]);
    }
  };

  // --- 5. HANDLE MATERIAL UPLOAD ---
  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    
    if (!materialForm.title || !materialForm.subject || !materialForm.file) {
      setUploadMessage({ type: "error", text: "Please fill all fields and select a file" });
      return;
    }

    // Get the faculty ID (handle different field names)
    const facultyId = user._id || user.id || user.userId;
    
    if (!facultyId) {
      setUploadMessage({ type: "error", text: "Faculty ID not found. Please login again." });
      console.error("User object:", user);
      return;
    }

    setUploadLoading(true);
    setUploadMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("title", materialForm.title);
    formData.append("course", user.department.toUpperCase().trim());
    formData.append("subject", materialForm.subject);
    formData.append("uploadedBy", facultyId);
    formData.append("material", materialForm.file);

    console.log("Uploading material with:", {
      facultyId,
      department: user.department,
    }); // Debug log

    try {
      const response = await fetch("http://localhost:5000/api/faculty/upload-material", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({ type: "success", text: "Material uploaded successfully!" });
        setMaterialForm({ title: "", subject: "", file: null });
        document.getElementById("fileUpload").value = "";
        fetchMyMaterials(facultyId);
      } else {
        setUploadMessage({ type: "error", text: data.message || "Upload failed" });
      }
    } catch (error) {
      setUploadMessage({ type: "error", text: "Upload failed: " + error.message });
    } finally {
      setUploadLoading(false);
    }
  };

  // --- 6. DELETE MATERIAL ---
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/faculty/material/${materialId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setUploadMessage({ type: "success", text: "Material deleted successfully" });
        const facultyId = user._id || user.id || user.userId;
        fetchMyMaterials(facultyId);
      } else {
        setUploadMessage({ type: "error", text: "Failed to delete material" });
      }
    } catch (error) {
      setUploadMessage({ type: "error", text: "Error deleting material" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex transition-colors duration-300">
      
      {/* === SIDEBAR PANEL === */}
      <aside className="w-64 bg-blue-900 dark:bg-black text-white flex flex-col shadow-2xl sticky top-0 h-screen z-20 transition-colors">
        <div className="p-6 border-b border-blue-800 dark:border-gray-800">
          <h2 className="text-2xl font-bold tracking-wider">FACULTY<br/><span className="text-blue-300 text-lg">PORTAL</span></h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === "dashboard" ? "bg-white text-blue-900 font-bold" : "hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100"}`}
          >
            📊 Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab("attendance")} 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === "attendance" ? "bg-white text-blue-900 font-bold" : "hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100"}`}
          >
            📅 Take Attendance
          </button>

          <button 
            onClick={() => setActiveTab("notices")} 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === "notices" ? "bg-white text-blue-900 font-bold" : "hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100"}`}
          >
            📢 Send Notice
          </button>

          <button 
            onClick={() => setActiveTab("material")} 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === "material" ? "bg-white text-blue-900 font-bold" : "hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100"}`}
          >
            📂 Upload Material
          </button>
        </nav>

        <div className="p-6 border-t border-blue-800 dark:border-gray-800">
          <button onClick={handleLogout} className="w-full bg-blue-800 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700 py-3 rounded text-sm font-bold shadow-inner transition">LOGOUT</button>
        </div>
      </aside>


      {/* === MAIN CONTENT AREA === */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 transition-colors border-b dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'dashboard' && 'Faculty Dashboard'}
              {activeTab === 'attendance' && 'Class Attendance'}
              {activeTab === 'notices' && 'Broadcast Notice'}
              {activeTab === 'material' && 'Study Materials'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
              {user.name} | {user.department} Department
            </p>
          </div>
          <div className="flex items-center gap-6">
             <ThemeToggle />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">

          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/30">
                  <h3 className="text-lg font-semibold opacity-80">Enrolled Students (Paid)</h3>
                  <p className="text-4xl font-bold">{students.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 font-semibold">Department</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{user.department}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 font-semibold">Materials Uploaded</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{Array.isArray(myMaterials) ? myMaterials.length : 0}</p>
                </div>
              </div>

              {/* Paid Students Table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Students ({user.department})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Student ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Fee Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-bold text-gray-700 dark:text-gray-200">{student.userId}</td>
                            <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{student.name}</td>
                            <td className="p-4"><span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">{student.course}</span></td>
                            <td className="p-4">
                              <span className="text-emerald-600 font-bold">✅ Paid</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No paid students found for the {user.department} department.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 2. ATTENDANCE VIEW */}
          {activeTab === "attendance" && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">Daily Attendance</h2>
                 <input type="date" className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              
              {students.length === 0 ? (
                <p className="text-gray-500">No paid students available for attendance.</p>
              ) : (
                <div className="space-y-3">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.userId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300">PRESENT</button>
                        <button className="px-4 py-2 rounded-lg text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300">ABSENT</button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition">Submit Attendance Sheet</button>
                </div>
              )}
            </div>
          )}

          {/* 3. NOTICES VIEW */}
          {activeTab === "notices" && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Create New Notice</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notice Title</label>
                  <input type="text" placeholder="e.g. Mid-Sem Exam Schedule" className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notice Content</label>
                  <textarea rows="4" placeholder="Enter full details here..." className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                  <select className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>All Students</option>
                    <option>Classes</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition">Publish Notice</button>
              </form>
            </div>
          )}

          {/* 4. MATERIALS VIEW */}
          {activeTab === "material" && (
            <div className="space-y-6">
              {/* Upload Form */}
              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Upload Study Material</h2>
                
                {uploadMessage.text && (
                  <div className={`p-4 rounded-lg mb-4 ${uploadMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {uploadMessage.text}
                  </div>
                )}

                <form onSubmit={handleMaterialUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Material Title</label>
                    <input 
                      type="text" 
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                      placeholder="e.g. Chapter 5 - Data Structures Notes" 
                      className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>
                    <select 
                      value={materialForm.subject}
                      onChange={(e) => setMaterialForm({...materialForm, subject: e.target.value})}
                      className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((subject, idx) => (
                        <option key={idx} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Upload File (PDF, DOC, PPT)</label>
                    <input 
                      type="file" 
                      id="fileUpload"
                      onChange={(e) => setMaterialForm({...materialForm, file: e.target.files[0]})}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      className="w-full p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    {materialForm.file && (
                      <p className="text-xs text-gray-500 mt-1">Selected: {materialForm.file.name}</p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploadLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50"
                  >
                    {uploadLoading ? "Uploading..." : "Upload Material"}
                  </button>
                </form>
              </div>

              {/* My Uploaded Materials */}
              <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Uploaded Materials</h2>
                
                {!Array.isArray(myMaterials) || myMaterials.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No materials uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myMaterials.map((material) => (
                      <div key={material._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white">{material.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {material.subject} • {new Date(material.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteMaterial(material._id)}
                          className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm font-bold transition"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;