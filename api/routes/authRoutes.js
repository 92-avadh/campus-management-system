const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); 
const User = require("../models/User");

// EMAIL CONFIG
// ✅ UPDATED TRANSPORTER FOR VERCEL
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // MUST use 587 for Vercel
  secure: false,          // MUST be false for port 587
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false // Fixes SSL errors
  }
});
// ✅ UNIFIED EMAIL TEMPLATE BUILDER
const getHtmlTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 10px 0 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .otp-box { background-color: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px;">🎓</div>
      <h1>Campus Management System</h1>
    </div>
    <div class="content">
      <h2 style="color: #1e3a8a; margin-top: 0;">${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Campus Management System. All rights reserved.</p>
      <p>Need help? Contact support@campus.edu</p>
    </div>
  </div>
</body>
</html>
`;

// ==============================
//      EXISTING LOGIN ROUTES
// ==============================

// LOGIN STEP 1: Validate ID & Password -> Send OTP (OPTIMIZED)
router.post("/login-step1", async (req, res) => {
  try {
    let { userId, password, role } = req.body;
    if (!userId || !password) return res.status(400).json({ message: "All fields are required" });
    
    userId = userId.trim();

    const user = await User.findOne({ 
      userId: { $regex: new RegExp(`^${userId}$`, "i") } 
    });

    if (!user) return res.status(400).json({ message: "Invalid User ID" });

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({ message: `Role mismatch. This ID belongs to ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // ✅ DEBUG LOG: See exactly where the email is going in Vercel Logs
    console.log(`📧 Preparing to send OTP to: ${user.email}`);

    const mailOptions = {
      from: `Campus Admin <${process.env.EMAIL_USER}>`, // ✅ CHANGED: Uses your real Gmail to prevent blocking
      to: user.email,
      subject: "🔐 Login Verification",
      html: getHtmlTemplate("Login OTP", `
        <p>Hello ${user.name},</p>
        <p>Your OTP is:</p>
        <div class="otp-box">${otp}</div>
      `)
    };
    
    // 1. Send Response to User
    res.json({ message: "OTP Sent", email: user.email });

    // 2. Send Email & Log Result
    transporter.sendMail(mailOptions)
      .then(info => console.log("✅ Email sent successfully:", info.messageId))
      .catch(err => console.error("❌ Email FAILED:", err));

  } catch (error) {
    console.error("Login Error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Server Error" });
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

// ==============================
//    FORGOT PASSWORD ROUTES
// ==============================

// STEP 1: Send OTP to Email (OPTIMIZED)
router.post("/forgot-password-step1", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    // Save to DB
    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // Prepare Email Content
    const mailContent = `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You requested to reset your password. Use the code below to proceed:</p>
      <div class="otp-box">${otp}</div>
      <p>⚠️ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    `;

    const mailOptions = {
      from: '"Campus Support" <no-reply@campus.edu>',
      to: email,
      subject: "🔑 Password Reset Request",
      html: getHtmlTemplate("Reset Your Password", mailContent)
    };
    
    // 🚀 FIRE AND FORGET: Send Response FIRST
    res.json({ success: true, message: "OTP sent to your email" });

    // Send Email in Background
    transporter.sendMail(mailOptions).catch(err => {
        console.error("❌ Forgot Password Email Failed:", err);
    });

  } catch (err) {
    console.error("Forgot Pass Error:", err);
    if (!res.headersSent) {
        res.status(500).json({ message: "Server Error" });
    }
  }
});

// STEP 2: Validate OTP
router.post("/verify-forgot-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

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

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid or Expired OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP Expired" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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
// --- DEBUGGING ROUTE (Add this to test email) ---
router.get("/test-email", async (req, res) => {
  try {
    // 1. Check if Variables exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: "❌ Env Variables Missing", 
        user: process.env.EMAIL_USER ? "Set" : "Missing",
        pass: process.env.EMAIL_PASS ? "Set" : "Missing"
      });
    }

    // 2. Verify Connection
    await transporter.verify();

    // 3. Send Test Email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sends to yourself
      subject: "✅ Test Email from Vercel",
      text: "If you are reading this, your email configuration is PERFECT!"
    });

    res.json({ success: true, message: "Email Sent!", info });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "❌ Email Failed", 
      error: error.message 
    });
  }
});
module.exports = router;