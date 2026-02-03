const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ===========================
   EMAIL CONFIG (VERCEL SAFE)
=========================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // gmail
    pass: process.env.EMAIL_PASS  // APP PASSWORD
  }
});

// Verify transporter (important for Vercel logs)
transporter.verify((err) => {
  if (err) console.error("❌ Email Transport Error:", err);
  else console.log("✅ Email Transport Ready");
});

/* ===========================
   EMAIL TEMPLATE
=========================== */
const getHtmlTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f6f8; padding:20px">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px">
    <h2 style="color:#1e3a8a">${title}</h2>
    ${content}
    <p style="font-size:12px;color:#888;margin-top:30px">
      © ${new Date().getFullYear()} Campus Management System
    </p>
  </div>
</body>
</html>
`;

/* ===========================
   LOGIN STEP 1 (SEND OTP)
=========================== */
router.post("/login-step1", async (req, res) => {
  try {
    let { userId, password, role } = req.body;
    if (!userId || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    userId = userId.trim();

    const user = await User.findOne({
      userId: { $regex: new RegExp(`^${userId}$`, "i") }
    });

    if (!user) return res.status(400).json({ message: "Invalid User ID" });
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({ message: "Role mismatch" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    await User.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpires } }
    );

    const mailOptions = {
      from: `Campus Admin <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 Login OTP",
      html: getHtmlTemplate(
        "Login Verification",
        `<p>Hello <b>${user.name}</b>,</p>
         <p>Your OTP is:</p>
         <h1 style="letter-spacing:4px">${otp}</h1>
         <p>This OTP expires in 5 minutes.</p>`
      )
    };

    // 🔴 IMPORTANT: await email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.error("Login Step1 Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   LOGIN STEP 2 (VERIFY OTP)
=========================== */
router.post("/login-step2", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: "Missing OTP" });
    }

    const user = await User.findOne({
      userId: { $regex: new RegExp(`^${userId}$`, "i") }
    });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpires: 1 } }
    );

    const payload = { user: { id: user._id, role: user.role } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h"
    });

    res.json({ success: true, token, user });

  } catch (error) {
    console.error("Login Step2 Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   FORGOT PASSWORD - STEP 1
=========================== */
router.post("/forgot-password-step1", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await User.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpires } }
    );

    await transporter.sendMail({
      from: `Campus Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔑 Password Reset OTP",
      html: getHtmlTemplate(
        "Password Reset",
        `<p>Your OTP is:</p>
         <h1>${otp}</h1>
         <p>Expires in 10 minutes.</p>`
      )
    });

    res.json({ success: true, message: "OTP sent" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   RESET PASSWORD
=========================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashed },
        $unset: { otp: 1, otpExpires: 1 }
      }
    );

    res.json({ success: true, message: "Password updated" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   TEST EMAIL ROUTE
=========================== */
router.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "✅ Test Email",
      text: "Email configuration is working!"
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
