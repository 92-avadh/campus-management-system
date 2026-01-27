const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application");
const Notice = require("../models/Notice");

// --- 📧 EMAIL HELPERS ---
const sendApprovalEmail = async (email, name, userId, password, course) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const mailOptions = {
    from: `"SDJIC Admissions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Congratulations! Your Admission to SDJIC is Approved`,
    text: `Dear ${name},\n\nYour account details:\nUser ID: ${userId}\nTemporary Password: ${password}\n\nLogin at: http://localhost:3000/login`
  };
  try { await transporter.sendMail(mailOptions); } catch (err) { console.log(err); }
};

const sendCredentialsEmail = async (email, name, userId, password, role) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const mailOptions = {
    from: `"SDJIC System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your ${role.toUpperCase()} Account Credentials`,
    text: `Dear ${name},\n\nUser ID: ${userId}\nTemporary Password: ${password}\n\nLogin: http://localhost:3000/login`
  };
  try { await transporter.sendMail(mailOptions); } catch (err) { console.log(err); }
};

// --- 1. GET PENDING APPLICATIONS ---
// This route remains focused on 'pending' to keep the dashboard clean.
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

    const count = await User.countDocuments({ role: "student" });
    const newId = `${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`; 
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = new User({
      name: app.name, 
      email: app.email, 
      phone: app.phone,
      role: "student", 
      userId: newId, 
      password: hashedPassword,
      course: app.course, 
      department: app.course, // Mapping course to department for filtering
      photo: app.photo
    });

    await newUser.save();
    
    // Once approved, we remove the application so it doesn't clutter the dashboard
    await Application.findByIdAndDelete(req.params.id);

    await sendApprovalEmail(app.email, app.name, newId, rawPassword, app.course);
    res.json({ message: "Student Approved and credentials emailed." });
  } catch (err) { res.status(500).json({ message: "Error during approval" }); }
});

// --- 3. REJECT APPLICATION (FIXED) ---
// This now deletes the application from the DB entirely.
router.post("/reject/:id", async (req, res) => {
  try {
    const deletedApp = await Application.findByIdAndDelete(req.params.id);
    if (!deletedApp) return res.status(404).json({ message: "Application not found" });
    
    res.json({ message: "Application rejected and permanently removed." });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting application" });
  }
});

// --- 4. BROADCAST NOTICE ---
router.post("/send-notice", async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNotice = new Notice({
      title,
      content,
      sender: "Admin",
      date: new Date()
    });
    await newNotice.save();
    res.json({ message: "Notice broadcasted successfully to all members!" });
  } catch (err) {
    res.status(500).json({ message: "Error sending notice" });
  }
});

// --- 5. ADD FACULTY OR ADMIN ---
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
    await sendCredentialsEmail(email, name, newId, rawPassword, role);
    res.json({ message: "User added and credentials emailed." });
  } catch (err) { res.status(500).json({ message: "Error adding user" }); }
});

// --- 6. GET ALL USERS & REMOVE ---
router.get("/all-users", async (req, res) => {
  try { res.json(await User.find({}, "-password")); } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.delete("/remove-user/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User deleted successfully" }); } catch (err) { res.status(500).json({ message: "Error" }); }
});

module.exports = router;