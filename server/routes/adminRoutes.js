const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// --- 1. GET ALL STUDENTS (For Admission Table) ---
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

// --- 2. ADD NEW USER (Faculty or Admin) ---
router.post("/add-user", async (req, res) => {
  try {
    const { name, email, phone, role, userId, password, department } = req.body;

    // A. Check if User ID already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User ID already exists!" });
    }

    // B. Check if Email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // C. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // D. Create the new User
    const newUser = new User({
      name, 
      email, 
      phone, 
      role, 
      userId, 
      password: hashedPassword, 
      department,
      course: "N/A", 
      isFeePaid: true 
    });

    await newUser.save();

    res.json({ message: `${role.toUpperCase()} added successfully!` });

  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;