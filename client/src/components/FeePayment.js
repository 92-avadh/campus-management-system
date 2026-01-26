import React, { useState } from "react";
import axios from "axios";

const FeePayment = ({ studentId, amount, onPageRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleMockPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/payment/mock-verify", {
        studentId,
      });

      if (res.data.success) {
        setReceiptData({
          transactionId: `TXN${Math.floor(Math.random() * 1000000000)}`,
          date: new Date().toLocaleString(),
          amount: amount,
          status: "SUCCESS",
          studentId: studentId
        });
        setShowReceipt(true);
      }
    } catch (error) {
      alert("❌ Demo payment failed. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl">
      <h3 className="text-xl font-bold dark:text-white mb-1 text-center">Academic Fee Payment</h3>
      
      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl my-6 text-center">
        <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-widest">Total Amount Due</p>
        {/* FIXED: amount is now correctly displayed from props */}
        <p className="text-4xl font-black text-red-700">₹{amount}</p>
      </div>
      
      <button
        onClick={handleMockPayment}
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
          loading ? "bg-gray-200 text-gray-400" : "bg-red-700 text-white hover:bg-red-800 shadow-xl shadow-red-900/20"
        }`}
      >
        {loading ? "Verifying Transaction..." : "Pay Admission Fee (Demo)"}
      </button>

      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border-t-[12px] border-emerald-500">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-black dark:text-white">Payment Successful</h2>
            </div>
            <div className="space-y-4 border-y py-6 dark:border-gray-800">
               <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase">TXN ID</span><span className="dark:text-white font-mono">{receiptData.transactionId}</span></div>
               <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase">Date</span><span className="dark:text-white">{receiptData.date}</span></div>
               <div className="flex justify-between items-center pt-2"><span className="text-gray-900 dark:text-white font-black">Amount Paid</span><span className="text-2xl font-black text-emerald-600">₹{receiptData.amount}</span></div>
            </div>
            <button onClick={() => { setShowReceipt(false); onPageRefresh(); }} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold">Close Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePayment;