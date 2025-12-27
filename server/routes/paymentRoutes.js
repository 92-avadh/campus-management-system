const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- MOCK PAYMENT ROUTE ---
router.post("/pay-mock", async (req, res) => {
  try {
    const { userId, amount, paymentMode } = req.body; // userId is "2025001"

    // Generate a fake Transaction ID
    const fakeTxnId = "TXN_" + Date.now();

    // 👇 FIXED HERE: Use findOneAndUpdate to search by "userId" field
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId }, // Search condition
      { 
        isFeePaid: true,
        paymentId: fakeTxnId,
        paymentMode: paymentMode 
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

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