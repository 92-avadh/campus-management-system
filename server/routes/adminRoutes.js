const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application");

// --- 📧 EMAIL HELPER: PROFESSIONAL APPROVAL ---
const sendApprovalEmail = async (email, name, userId, password, course) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: `"SDJIC Admissions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Congratulations! Your Admission to SDJIC is Approved`,
    text: `Dear ${name},

We are delighted to inform you that after a thorough review of your application and academic credentials, you have been granted admission to the ${course} program at SDJ International College (SDJIC).

Welcome to our academic community! We were highly impressed with your academic background and believe you will be a valuable addition to our campus. 

To help you get started with your journey, we have created your official student account. Please find your login credentials below:

Portal URL: http://localhost:3000/login
User ID: ${userId}
Temporary Password: ${password}

Please log in at your earliest convenience to complete your enrollment, pay any pending fees, and access your student dashboard. We look forward to seeing you on campus and supporting you in achieving your educational goals.

Warm regards,

Admissions Department
SDJ International College (SDJIC)`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Approval Email error:", err.message);
  }
};

// --- 📧 EMAIL HELPER: PROFESSIONAL REJECTION ---
const sendRejectionEmail = async (email, name, course, reason) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: `"SDJIC Admissions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Admission Decision: ${course} Program - SDJIC`,
    text: `Dear ${name},

Thank you for providing us with the opportunity to review your application for the ${course} program at SDJIC for the upcoming academic session. We truly appreciate the time and effort you put into your submission and for choosing our institution as a potential destination for your higher education.

Our admissions committee has carefully reviewed your academic profile, including your merit scores and supporting documentation. Every year, we receive a significant number of applications from many talented individuals, making our selection process incredibly challenging. Our goal is to build a diverse and academically driven cohort that aligns with the rigorous standards of our various departments.

After a thorough evaluation of the current applicant pool, we regret to inform you that we are unable to offer you admission at this time. This decision was based on the following specific observation regarding your application:

👉 ${reason}

Please understand that this decision is specific to the current application cycle and does not reflect your future potential as a student. We highly encourage you to address the points mentioned above and consider re-applying to our program once you have updated your information or documentation.

We wish you the very best in your academic pursuits and all your future endeavors.

Sincerely,

The Admissions Committee
SDJ International College (SDJIC)`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Rejection Email error:", err.message);
  }
};

// --- 1. GET PENDING APPLICATIONS ---
router.get("/applications", async (req, res) => {
  try {
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

    // Generate unique Student ID
    const currentYear = new Date().getFullYear();
    const count = await User.countDocuments({ role: "student" });
    const newId = `${currentYear}${String(count + 1).padStart(3, '0')}`; 
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
      isFeePaid: false,
      photo: app.photo,
      marksheet: app.marksheet
    });

    await newUser.save(); //
    app.status = "approved"; //
    await app.save();

    await sendApprovalEmail(app.email, app.name, newId, rawPassword, app.course);
    res.json({ message: "Student Approved. Credentials have been emailed." });
  } catch (err) {
    console.error("Approval Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 3. REJECT APPLICATION (With Professional Reason & Auto-Delete) ---
router.post("/reject/:id", async (req, res) => {
  try {
    const { reason } = req.body;
    
    // 1. Find the application before deletion
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const studentEmail = app.email;

    // 2. Send the professional, multi-paragraph rejection email
    await sendRejectionEmail(studentEmail, app.name, app.course, reason || "Documents provided do not meet criteria.");

    // 3. CRITICAL: Delete record to clear index for re-application
    await Application.deleteOne({ email: studentEmail });

    res.json({ message: "Application Rejected. Record cleared for re-application." });
  } catch (err) {
    console.error("Rejection Route Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;