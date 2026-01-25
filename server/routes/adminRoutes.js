const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application");

// --- 1. GENERIC EMAIL FUNCTION (For Students, Faculty & Admin) ---
const sendCredentialsEmail = async (email, name, userId, password, role) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const subject = role === "student" 
    ? "Admission Approved - SDJIC" 
    : "Faculty/Admin Account Created - SDJIC";

  const message = `Dear ${name},\n\nYour account has been successfully created as a ${role.toUpperCase()}.\n\nHere are your Login Credentials:\nUser ID: ${userId}\nPassword: ${password}\n\nLogin here: http://localhost:3000/login`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.log("❌ Email error:", err.message);
  }
};

// --- 2. GET PENDING APPLICATIONS ---
router.get("/applications", async (req, res) => {
  try {
    const apps = await Application.find({ status: "pending" });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// --- 3. APPROVE STUDENT ---
router.post("/approve/:id", async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Generate Student ID (Year + Count)
    const currentYear = new Date().getFullYear();
    const count = await User.countDocuments({ role: "student" });
    const newId = `${currentYear}${String(count + 1).padStart(3, '0')}`; // e.g., 2025001
    
    // Generate Random Password
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
      department: "N/A",
      isFeePaid: false,
      photo: app.photo,
      marksheet: app.marksheet
    });

    await newUser.save();
    
    app.status = "approved";
    await app.save();

    // Send Email
    await sendCredentialsEmail(app.email, app.name, newId, rawPassword, "student");

    res.json({ message: "Student Approved! Credentials Emailed." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 4. REJECT APPLICATION ---
router.post("/reject/:id", async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Application Rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 5. ADD FACULTY/ADMIN (Auto-Generate Credentials) ---
router.post("/add-user", async (req, res) => {
   try {
    // Removed userId and password from request body
    const { name, email, phone, role, department } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered!" });

    // Generate ID based on Role
    const currentYear = new Date().getFullYear();
    const count = await User.countDocuments({ role: role });
    
    // Prefix: FAC for Faculty, ADM for Admin
    const prefix = role === "faculty" ? "FAC" : "ADM";
    const newId = `${prefix}${currentYear}${String(count + 1).padStart(3, '0')}`; // e.g., FAC2025001

    // Generate Password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = new User({ 
      name, email, phone, role, 
      userId: newId, 
      password: hashedPassword, 
      department: department || "N/A", 
      course: "N/A" 
    });

    await newUser.save();

    // Send Email
    await sendCredentialsEmail(email, name, newId, rawPassword, role);

    res.json({ message: `${role.toUpperCase()} Added! Credentials Sent.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;