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

// LOGIN STEP 1: Validate ID & Password -> Send OTP
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

    // Generate Login OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // ✅ Send Attractive Email (AWAITED)
    const mailContent = `
      <p>Hello <strong>${user.name}</strong>, 👋</p>
      <p>We received a login request for your account. Please use the One-Time Password (OTP) below to complete your login:</p>
      <div class="otp-box">${otp}</div>
      <p>⏳ This OTP is valid for <strong>5 minutes</strong>.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not request this login, please contact admin immediately.</p>
    `;

    const mailOptions = {
      from: '"Campus Security" <no-reply@campus.edu>',
      to: user.email,
      subject: "🔐 Login Verification - Campus System",
      html: getHtmlTemplate("🔒 Secure Login OTP", mailContent)
    };
    
    // ✅ Await email so frontend knows if it failed
    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP Sent", email: user.email }); 
  } catch (error) {
    console.error("Login OTP Error:", error);
    res.status(500).json({ message: "Server Error (Check Email Config)" });
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

// STEP 1: Send OTP to Email
router.post("/forgot-password-step1", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // ✅ Send Attractive Email (AWAITED)
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
    
    // ✅ Await email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    console.error("Forgot Pass Error:", err);
    res.status(500).json({ message: "Server Error (Check Email Config)" });
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

module.exports = router;