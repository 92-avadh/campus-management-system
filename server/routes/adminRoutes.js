const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application");
const Notice = require("../models/Notice");

// ✅ EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// --- 1. GET PENDING APPLICATIONS ---
router.get("/applications", async (req, res) => {
  try {
    const apps = await Application.find({ status: "pending" });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: "Error fetching applications" }); }
});

// --- 2. APPROVE STUDENT ---
router.post("/approve/:id", async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Generate Credentials
    const count = await User.countDocuments({ role: "student" });
    const newId = `${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`; 
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create Student User
    const newUser = new User({
      name: app.name, 
      email: app.email, 
      phone: app.phone,
      role: "student", 
      userId: newId, 
      password: hashedPassword,
      course: app.course, 
      department: app.course,
      photo: app.photo
    });

    await newUser.save();
    
    // Send Approval Email
    const mailOptions = {
      from: `"ST College Admissions" <${process.env.EMAIL_USER}>`,
      to: app.email,
      subject: `🎉 Admission Approved - ST College`,
      html: `
        <div style="padding:20px; font-family:Arial;">
          <h2 style="color:#059669;">Congratulations, ${app.name}!</h2>
          <p>Your admission for <strong>${app.course}</strong> has been approved.</p>
          <div style="background:#f3f4f6; padding:15px; border-radius:10px; margin:20px 0;">
            <p><strong>User ID:</strong> ${newId}</p>
            <p><strong>Password:</strong> ${rawPassword}</p>
          </div>
          <p>Please login and change your password immediately.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);

    // Remove from Applications
    await Application.findByIdAndDelete(req.params.id);

    res.json({ message: "Student Approved and credentials emailed." });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: "Error during approval" }); 
  }
});

// --- 3. REJECT APPLICATION (With Reason) ---
router.post("/reject/:id", async (req, res) => {
  try {
    const { reason } = req.body; // ✅ Get reason from body
    const app = await Application.findById(req.params.id);
    
    if (!app) return res.status(404).json({ message: "Application not found" });

    // ✅ Send Rejection Email with Reason
    const mailOptions = {
      from: `"ST College Admissions" <${process.env.EMAIL_USER}>`,
      to: app.email,
      subject: `⚠️ Update regarding your Admission Application`,
      html: `
        <div style="padding:20px; font-family:Arial;">
          <h2 style="color:#dc2626;">Application Status Update</h2>
          <p>Dear ${app.name},</p>
          <p>Thank you for your interest in ST College.</p>
          <p>After reviewing your application, we regret to inform you that we cannot move forward at this time.</p>
          
          <div style="background:#fff1f2; border:1px solid #fda4af; padding:15px; border-radius:10px; margin:20px 0;">
            <strong>Reason for Rejection:</strong><br/>
            ${reason || "Document discrepancy or eligibility criteria not met."}
          </div>

          <p><strong>You are welcome to re-apply</strong> with corrected details or documents.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);

    // ✅ Delete Application so they can re-apply
    await Application.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Application rejected, email sent, and record removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting application" });
  }
});

// --- 4. OTHER ADMIN ROUTES (Keep existing) ---
router.post("/send-notice", async (req, res) => {
  try {
    const { title, content } = req.body;
    await new Notice({ title, content, sender: "Admin", date: new Date() }).save();
    res.json({ message: "Notice broadcasted successfully!" });
  } catch (err) { res.status(500).json({ message: "Error sending notice" }); }
});

router.post("/add-user", async (req, res) => {
  try {
    const { name, email, phone, role, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const count = await User.countDocuments({ role });
    const prefix = role === "admin" ? "ADM" : "FAC";
    const newId = `${prefix}${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = new User({ name, email, phone, role, department, userId: newId, password: hashedPassword });
    await newUser.save();
    
    // Send Credentials Email
    const mailOptions = {
      from: `"ST College System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${role.toUpperCase()} Account Credentials`,
      text: `Dear ${name},\n\nUser ID: ${newId}\nTemporary Password: ${rawPassword}\n\nLogin: http://localhost:3000/login`
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: "User added and credentials emailed." });
  } catch (err) { res.status(500).json({ message: "Error adding user" }); }
});

router.get("/all-users", async (req, res) => {
  try { res.json(await User.find({}, "-password")); } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.delete("/remove-user/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User deleted successfully" }); } catch (err) { res.status(500).json({ message: "Error" }); }
});

module.exports = router;