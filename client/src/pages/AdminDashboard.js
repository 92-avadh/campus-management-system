import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("applications"); // Default to pending applications
  const [applications, setApplications] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  
  // State for Faculty Form
  const [facultyForm, setFacultyForm] = useState({
    name: "", email: "", phone: "", department: "", designation: ""
  });

  // --- 1. FETCH PENDING APPLICATIONS ON LOAD ---
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/applications");
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // --- 2. HANDLE APPROVE ---
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this student?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approve-student/${id}`, {
        method: "POST"
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Student Approved!\nID: ${data.userId}`);
        fetchApplications(); // Refresh list
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Server Error during approval.");
    }
  };

  // --- 3. HANDLE REJECT ---
  const handleReject = async (id) => {
    if (!window.confirm("Reject this application? This cannot be undone.")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/reject-student/${id}`, { method: "POST" });
      alert("Application Rejected.");
      fetchApplications(); // Refresh list
    } catch (error) {
      alert("Server Error");
    }
  };

  // --- 4. HANDLE ADD FACULTY ---
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/admin/add-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facultyForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ Faculty Added!\nID: ${data.facultyId}`);
        setFacultyForm({ name: "", email: "", phone: "", department: "", designation: "" }); // Reset Form
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Server Error: Unable to add faculty.");
    }
  };

  // --- HELPER: Fix Image URLs (Windows/Mac path issues) ---
  const getFileUrl = (path) => {
    if (!path) return "#";
    // Replace backslashes (Windows) with forward slashes
    const cleanPath = path.replace(/\\/g, "/"); 
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage admissions and faculty</p>
          </div>
          <button onClick={fetchApplications} className="text-sm bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm">
            Refresh Data ↻
          </button>
        </header>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'applications' ? 'bg-red-50 text-red-700 border-b-4 border-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab("applications")}
            >
              Admission Requests ({applications.length})
            </button>
            <button
              className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'faculty' ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab("faculty")}
            >
              Add Faculty (Manual)
            </button>
          </div>

          {/* TAB CONTENT 1: Admission Requests Table */}
          {activeTab === "applications" && (
            <div className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-xl">No pending applications.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-4 rounded-tl-xl">Photo</th>
                        <th className="p-4">Student Details</th>
                        <th className="p-4">Course & Marks</th>
                        <th className="p-4">Documents</th>
                        <th className="p-4 rounded-tr-xl text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                              <img 
                                src={getFileUrl(app.photo)} 
                                alt="Student" 
                                className="h-full w-full object-cover"
                                onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Img"} 
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{app.name}</p>
                            <p className="text-sm text-gray-500">{app.email}</p>
                            <p className="text-xs text-gray-400">{app.phone}</p>
                          </td>
                          <td className="p-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">{app.course}</span>
                            <p className="text-sm font-semibold mt-1">Score: {app.percentage}%</p>
                          </td>
                          <td className="p-4 space-y-2">
                            <a 
                              href={getFileUrl(app.photo)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="block text-xs text-blue-600 hover:underline"
                            >
                              View Photo ↗
                            </a>
                            <a 
                              href={getFileUrl(app.marksheet)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="block text-xs text-blue-600 hover:underline"
                            >
                              View Marksheet ↗
                            </a>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => handleApprove(app._id)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                                title="Approve"
                              >
                                ✅
                              </button>
                              <button 
                                onClick={() => handleReject(app._id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                title="Reject"
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: Add Faculty Form */}
          {activeTab === "faculty" && (
            <div className="p-10">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Faculty Member</h2>
                  <p className="text-gray-500">Create login credentials for teaching staff.</p>
                </div>

                <form onSubmit={handleAddFaculty} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                  
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Dr. Amit Shah"
                        className="w-full border px-4 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                        value={facultyForm.name}
                        onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="faculty@college.edu"
                        className="w-full border px-4 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                        value={facultyForm.email}
                        onChange={(e) => setFacultyForm({...facultyForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Phone & Department Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                      <input 
                        required 
                        type="tel" 
                        placeholder="9876543210"
                        className="w-full border px-4 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                        value={facultyForm.phone}
                        onChange={(e) => setFacultyForm({...facultyForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                      <select 
                        required
                        className="w-full border px-4 py-2 rounded-lg outline-none focus:border-blue-500 bg-white transition-colors"
                        value={facultyForm.department}
                        onChange={(e) => setFacultyForm({...facultyForm, department: e.target.value})}
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Management">Management</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Designation</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Senior Professor"
                      className="w-full border px-4 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                      value={facultyForm.designation}
                      onChange={(e) => setFacultyForm({...facultyForm, designation: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/30"
                  >
                    + Create Faculty Account
                  </button>

                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;