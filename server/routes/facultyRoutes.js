const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- ROUTE: Get Paid Students by Department ---
// Example: GET /api/faculty/students?department=BCA
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    // Filter Logic: 
    // 1. Role must be student
    // 2. Department must match the faculty's department
    // 3. isFeePaid must be true
    const students = await User.find({ 
      role: "student", 
      department: department, 
      isFeePaid: true 
    });

    res.json(students);
  } catch (error) {
    console.error("Faculty Student Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;