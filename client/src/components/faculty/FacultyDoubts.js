import React, { useState, useEffect, useCallback } from "react";

const FacultyDoubts = ({ user }) => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for answering
  const [activeDoubtId, setActiveDoubtId] = useState(null);
  const [answerText, setAnswerText] = useState("");

  // ✅ 1. FETCH DOUBTS (Wrapped in useCallback to fix dependency warning)
  const fetchDoubts = useCallback(async () => {
    try {
      // Handle both _id and id just in case
      const userId = user._id || user.id;
      const res = await fetch(`http://localhost:5000/api/faculty/doubts/${userId}`);
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching doubts:", err);
    }
  }, [user]); // Logic depends on 'user'

  // ✅ 2. USE EFFECT (Now safely depends on fetchDoubts)
  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  // ✅ 3. SUBMIT ANSWER
  const handleSubmitAnswer = async (id) => {
    if (!answerText.trim()) return alert("Please type an answer first.");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/faculty/answer-doubt/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Answer sent to student!");
        setActiveDoubtId(null);
        setAnswerText("");
        fetchDoubts(); // Refresh list using the stable function
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Error sending answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Student Queries</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Resolve academic doubts from your students.</p>
      </div>

      <div className="space-y-6">
        {doubts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-400 font-bold">No queries found. Great job!</p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <div key={doubt._id} className={`p-6 rounded-[2rem] border transition-all ${
              doubt.status === "Pending" 
                ? "bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/30 shadow-lg shadow-indigo-100/50" 
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100"
            }`}>
              
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    doubt.status === "Resolved" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700 animate-pulse"
                  }`}>
                    {doubt.status}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{doubt.studentName || "Student"}</p>
                  <p className="text-xs text-gray-500">{doubt.course} • {doubt.subject}</p>
                </div>
              </div>

              {/* QUESTION */}
              <div className="mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                   <p className="text-gray-800 dark:text-gray-200 font-medium text-sm leading-relaxed">
                     "{doubt.question}"
                   </p>
                </div>
              </div>

              {/* ACTION AREA */}
              {doubt.status === "Resolved" ? (
                <div className="pl-4 border-l-4 border-emerald-400">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Your Answer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{doubt.answer}</p>
                </div>
              ) : (
                <div>
                  {activeDoubtId === doubt._id ? (
                    <div className="animate-in fade-in">
                      <textarea
                        autoFocus
                        rows="3"
                        placeholder="Type your explanation here..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full p-4 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-sm font-medium mb-3"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => { setActiveDoubtId(null); setAnswerText(""); }}
                          className="px-6 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSubmitAnswer(doubt._id)}
                          disabled={loading}
                          className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                          {loading ? "Sending..." : "Submit Answer"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveDoubtId(doubt._id)}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
                    >
                      <span>↩️</span> Reply to Student
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