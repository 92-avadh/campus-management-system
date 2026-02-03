const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Notice = require("../models/Notice");
const Notification = require("../models/Notification"); //
const Application = require("../models/Application");
const Course = require("../models/Course");

/* =========================================
   0. EMAIL CONFIGURATION & TEMPLATES
========================================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ✅ UNIFIED PRO TEMPLATE
const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; font-size: 16px; }
    .cred-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .cred-row { margin: 10px 0; font-family: monospace; font-size: 16px; color: #1e40af; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px; margin-bottom: 5px;">🏛️</div>
      <h1>Campus Management</h1>
    </div>
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Campus Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/* =========================================
   1. ADMIN AUTHENTICATION
========================================= */

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await User.findOne({ 
            $or: [{ email: username }, { userId: username }], 
            role: "admin" 
        });

        if (!admin) {
            if (username === "admin" && password === "admin123") {
                return res.json({ 
                    success: true, 
                    user: { name: "System Admin", role: "admin", email: "admin@college.edu" } 
                });
            }
            return res.status(401).json({ message: "Invalid Admin Credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect Password" });

        res.json({ 
            success: true, 
            user: { _id: admin._id, name: admin.name, role: "admin", email: admin.email } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

/* =========================================
   2. NOTICE MANAGEMENT (FIXED NOTIFICATIONS)
========================================= */

router.post("/add-notice", async (req, res) => {
    try {
        const { title, content, target } = req.body; 
        const finalTarget = target || "student";

        const newNotice = new Notice({ 
            title, 
            content, 
            target: finalTarget, 
            postedBy: "Admin" 
        });
        
        const savedNotice = await newNotice.save();

        // ✅ FIX: Dynamic Notification Targeting
        let notificationCourse = "STUDENT_ALL"; // Default to all students

        if (finalTarget === "faculty") {
            notificationCourse = "FACULTY_ALL";
        } else if (finalTarget === "student" || finalTarget === "all") {
            notificationCourse = "STUDENT_ALL";
        } else {
            // Assume specific course (BCA, BBA, BCOM)
            notificationCourse = finalTarget.toUpperCase(); 
        }

        await Notification.create({
            type: "notice",
            title: "📢 Admin Notice: " + title,
            message: content.substring(0, 50) + "...",
            course: notificationCourse, 
            relatedId: savedNotice._id,
            relatedModel: "Notice",
            createdAt: new Date()
        });
        
        res.json({ success: true, message: "Notice sent successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to send notice" });
    }
});

router.get("/notices", async (req, res) => {
    try {
        const notices = await Notice.find({ postedBy: "Admin" }).sort({ date: -1 });
        res.json(notices);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.delete("/delete-notice/:id", async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

/* =========================================
   3. ADMISSION & USERS
========================================= */

router.post("/approve-application/:id", async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        let finalPhotoPath = app.photo || "";
        let finalMarksheetPath = app.marksheet || "";

        const renameFile = (oldPath, prefix) => {
            if (oldPath && fs.existsSync(oldPath)) {
                const ext = path.extname(oldPath);
                const newFilename = `${prefix}_${userId}${ext}`;
                const newPath = path.join("uploads", newFilename);
                try {
                    fs.renameSync(oldPath, newPath);
                    return newPath.replace(/\\/g, "/"); 
                } catch (e) { return oldPath; }
            }
            return oldPath;
        };

        if (app.photo) finalPhotoPath = renameFile(app.photo, "PHOTO");
        if (app.marksheet) finalMarksheetPath = renameFile(app.marksheet, "MARKSHEET");

        const newUser = new User({
            name: app.name, email: app.email, phone: app.phone, role: "student",
            userId, password: hashedPassword, course: app.course,
            photo: finalPhotoPath, marksheet: finalMarksheetPath,
            dob: app.dob, address: app.address
        });

        await newUser.save();
        app.status = "Approved";
        await app.save();

        const mailContent = `
          <p>Congratulations, <strong>${app.name}</strong>! 🎉</p>
          <p>Your admission application for <strong>${app.course}</strong> has been <strong>APPROVED</strong>. We are thrilled to welcome you to our campus.</p>
          <p>Below are your login credentials. Please log in immediately and change your password.</p>
          
          <div class="cred-box">
            <div class="cred-row"><strong>User ID:</strong> ${userId}</div>
            <div class="cred-row"><strong>Password:</strong> ${password}</div>
          </div>

          <p style="text-align: center;">
            <a href="http://localhost:3000/login" class="btn">Login to Portal</a>
          </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "🎉 Admission Approved - Welcome Aboard!",
            html: getEmailTemplate("Welcome to Campus!", mailContent)
        };
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
        console.error("Approval Error:", err);
        res.status(500).json({ message: "Approval failed" });
    }
});

router.post("/reject-application/:id", async (req, res) => {
    try {
        const { reason } = req.body;
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        const mailContent = `
          <p>Dear <strong>${app.name}</strong>,</p>
          <p>Thank you for your interest in our ${app.course} program. After careful review, we regret to inform you that we are unable to offer you admission at this time.</p>
          
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #b91c1c;">Reason for Decision:</p>
            <p style="margin: 5px 0; color: #7f1d1d;">${reason || "Administrative Decision regarding eligibility."}</p>
          </div>
          <p>You can re-apply later.</p> 
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "Application Update - Campus System",
            html: getEmailTemplate("Application Status Update", mailContent)
        };
        await transporter.sendMail(mailOptions);

        if (app.photo && fs.existsSync(app.photo)) fs.unlinkSync(app.photo);
        if (app.marksheet && fs.existsSync(app.marksheet)) fs.unlinkSync(app.marksheet);

        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application Rejected" });
    } catch (err) {
        console.error("Rejection Error:", err);
        res.status(500).json({ message: "Rejection failed" });
    }
});

// DASHBOARD STATS
router.get("/stats", async (req, res) => {
    try {
        const students = await User.countDocuments({ role: "student" });
        const faculty = await User.countDocuments({ role: "faculty" });
        const applications = await Application.countDocuments({ status: "Pending" });
        const courses = await Course.countDocuments();
        res.json({ students, faculty, applications, courses });
    } catch (err) { res.status(500).json({ message: "Error fetching stats" }); }
});

// ADMIN PROFILE
router.get("/profile/:id", async (req, res) => {
    try {
        const admin = await User.findById(req.params.id).select("-password");
        res.json(admin);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.put("/update-profile/:id", async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: "Profile Updated!", user: updated });
    } catch (err) { res.status(500).json({ message: "Update failed" }); }
});

router.put("/change-password/:id", async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const admin = await User.findById(req.params.id);
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Old password incorrect" });

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ success: true, message: "Password updated" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// MANAGE USERS
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.post("/add-user", async (req, res) => {
    try {
        const { name, email, phone, role, department } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User exists with this email" });

        const prefix = role === "admin" ? "AD" : "FA";
        const userId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        const password = Math.random().toString(36).slice(-8); // Generate 8 char pass
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email, phone, role, userId, password: hashedPassword, department
        });
        await newUser.save();
        
        // --- SEND EMAIL ---
        const roleName = role === "admin" ? "Administrator" : "Faculty Member";
        const mailContent = `
          <p>Dear <strong>${name}</strong>,</p>
          <p>Welcome to the team! You have been added to the Campus Management System as a <strong>${roleName}</strong>.</p>
          <p>Here are your login credentials:</p>
          
          <div class="cred-box">
            <div class="cred-row"><strong>User ID:</strong> ${userId}</div>
            <div class="cred-row"><strong>Password:</strong> ${password}</div>
          </div>

          <p style="text-align: center;">
            <a href="http://localhost:3000/login" class="btn">Login to Dashboard</a>
          </p>
          <p>Please change your password after logging in for the first time.</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎉 Welcome to Campus System - Login Credentials",
            html: getEmailTemplate("Account Created Successfully", mailContent)
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "User created & Email sent!" });
    } catch (err) { 
        console.error("Add User Error:", err);
        res.status(500).json({ message: "User created but Email failed (Check Logs)" }); 
    }
});

router.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// APPLICATIONS
router.get("/applications", async (req, res) => {
    try {
        const apps = await Application.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// COURSES
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.post("/create-course", async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        await newCourse.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.delete("/delete-course/:id", async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

module.exports = router;