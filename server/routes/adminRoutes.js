const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Application = require("../models/Application");

// --- HELPER: Generic Email Sender ---
const sendStatusEmail = async (email, name, type, details = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  let subject = "";
  let text = "";

  if (type === "approved") {
    subject = `🎉 Admission Approved - Action Required`;
    text = `Dear ${name},\n\nCongratulations! Your application for the ${details.course} course at SDJIC has been APPROVED.\n\nTo secure your admission, please complete the fee payment within 48 hours.\n\nHere are your provisional login details to access the fee portal:\nUser ID: ${details.userId}\nPassword: ${details.password}\n\nLogin here: http://localhost:3000/login\n\nWelcome to the family!\nSDJ International College`;
  } else if (type === "rejected") {
    subject = `Update Regarding Your Admission Application`;
    text = `Dear ${name},\n\nThank you for your interest in SDJ International College.\n\nAfter carefully reviewing your application, we regret to inform you that we are unable to offer you admission at this time.\n\nWe wish you the very best in your future academic endeavors.\n\nSincerely,\nAdmissions Committee\nSDJIC`;
  }

  const mailOptions = { from: process.env.EMAIL_USER, to: email, subject, text };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 ${type} email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
};

// --- ROUTE 1: Get Pending Applications ---
router.get("/applications", async (req, res) => {
  try {
    const apps = await Application.find({ status: "pending" });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// --- ROUTE 2: Approve Student (Send Fee Payment Email) ---
router.post("/approve-student/:id", async (req, res) => {
  try {
    // 1. Find the Application
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // 2. Generate Student ID
    const lastStudent = await User.findOne({ role: "student" }).sort({ createdAt: -1 });
    const currentYear = new Date().getFullYear();
    let newId;
    if (lastStudent && lastStudent.userId.startsWith(currentYear.toString())) {
      newId = (parseInt(lastStudent.userId) + 1).toString();
    } else {
      newId = `${currentYear}001`;
    }

    // 3. Generate Temporary Password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Create User (Provisional Student)
    const newUser = new User({
      name: app.name,
      email: app.email,
      phone: app.phone,
      role: "student",
      course: app.course,
      userId: newId,
      password: hashedPassword
    });
    await newUser.save();

    // 5. Update Application Status
    app.status = "approved";
    await app.save();

    // 6. Send Approval Email (With Fee Instructions)
    await sendStatusEmail(app.email, app.name, "approved", {
      userId: newId,
      password: rawPassword,
      course: app.course
    });

    res.json({ message: "Student Approved! Payment email sent.", userId: newId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Approval Failed", error: error.message });
  }
});

// --- ROUTE 3: Reject Application (Send Rejection Email) ---
router.post("/reject-student/:id", async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // 1. Update Status
    app.status = "rejected";
    await app.save();

    // 2. Send Rejection Email
    await sendStatusEmail(app.email, app.name, "rejected");

    res.json({ message: "Application Rejected. Email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting application" });
  }
});
// --- ROUTE 4: Add Faculty Member ---
router.post("/add-faculty", async (req, res) => {
  try {
    const { name, email, phone, department, designation } = req.body;

    // 1. Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // 2. Generate Faculty ID (e.g., FAC + Random 3 digits)
    // In a real app, you would count documents to increment, but random is fine for now.
    const facultyId = "FAC" + Math.floor(100 + Math.random() * 900);

    // 3. Generate Password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Create User
    const newFaculty = new User({
      name,
      email,
      phone,
      department,
      role: "faculty",
      userId: facultyId,
      password: hashedPassword
    });
    
    await newFaculty.save();

    // 5. Send Email
    // Re-using our sendStatusEmail helper but tweaking the message slightly
    // Note: You might want to update sendStatusEmail to handle a "faculty" type if you want specific text.
    // For now, we will send a direct mail here for simplicity or reuse the helper if it's flexible.
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Faculty Appointment - SDJIC",
        text: `Dear ${name},\n\nYou have been appointed as ${designation} in the ${department} department.\n\nHere are your Login Credentials:\nUser ID: ${facultyId}\nPassword: ${rawPassword}\n\nPlease login at: http://localhost:3000/login`
    });

    res.json({ message: "Faculty Added Successfully", facultyId });

  } catch (error) {
    console.error("Error adding faculty:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;