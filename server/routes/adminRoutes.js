const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application"); // <--- IMPORT THIS

// --- EMAIL HELPER ---
const sendApprovalEmail = async (email, name, userId, password, course) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Admission Approved - SDJIC",
    text: `Dear ${name},\n\nCongratulations! Your application for ${course} has been approved.\n\nHere are your Login Credentials:\nUser ID: ${userId}\nPassword: ${password}\n\nLogin here: http://localhost:3000/login`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Email error (ignoring for local test):", err.message);
  }
};

// --- 1. GET PENDING APPLICATIONS (This fixes the "Empty Dashboard") ---
router.get("/applications", async (req, res) => {
  try {
    // Fetch data from 'applications' collection, NOT 'users'
    const apps = await Application.find({ status: "pending" });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// --- 2. APPROVE STUDENT ---
router.post("/approve/:id", async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Generate ID & Password
    const currentYear = new Date().getFullYear();
    const count = await User.countDocuments({ role: "student" });
    const newId = `${currentYear}${String(count + 1).padStart(3, '0')}`; // e.g., 2025001
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Move Data from Application -> User
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

    // Update Status to Approved
    app.status = "approved";
    await app.save();

    // Send Email
    await sendApprovalEmail(app.email, app.name, newId, rawPassword, app.course);

    res.json({ message: "Student Approved! Email sent." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 3. REJECT APPLICATION ---
router.post("/reject/:id", async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Application Rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 4. ADD FACULTY/ADMIN (Keep your existing Add User logic) ---
router.post("/add-user", async (req, res) => {
   try {
    const { name, email, phone, role, userId, password, department } = req.body;
    const existingUser = await User.findOne({ userId });
    if (existingUser) return res.status(400).json({ message: "User ID exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, role, userId, password: hashedPassword, department, course: "N/A" });
    await newUser.save();
    res.json({ message: `${role} added!` });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;