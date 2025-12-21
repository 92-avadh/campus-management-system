const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    // 1. Find User by ID and Role
    const user = await User.findOne({ userId, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid User ID or Role" });
    }

    // 2. Compare Password (Hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // 3. Login Success
    // We send back the user's info (excluding the password)
    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        role: user.role,
        isPasswordChanged: user.isPasswordChanged
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;