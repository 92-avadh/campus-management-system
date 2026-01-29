import React from "react";

const FacultyNotices = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-8">📢 Create Announcement</h2>
      <form className="space-y-5">
        <input type="text" placeholder="Title" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-bold focus:ring-2 focus:ring-blue-500 dark:text-white" />
        <textarea rows="4" placeholder="Message..." className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-none font-medium focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"></textarea>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">Publish</button>
      </form>
    </div>
  );
};
export default FacultyNotices;