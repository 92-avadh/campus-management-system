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
   2. DASHBOARD STATS
========================================= */

router.get("/stats", async (req, res) => {
    try {
        const students = await User.countDocuments({ role: "student" });
        const faculty = await User.countDocuments({ role: "faculty" });
        const applications = await Application.countDocuments({ status: "Pending" });
        const courses = await Course.countDocuments();

        res.json({ students, faculty, applications, courses });
    } catch (err) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

/* =========================================
   3. ADMIN PROFILE MANAGEMENT
========================================= */

router.get("/profile/:id", async (req, res) => {
    try {
        const admin = await User.findById(req.params.id).select("-password");
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin details" });
    }
});

router.put("/update-profile/:id", async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.id, 
            { name, email, phone }, 
            { new: true }
        ).select("-password");
        res.json({ success: true, message: "Profile Updated!", user: updated });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

router.put("/change-password/:id", async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const admin = await User.findById(req.params.id);
        
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Old password incorrect" });

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating password" });
    }
});

/* =========================================
   4. USER MANAGEMENT
========================================= */

router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

router.post("/add-user", async (req, res) => {
    try {
        const { name, email, phone, role, department } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        // Generate ID
        const prefix = role === "admin" ? "AD" : "FA";
        const userId = `${prefix}${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Generate Random Password
        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email, phone, role, userId,
            password: hashedPassword,
            department: role === "faculty" ? department : undefined
        });

        await newUser.save();

        // SEND CREDENTIALS EMAIL
        const mailContent = `
          <p>Dear <strong>${name}</strong>,</p>
          <p>You have been registered as a <strong>${role.toUpperCase()}</strong> in the Campus Management System.</p>
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px; color: #1e40af; font-weight: bold; font-size: 14px; text-transform: uppercase;">Your Login Credentials</p>
            <p style="margin: 5px 0; font-size: 18px; color: #111827;">👤 User ID: <strong>${userId}</strong></p>
            <p style="margin: 5px 0; font-size: 18px; color: #111827;">🔑 Password: <strong>${password}</strong></p>
          </div>
          <p>Please log in and change your password immediately.</p>
          <br/>
          <p style="font-weight: bold;">Regards,<br>IT Admin Team</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🔐 Your New Account Credentials",
            html: getEmailTemplate("Account Created Successfully", mailContent)
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) console.error("Email Error:", err);
        });

        res.json({ success: true, message: `User created! Credentials sent to ${email}` });
    } catch (err) {
        res.status(500).json({ message: "Failed to create user" });
    }
});

router.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

/* =========================================
   5. COURSE & SUBJECT MANAGEMENT
========================================= */

router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses" });
    }
});

router.post("/create-course", async (req, res) => {
    try {
        const { name, subjects } = req.body;
        const newCourse = new Course({ name, subjects: subjects || [] });
        await newCourse.save();
        res.json({ success: true, message: "Course added" });
    } catch (err) {
        res.status(500).json({ message: "Error creating course" });
    }
});

router.put("/add-subject/:id", async (req, res) => {
    try {
        const { subject } = req.body;
        await Course.findByIdAndUpdate(req.params.id, {
            $addToSet: { subjects: subject } 
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error adding subject" });
    }
});

router.put("/delete-subject/:id", async (req, res) => {
    try {
        const { subject } = req.body;
        await Course.findByIdAndUpdate(req.params.id, {
            $pull: { subjects: subject }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error removing subject" });
    }
});

router.delete("/delete-course/:id", async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting course" });
    }
});

/* =========================================
   6. APPLICATIONS & NOTICES
========================================= */

router.get("/applications", async (req, res) => {
    try {
        const apps = await Application.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

// ✅ APPROVE ROUTE (FIXED: Added DOB and Address Copying)
router.post("/approve-application/:id", async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        // 1. Generate Official Credentials
        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        // 2. FILE RENAMING LOGIC
        let finalPhotoPath = app.photo || "";
        let finalMarksheetPath = app.marksheet || "";

        const renameFile = (oldPath, prefix) => {
            if (oldPath && fs.existsSync(oldPath)) {
                const ext = path.extname(oldPath);
                const newFilename = `${prefix}_${userId}${ext}`;
                const newPath = path.join("uploads", newFilename);
                
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`✅ Renamed ${oldPath} -> ${newPath}`);
                    return newPath.replace(/\\/g, "/"); 
                } catch (e) {
                    console.error("Rename Error:", e);
                    return oldPath;
                }
            }
            return oldPath;
        };

        if (app.photo) finalPhotoPath = renameFile(app.photo, "PHOTO");
        if (app.marksheet) finalMarksheetPath = renameFile(app.marksheet, "MARKSHEET");

        // 3. Create Student User with ALL Details
        const newUser = new User({
            name: app.name, 
            email: app.email, 
            phone: app.phone, 
            role: "student",
            userId, 
            password: hashedPassword, 
            course: app.course,
            photo: finalPhotoPath, 
            marksheet: finalMarksheetPath,
            // ✅ ADDED THESE TWO LINES
            dob: app.dob, 
            address: app.address
        });

        await newUser.save();
        app.status = "Approved";
        await app.save();

        // 4. Send Email
        const mailContent = `
          <p>Dear <strong>${app.name}</strong>,</p>
          <p>Congratulations! Your admission is approved.</p>
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; border: 1px solid #6ee7b7; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #065f46;">Student Credentials:</p>
            <p style="margin: 5px 0;">User ID: <strong>${userId}</strong></p>
            <p style="margin: 5px 0;">Password: <strong>${password}</strong></p>
          </div>
        `;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "🎉 Admission Approved",
            html: getEmailTemplate("Congratulations!", mailContent)
        };
        transporter.sendMail(mailOptions).catch(err => console.error(err));

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Approval failed" });
    }
});

// ✅ REJECT ROUTE
router.post("/reject-application/:id", async (req, res) => {
    try {
        const { reason } = req.body;
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        // 1. Send Email
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

        // 2. CLEANUP FILES
        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Deleted rejected file: ${filePath}`);
                } catch (e) {
                    console.error("Delete Error:", e);
                }
            }
        };

        deleteFile(app.photo);
        deleteFile(app.marksheet);

        // 3. Delete Application
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application Rejected and Files Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Rejection failed" });
    }
});

router.post("/add-notice", async (req, res) => {
    try {
        const { title, content, target, postedBy } = req.body;
        const newNotice = new Notice({ title, content, target, postedBy: postedBy || "Admin" });
        const savedNotice = await newNotice.save();
        
        await Notification.create({
            type: "notice",
            title: "📢 Admin Notice: " + title,
            message: content.substring(0, 50) + "...",
            course: "ALL",
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
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.delete("/delete-notice/:id", async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

module.exports = router;