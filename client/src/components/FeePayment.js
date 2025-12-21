import React, { useState } from "react";

const FeePayment = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // select -> processing -> success

  // Fake Payment Handler
  const handleMockPayment = async () => {
    setPaymentStep("processing");
    
    // 1. Fake Delay (2 Seconds) to look like real processing
    setTimeout(async () => {
      
      try {
        // 2. Call Backend to update DB
        const response = await fetch("http://localhost:5000/api/payment/pay-mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            amount: 50000,
            paymentMode: "Mock Card"
          })
        });

        if (response.ok) {
          setPaymentStep("success");
          // Reload page after 2 seconds to show "Paid" status
          setTimeout(() => window.location.reload(), 2000);
        } else {
          alert("Payment Failed");
          setPaymentStep("select");
        }
      } catch (error) {
        alert("Server Error");
        setPaymentStep("select");
      }

    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Admission Fee Status</h2>
      
      {/* CASE 1: ALREADY PAID */}
      {user.isFeePaid ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-bold">Admission Fees Paid</p>
          <p className="text-xs mt-1">Transaction ID: {user.paymentId || "N/A"}</p>
        </div>
      ) : (
        /* CASE 2: PENDING PAYMENT */
        <div>
          <p className="text-gray-500 mb-6">
            Total Amount: <span className="text-gray-900 font-bold text-xl">₹50,000</span>
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-700 text-white px-8 py-3 rounded-full font-bold hover:bg-red-800 transition-all shadow-lg hover:shadow-red-500/30"
          >
            Pay Admission Fees
          </button>
        </div>
      )}

      {/* --- MOCK PAYMENT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn">
            
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <span className="font-bold">Secure Payment Gateway</span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6">
              
              {/* STEP 1: SELECT METHOD */}
              {paymentStep === "select" && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">Select a payment method:</p>
                  
                  <div className="space-y-2">
                    <button onClick={handleMockPayment} className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-2xl mr-3">💳</span>
                      <div className="text-left">
                        <div className="font-bold text-sm">Credit / Debit Card</div>
                        <div className="text-xs text-gray-400">Visa, Mastercard, RuPay</div>
                      </div>
                    </button>

                    <button onClick={handleMockPayment} className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-2xl mr-3">📱</span>
                      <div className="text-left">
                        <div className="font-bold text-sm">UPI / QR Code</div>
                        <div className="text-xs text-gray-400">GPay, PhonePe, Paytm</div>
                      </div>
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-400 mt-4">🔒 100% Secure Transaction (Simulated)</p>
                </div>
              )}

              {/* STEP 2: PROCESSING (SPINNER) */}
              {paymentStep === "processing" && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-red-200 border-t-red-700 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="font-bold text-gray-800">Processing Payment...</h3>
                  <p className="text-sm text-gray-500">Please do not close this window.</p>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {paymentStep === "success" && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
                  <p className="text-sm text-gray-500 mt-2">Redirecting you back...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeePayment;