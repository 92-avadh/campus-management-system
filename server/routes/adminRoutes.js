const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Notice = require("../models/Notice");
const Notification = require("../models/Notification");
const Application = require("../models/Application");
const Course = require("../models/Course");

/* =========================================
   0. EMAIL CONFIGURATION & TEMPLATES
========================================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
    <h2 style="color: #1e3a8a; margin-top: 0;">${title}</h2>
    ${content}
    <p style="color: #888; font-size: 12px; margin-top: 30px;">Campus Management System</p>
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
   2. NOTICE MANAGEMENT (✅ FIXED)
========================================= */

router.post("/add-notice", async (req, res) => {
    try {
        const { title, content, target } = req.body; // Removed postedBy from destructuring to force it
        
        // ✅ 1. Default target is "student" unless specified
        const finalTarget = target || "student";

        const newNotice = new Notice({ 
            title, 
            content, 
            target: finalTarget, 
            postedBy: "Admin" // ✅ FORCE "Admin" so Faculty filter works correctly
        });
        
        const savedNotice = await newNotice.save();
        
        // ✅ 2. Send Notification ONLY to the relevant group
        // If target is student -> "STUDENT_ALL" (Student routes will look for this)
        // If target is faculty -> "FACULTY_ALL" (Faculty routes will look for this)
        const notificationCourse = finalTarget === "faculty" ? "FACULTY_ALL" : "STUDENT_ALL";

        await Notification.create({
            type: "notice",
            title: "📢 Admin Notice: " + title,
            message: content.substring(0, 50) + "...",
            course: notificationCourse, // ✅ "STUDENT_ALL" or "FACULTY_ALL"
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

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
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
          <p>Your admission application has been rejected.</p>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">Reason:</p>
            <p style="margin: 5px 0;">${reason || "Administrative Decision"}</p>
          </div>
        `;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "Application Update",
            html: getEmailTemplate("Application Status", mailContent)
        };
        transporter.sendMail(mailOptions).catch(err => console.error(err));

        if (app.photo && fs.existsSync(app.photo)) fs.unlinkSync(app.photo);
        if (app.marksheet && fs.existsSync(app.marksheet)) fs.unlinkSync(app.marksheet);

        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application Rejected" });
    } catch (err) {
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
        if (existing) return res.status(400).json({ message: "User exists" });

        const prefix = role === "admin" ? "AD" : "FA";
        const userId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email, phone, role, userId, password: hashedPassword, department
        });
        await newUser.save();
        
        res.json({ success: true, message: "User created" });
    } catch (err) { res.status(500).json({ message: "Failed" }); }
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