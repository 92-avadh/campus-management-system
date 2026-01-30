const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); // ✅ Import JWT
const User = require("../models/User");

// EMAIL TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================================
   1. LOGIN STEP 1: VERIFY CREDENTIALS & SEND OTP
========================================= */
router.post("/login-step1", async (req, res) => {
  try {
    const { userId, password, role } = req.body;
    
    // 1. Check User Existence & Role
    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid User ID" });
    if (user.role !== role) return res.status(400).json({ message: "Role mismatch" });

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // Expires in 5 mins
    await user.save();

    // 4. Send OTP Email
    const mailOptions = {
      from: '"ST College Security" <no-reply@stcollege.edu>',
      to: user.email,
      subject: "🔐 Login Verification Code - ST College",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #be123c; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">ST College Portal</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff; text-align: center;">
            <p style="color: #555; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #555;">Use the code below to complete your secure login.</p>
            <div style="background-color: #f8fafc; border: 1px dashed #be123c; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #be123c;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #888;">This code expires in 5 minutes.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP Sent", email: user.email }); 

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================
   2. LOGIN STEP 2: VERIFY OTP & ISSUE TOKEN
========================================= */
router.post("/login-step2", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Verify OTP Match & Expiry
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

    // Clear OTP after success
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // ✅ CREATE JWT PAYLOAD
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    // ✅ SIGN TOKEN
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Ensure this is in your .env file
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        
        // Return Token + User Data
        res.json({
          message: "Login Success",
          token, // <--- IMPORTANT: The client needs this
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            userId: user.userId,
            isFeePaid: user.isFeePaid,
            course: user.course,
            photo: user.photo
          }
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================
   3. CHANGE PASSWORD
========================================= */
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

/* =========================================
   4. CONTACT ADMIN
========================================= */
router.post("/contact-admin", async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    const user = await User.findOne({ userId });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[SUPPORT] ${subject} - from ${user.name}`,
      text: `User: ${user.name} (${user.userId})\nRole: ${user.role}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Message sent to Admin!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;