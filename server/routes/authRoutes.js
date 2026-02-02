const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); 
const User = require("../models/User");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ==============================
//      EXISTING LOGIN ROUTES
// ==============================

// LOGIN STEP 1: Validate ID & Password -> Send OTP
router.post("/login-step1", async (req, res) => {
  try {
    let { userId, password, role } = req.body;
    if (!userId || !password) return res.status(400).json({ message: "All fields are required" });
    
    userId = userId.trim();

    // Case-Insensitive User Search
    const user = await User.findOne({ 
      userId: { $regex: new RegExp(`^${userId}$`, "i") } 
    });

    if (!user) return res.status(400).json({ message: "Invalid User ID" });

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({ message: `Role mismatch. This ID belongs to ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // Generate Login OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // Send Email
    const mailOptions = {
      from: '"Campus Security" <no-reply@campus.edu>',
      to: user.email,
      subject: "🔐 Login OTP Verification",
      text: `Your Login OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err));

    res.json({ message: "OTP Sent", email: user.email }); 
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN STEP 2: Verify OTP -> Issue Token
router.post("/login-step2", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    userId = userId.trim();

    const user = await User.findOne({ userId: { $regex: new RegExp(`^${userId}$`, "i") } });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

    // Clear OTP after success
    await User.updateOne({ _id: user._id }, { $unset: { otp: 1, otpExpires: 1 } });

    // Generate Token
    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.json({ message: "Login Successful", token, user });
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ==============================
//    FORGOT PASSWORD ROUTES
// ==============================

// STEP 1: Send OTP to Email
router.post("/forgot-password-step1", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins validity

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // Send Email
    const mailOptions = {
      from: '"Campus Security" <no-reply@campus.edu>',
      to: email,
      subject: "🔑 Password Reset Request",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    };
    
    transporter.sendMail(mailOptions, (err) => {
        if (err) console.error("Email Error:", err);
    });

    res.json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// STEP 2: Validate OTP (Read-Only Check)
router.post("/verify-forgot-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

        // OTP is valid, return success so frontend can show Password Form
        res.json({ success: true, message: "OTP Verified" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// STEP 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Double check OTP for security before changing password
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid or Expired OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update User & Clear OTP
    await User.updateOne(
        { _id: user._id }, 
        { 
            $set: { password: hashedPassword },
            $unset: { otp: 1, otpExpires: 1 }
        }
    );

    res.json({ success: true, message: "Password updated successfully! Please login." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;