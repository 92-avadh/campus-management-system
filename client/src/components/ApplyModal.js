import React, { useState, useEffect } from "react";

const ApplyModal = ({ isOpen, onClose, defaultCourse = "" }) => {
  const [loading, setLoading] = useState(false);
  
  // State for Text Fields
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", course: defaultCourse || "",
    dob: "", gender: "", address: "", percentage: ""
  });

  // State for Files (Separate because they are objects, not strings)
  const [files, setFiles] = useState({
    photo: null,
    marksheet: null
  });

  useEffect(() => {
    if (defaultCourse) setFormData(prev => ({ ...prev, course: defaultCourse }));
  }, [defaultCourse]);

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Inputs
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- CREATE FORM DATA (Required for sending files) ---
    const data = new FormData();
    // Append text fields
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    // Append files
    if (files.photo) data.append("photo", files.photo);
    if (files.marksheet) data.append("marksheet", files.marksheet);

    try {
      // Note: We do NOT set 'Content-Type': 'application/json' here.
      // The browser automatically sets the correct Multipart boundary for files.
      const response = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        body: data 
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Application Submitted Successfully!");
        // Reset Form
        setFormData({ name: "", email: "", phone: "", course: "", dob: "", gender: "", address: "", percentage: "" });
        setFiles({ photo: null, marksheet: null });
        onClose();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Server Error: Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-red-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Student Admission Form</h2>
            <p className="text-red-200 text-sm">Please upload valid documents.</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-red-200">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Section 1: Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Birth</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender</label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-red-200 outline-none">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course Applied For</label>
              <select name="course" required value={formData.course} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-red-200 outline-none">
                <option value="">Select Course</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="B.Tech CS">B.Tech CS</option>
                <option value="B.Com">B.Com</option>
              </select>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
              <textarea name="address" required value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none resize-none"></textarea>
            </div>
          </div>

          {/* Section 3: Documents Upload */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Academic Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Previous Class Score (%)</label>
                <input type="number" name="percentage" required value={formData.percentage} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" />
              </div>
              
              {/* FILE INPUT 1: Marksheet */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Marksheet</label>
                <input 
                  type="file" 
                  name="marksheet" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  required 
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-red-200 outline-none" 
                />
              </div>

              {/* FILE INPUT 2: Photo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Student Photo</label>
                <input 
                  type="file" 
                  name="photo" 
                  accept=".jpg,.jpeg,.png"
                  required 
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-red-200 outline-none" 
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'}`}>
            {loading ? "Uploading Documents..." : "Submit Application"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyModal;