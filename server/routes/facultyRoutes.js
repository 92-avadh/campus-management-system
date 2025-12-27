const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- ROUTE: Get Students by Department ---
// Example: GET /api/faculty/students?department=Computer Science
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    
    // Logic: If faculty is "Computer Science", show "BCA" and "B.Tech" students
    // For simplicity in this project, we will just fetch ALL students if no department is strictly matched,
    // or you can filter strictly. Let's fetch ALL students for now so you definitely see data.
    
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;