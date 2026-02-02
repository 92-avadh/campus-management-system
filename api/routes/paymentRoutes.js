const express = require("express"); //
const router = express.Router(); //
const User = require("../models/User"); //

// --- MOCK PAYMENT VERIFICATION ---
router.post("/mock-verify", async (req, res) => {
  try {
    const { studentId } = req.body;

    // Update the student's fee status in the database
    const user = await User.findOneAndUpdate(
      { userId: studentId },
      { isFeePaid: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Demo Payment Successful!" });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router; 