import React from "react";
import FeePayment from "../FeePayment"; 

const StudentFees = ({ user, handlePaymentSuccess }) => {
  return (
    <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fee Status</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Academic Year 2025-26</p>
      </div>

      {user.isFeePaid ? (
        // --- PAID STATE (Compact Receipt) ---
        <div className="relative bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden text-center mx-auto">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>

          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-none animate-bounce">
            ✓
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Payment Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Your tuition fees for the current semester have been verified.
          </p>

          <div className="mt-6 inline-block px-5 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref ID</p>
            <p className="text-gray-800 dark:text-white font-mono font-bold text-sm tracking-widest">TXN-{user.userId}</p>
          </div>
        </div>
      ) : (
        // --- UNPAID STATE (Compact Payment Form) ---
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border-2 border-rose-50 dark:border-rose-900/20 mx-auto">
          <div className="flex items-center gap-4 mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
             <div className="text-2xl">⚠️</div>
             <div>
                <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Payment Required</h4>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-300/80 font-bold uppercase">Due: Spring 2026</p>
             </div>
          </div>
          
          {/* Ensure FeePayment component fits nicely */}
          <div className="text-sm">
            <FeePayment studentId={user.userId} amount={5000} onPageRefresh={handlePaymentSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;