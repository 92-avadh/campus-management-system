const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); 
const User = require("../models/User");

// ==============================
//   EMAIL CONFIG (OPTIMIZED)
// ==============================
const transporter = nodemailer.createTransport({
  pool: true,            
  maxConnections: 5,     
  host: "smtp.gmail.com",
  port: 587,              
  secure: false,          
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ UNIFIED EMAIL TEMPLATE BUILDER (UPDATED FOR GLOBAL COLLEGE)
const getHtmlTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
    
    /* Changed to Global College Red Theme */
    .header { background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%); padding: 35px 30px; text-align: center; color: white; }
    .header h1 { margin: 15px 0 0; font-size: 28px; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; }
    .header p { margin: 5px 0 0; color: #fda4af; font-size: 12px; letter-spacing: 3px; font-weight: 600; }
    
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .content h2 { color: #be123c; margin-top: 0; font-size: 22px; }
    
    /* Modernized OTP Box */
    .otp-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; font-size: 36px; font-family: monospace; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 30px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    
    .footer { background-color: #f8fafc; padding: 25px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer strong { color: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 45px; background: white; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🏛️</div>
      <h1>Global College</h1>
      <p>EXCELLENCE IN EDUCATION</p>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>Global College</strong>. All rights reserved.</p>
      <p>Need help? Contact admissions@globalcollege.edu</p>
      <p style="font-size: 10px; color: #cbd5e1; margin-top: 15px;">Automated message sent securely via Campus Management System.</p>
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    // ✅ DB Update first (Blocking but fast)
    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });

    // ✅ Response sent IMMEDIATELY
    res.json({ message: "OTP Sent", email: user.email });

    // ✅ Email sending happens in BACKGROUND
    const mailOptions = {
      // 🌟 Hides the raw email behind the official name
      from: `"Global College Admin" <${process.env.EMAIL_USER}>`, 
      to: user.email,
      subject: "🔐 Global College - Login Verification",
      html: getHtmlTemplate("Login Authentication", `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>A login attempt was made to your Global College portal account. Please use the secure OTP below to complete your sign-in:</p>
        <div class="otp-box">${otp}</div>
        <p style="color: #64748b; font-size: 14px;">⚠️ This code is valid for 5 minutes. Do not share this code with anyone.</p>
      `)
    };

    transporter.sendMail(mailOptions).catch(() => {}); // Silent catch

  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN STEP 2: Verify OTP
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

    res.json({ success: true, message: "OTP sent to your email" });

    const mailOptions = {
      // 🌟 Hides the raw email behind the official name
      from: `"Global College Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔑 Global College - Password Reset Request",
      html: getHtmlTemplate("Reset Your Password", `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset the password for your Global College account. Please use the verification code below:</p>
        <div class="otp-box">${otp}</div>
        <p style="color: #64748b; font-size: 14px;">⚠️ This code expires in 10 minutes. If you did not request this, please ignore this email or contact support immediately.</p>
      `)
    };

    transporter.sendMail(mailOptions).catch(() => {});

  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Server Error" });
  }
});

// STEP 2: Validate OTP
router.post("/verify-forgot-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or Expired OTP" });
        }
        res.json({ success: true, message: "OTP Verified" });
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// STEP 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
        return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
        { _id: user._id }, 
        { 
            $set: { password: hashedPassword },
            $unset: { otp: 1, otpExpires: 1 }
        }
    );

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// TEST ROUTE
router.get("/test-email", async (req, res) => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"Global College IT" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "✅ Global College - System Test",
      text: "Email Gateway is functioning correctly."
    });
    res.json({ success: true, message: "Email Sent!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;