const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Transporter for Email (Kept for future use)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- STEP 1: VERIFY CREDENTIALS & SEND OTP ---
router.post("/login-step1", async (req, res) => {
  try {
    const { userId, password, role } = req.body;
    
    // 1. Find User
    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid User ID" });

    // 2. Check Role
    if (user.role !== role) return res.status(400).json({ message: "Role mismatch" });

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // 4. Generate OTP (6 Digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 5. Save OTP to DB (Expires in 5 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    // 6. FAST OTP (Console Log Only - No Email Delay)
    console.log("====================================");
    console.log(`🚀 FAST OTP for ${user.email}: ${otp}`);
    console.log("====================================");

    /* // --- TEMPORARILY DISABLED REAL EMAIL FOR SPEED ---
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Login OTP - SDJIC Campus",
      text: `Hello ${user.name},\n\nYour OTP for login is: ${otp}\n\nDo not share this with anyone. Valid for 5 minutes.`
    });
    */

    res.json({ message: "OTP Sent", email: user.email }); 

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- STEP 2: VERIFY OTP & LOGIN ---
router.post("/login-step2", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check Expiry
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP Expired. Please try again." });
    }

    // Success! Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: "Login Success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        userId: user.userId,
        isFeePaid: user.isFeePaid
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;