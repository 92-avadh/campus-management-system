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

// LOGIN STEP 1
router.post("/login-step1", async (req, res) => {
  try {
    let { userId, password, role } = req.body;
    if (!userId || !password) return res.status(400).json({ message: "All fields are required" });
    
    // ✅ FIX: Clean input
    userId = userId.trim();

    // ✅ FIX: Case-Insensitive Search (fa123 finds FA123)
    const user = await User.findOne({ 
      userId: { $regex: new RegExp(`^${userId}$`, "i") } 
    });

    if (!user) return res.status(400).json({ message: "Invalid User ID" });

    // ✅ FIX: Case-Insensitive Role Check
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({ message: `Role mismatch. This ID belongs to ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    const mailOptions = {
      from: '"Campus Security" <no-reply@campus.edu>',
      to: user.email,
      subject: "🔐 OTP Verification",
      text: `Your OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err));

    res.json({ message: "OTP Sent", email: user.email }); 
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN STEP 2
router.post("/login-step2", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    userId = userId.trim();

    const user = await User.findOne({ userId: { $regex: new RegExp(`^${userId}$`, "i") } });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

    await User.updateOne({ _id: user._id }, { $unset: { otp: 1, otpExpires: 1 } });

    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.json({ message: "Login Successful", token, user });
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;