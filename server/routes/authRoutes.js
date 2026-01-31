const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); 
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
   1. LOGIN STEP 1: VERIFY & SEND PROFESSIONAL EMAIL
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
    const otpExpires = Date.now() + 5 * 60 * 1000; // Expires in 5 mins

    // ⚡ OPTIMIZATION: Fast DB Write
    await User.updateOne(
      { _id: user._id }, 
      { $set: { otp: otp, otpExpires: otpExpires } }
    );

    // 4. Send Professional Email (SDJ International College)
    const mailOptions = {
      from: '"SDJIC Security Team" <no-reply@sdjic.edu>',
      to: user.email,
      subject: "🔐 Secure Login Verification - SDJ International College",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #f9fafb;">
          
          <div style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">SDJ International College</h1>
            <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Secure Campus Portal Access</p>
          </div>

          <div style="padding: 40px 30px; background-color: #ffffff;">
            <p style="color: #374151; font-size: 16px; margin-top: 0;">Dear <strong>${user.name}</strong>,</p>
            
            <p style="color: #4b5563; line-height: 1.6;">We received a request to access your SDJIC portal account. To proceed with your secure login, please use the One-Time Password (OTP) provided below.</p>
            
            <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <span style="display: block; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Your Verification Code</span>
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e3a8a; font-family: monospace;">${otp}</span>
            </div>

            <p style="color: #4b5563; font-size: 14px;">⚠️ <strong>Security Notice:</strong> This code is valid for <strong>5 minutes</strong>. Please do not share this OTP with anyone, including college staff.</p>
            
            <p style="color: #4b5563; font-size: 14px; margin-top: 20px;">If you did not initiate this login attempt, please secure your account immediately or contact the IT department.</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} SDJ International College. All rights reserved.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Vesu, Surat, Gujarat, India 🇮🇳</p>
          </div>
        </div>
      `
    };

    // ⚡ OPTIMIZATION: Fire and Forget (Non-blocking email send)
    transporter.sendMail(mailOptions).catch(err => console.error("Email Delivery Failed:", err));

    // 5. Respond to Client Immediately
    res.json({ message: "OTP Sent Successfully", email: user.email }); 

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid Verification Code" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP has expired. Please try again." });

    // Clear OTP (Optimized)
    await User.updateOne({ _id: user._id }, { $unset: { otp: 1, otpExpires: 1 } });

    // Create JWT Payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, 
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        
        res.json({
          message: "Login Successful",
          token, 
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
    
    // Optimized update
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

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

    // Fire and forget
    transporter.sendMail(mailOptions).catch(err => console.error("Admin Email Failed:", err));
    
    res.json({ message: "✅ Support request sent to Admin!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;