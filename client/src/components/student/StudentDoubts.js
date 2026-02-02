import React, { useState, useEffect } from "react";
// ✅ Added icons for file upload
import { FaPaperPlane, FaFileUpload, FaTimes, FaHistory } from "react-icons/fa";
import { API_BASE_URL, STATIC_BASE_URL } from "../../apiConfig"; 

const StudentDoubts = ({ user }) => {
  const [activeTab, setActiveTab] = useState("ask");
  const [facultyList, setFacultyList] = useState([]);
  const [myDoubts, setMyDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    facultyId: "",
    subject: "",
    question: ""
  });

  // ✅ Helper to construct the correct file URL using BASE_URL
  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    // Replace Windows backslashes with forward slashes
    const cleanPath = filePath.replace(/\\/g, "/");
    // Prepend the server's base URL (e.g., http://192.168.1.5:5000/uploads/file.pdf)
    return `${STATIC_BASE_URL}/${cleanPath}`;
  };

  // ✅ FETCH DATA - ROBUST FIX
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        let departmentToSearch = user.department || user.course || "All";
        departmentToSearch = departmentToSearch.trim().toUpperCase();
        
        console.log("Searching for department:", departmentToSearch);

        const apiUrl = `${API_BASE_URL}/student/faculty-list/${encodeURIComponent(departmentToSearch)}`;
        
        const facRes = await fetch(apiUrl);
        if (facRes.ok) {
            const facData = await facRes.json();
            setFacultyList(facData);
        }

        const studentId = user._id || user.id;
        if (studentId) {
            const doubtRes = await fetch(`${API_BASE_URL}/student/my-doubts/${studentId}`);
            if (doubtRes.ok) {
                setMyDoubts(await doubtRes.json());
            }
        }
        
      } catch (err) { 
        console.error("❌ Error fetching data:", err); 
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  // ✅ SUBMIT DOUBT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("studentId", user._id || user.id);
      data.append("studentName", user.name);
      data.append("course", user.course || user.department || "General");
      data.append("department", user.department || user.course || "General");
      data.append("facultyId", formData.facultyId);
      data.append("subject", formData.subject);
      data.append("question", formData.question);
      
      if (selectedFile) {
        data.append("file", selectedFile);
      }

      const res = await fetch(`${API_BASE_URL}/student/ask-doubt`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Doubt Sent Successfully!");
        setFormData({ facultyId: "", subject: "", question: "" });
        setSelectedFile(null);
        setActiveTab("history");
        
        // Refresh doubts list
        const doubtRes = await fetch(`${API_BASE_URL}/student/my-doubts/${user._id || user.id}`);
        setMyDoubts(await doubtRes.json());
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error("Error sending doubt:", err);
      alert("Error sending doubt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Academic Doubts</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions to your faculty and attach images/documents if needed.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex">
          <button 
            onClick={() => setActiveTab("ask")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "ask" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          >
            <FaPaperPlane /> Ask New
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "history" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          >
            <FaHistory /> History
          </button>
        </div>
      </div>

      {/* --- ASK DOUBT FORM --- */}
      {activeTab === "ask" && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Select Faculty</label>
                <select
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map(fac => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Subject / Topic</label>
                <input 
                  required
                  placeholder="e.g. Java Loops, SQL Joins..."
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Your Question</label>
              <textarea 
                required
                rows="5"
                placeholder="Describe your doubt in detail..."
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white font-medium text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Attachment (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-sm text-gray-600 dark:text-gray-300">
                  <FaFileUpload className="text-indigo-600" />
                  {selectedFile ? "Change File" : "Upload Image/PDF"}
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 animate-in fade-in zoom-in">
                    {selectedFile.name}
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-rose-500">
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || facultyList.length === 0}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Submit Doubt"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- HISTORY UI --- */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {myDoubts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-400 font-bold">No doubts asked yet.</p>
            </div>
          ) : (
            myDoubts.map((doubt) => (
              <div key={doubt._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      doubt.status === "Resolved" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {doubt.status}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    To: {doubt.faculty?.name || "Unknown Faculty"}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{doubt.subject}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    {doubt.question}
                  </p>
                </div>

                {/* ✅ FIXED: Use getFileUrl(doubt.file) instead of direct path */}
                {doubt.file && (
                  <div className="mb-4">
                    <a 
                      href={getFileUrl(doubt.file)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <FaFileUpload /> View Attachment
                    </a>
                  </div>
                )}

                {doubt.status === "Resolved" && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">A</div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">Faculty Answer</p>
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                          {doubt.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDoubts;