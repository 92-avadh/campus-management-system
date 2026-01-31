import React, { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaReply } from "react-icons/fa";
import { API_BASE_URL, BASE_URL } from "../../apiConfig";

// ✅ Accept 'onDoubtResolved' prop
const FacultyDoubts = ({ onDoubtResolved }) => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAnswerId, setActiveAnswerId] = useState(null); 
  const [answerText, setAnswerText] = useState("");

  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const facultyId = user ? (user._id || user.id) : null;

  // 1. Fetch Doubts
  const fetchDoubts = useCallback(async () => {
    if (!facultyId) return;
  
    try {
      const res = await fetch(
        `${API_BASE_URL}/faculty/doubts/${facultyId}`
      );
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [facultyId]);
  

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);  

  // 2. Submit Answer
  const handleSubmitAnswer = async (id) => {
    if (!answerText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/faculty/answer-doubt/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Answer Sent!");
        
        setAnswerText("");           
        setActiveAnswerId(null);     
        await fetchDoubts(); // Refresh local list
        
        // ✅ REFRESH RED DOT IN SIDEBAR
        if (onDoubtResolved) onDoubtResolved(); 
        
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading queries...</div>;

  return (
 <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Student Queries</h2>
        <p className="text-gray-500 dark:text-gray-400">Answer questions raised by your students.</p>
      </div>

      <div className="space-y-6">
        {doubts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
             <p className="text-gray-400 font-bold text-lg">No queries found. Good job! 🎉</p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <div key={doubt._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${doubt.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {doubt.status}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                  {/* Student Name */}
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {doubt.studentName || doubt.student?.name || "Student"} ({doubt.course || doubt.student?.course || "N/A"})
                  </span>
                </div>
              </div>

              <div className="mb-6">
                 <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                   {doubt.subject}
                 </h4>
                 <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border-l-4 border-orange-400">
                   "{doubt.question}"
                 </p>
                 {doubt.file && (
                    <a 
                      href={`${BASE_URL}/${doubt.file.replace(/\\/g, "/")}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-blue-500 underline mt-2 block font-bold"
                    >
                      View Attachment
                    </a>
                 )}
              </div>

              {doubt.status === "Resolved" ? (
                <div className="ml-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                     <FaCheckCircle className="text-green-500" />
                     <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Your Answer:</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/10 p-4 rounded-xl">
                    {doubt.answer}
                  </p>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                   {activeAnswerId === doubt._id ? (
                      <div className="space-y-3 animate-in fade-in zoom-in">
                        <textarea 
                          className="w-full p-4 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          rows="3"
                          placeholder="Type your explanation here..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => setActiveAnswerId(null)}
                             className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                           >
                             Cancel
                           </button>
                           <button 
                             onClick={() => handleSubmitAnswer(doubt._id)}
                             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                           >
                             <FaReply /> Send Answer
                           </button>
                        </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => { setActiveAnswerId(doubt._id); setAnswerText(""); }}
                        className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2"
                      >
                        <FaReply /> Reply to this doubt
                      </button>
                   )}
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyDoubts;