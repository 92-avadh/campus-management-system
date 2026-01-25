const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Transporter for Email
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
    
    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid User ID" });
    if (user.role !== role) return res.status(400).json({ message: "Role mismatch" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    console.log(`🚀 FAST OTP for ${user.email}: ${otp}`);

    /* // Enable for Real Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Login OTP",
      text: `Your OTP is: ${otp}`
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

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

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
        isFeePaid: user.isFeePaid,
        course: user.course // Added course for student context
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- NEW: CHANGE PASSWORD ---
router.post("/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect Old Password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "✅ Password Changed Successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- NEW: CONTACT ADMIN ---
router.post("/contact-admin", async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    const user = await User.findOne({ userId });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sends email to Admin (Self)
      subject: `[SUPPORT] ${subject} - from ${user.name} (${user.role.toUpperCase()})`,
      text: `User Details:\nName: ${user.name}\nID: ${user.userId}\nRole: ${user.role}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Message sent to Admin!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;