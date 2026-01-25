import React, { useState } from "react";
import axios from "axios";

const FeePayment = ({ studentId, amount, onPageRefresh }) => {
  // FIXED: These are now used in the handlePayment function below
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true); // Start loading
    try {
      // Step 1: Create Order on Server
      const res = await axios.post("http://localhost:5000/api/payment/checkout", {
        amount,
        studentId,
      });

      const { order } = res.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: "YOUR_RAZORPAY_KEY", // Should be in your .env
        amount: order.amount,
        currency: "INR",
        name: "SDJIC Campus",
        description: "Admission Fee Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post("http://localhost:5000/api/payment/verify", {
              ...response,
              studentId,
            });
            alert("✅ Payment Successful!");
            onPageRefresh(); // Refresh student dashboard data
          } catch (err) {
            alert("❌ Verification Failed");
          }
        },
        theme: { color: "#991b1b" }, // Red-900 to match your theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
      <h3 className="text-xl font-bold dark:text-white mb-2">Pending Fees</h3>
      <p className="text-3xl font-black text-red-700 mb-6">₹{amount}</p>
      
      <button
        onClick={handlePayment}
        disabled={loading} // Disable button while loading to prevent double clicks
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 ${
          loading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-red-700 hover:bg-red-800 shadow-lg shadow-red-900/20"
        }`}
      >
        {loading ? "Processing..." : "Pay Admission Fee"}
      </button>
    </div>
  );
};

export default FeePayment;