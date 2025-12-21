const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- MOCK PAYMENT ROUTE ---
router.post("/pay-mock", async (req, res) => {
  try {
    const { userId, amount, paymentMode } = req.body;

    // Generate a fake Transaction ID (e.g., TXN_173928392)
    const fakeTxnId = "TXN_" + Date.now();

    // Update User in Database
    await User.findByIdAndUpdate(userId, { 
      isFeePaid: true,
      paymentId: fakeTxnId,
      paymentMode: paymentMode // (Optional) Save 'Card' or 'UPI'
    });

    res.json({ 
      success: true, 
      message: "Payment Verified", 
      transactionId: fakeTxnId 
    });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;