const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Models
const User = require("../models/User");
const Notice = require("../models/Notice");
const Notification = require("../models/Notification"); 
const Application = require("../models/Application");
const Course = require("../models/Course");

/* =========================================
   0. EMAIL CONFIGURATION & TEMPLATE
========================================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #1e293b; margin-top: 0; text-align: center;">${title}</h2>
    <div style="color: #475569; line-height: 1.6; margin: 20px 0;">${content}</div>
    <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      © ${new Date().getFullYear()} Campus Management System
    </div>
  </div>
</body>
</html>
`;

/* =========================================
   1. ADMIN AUTH
========================================= */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await User.findOne({ 
            $or: [{ email: username }, { userId: username }], 
            role: "admin" 
        });

        if (!admin) {
            // Default Fallback Admin
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
   2. APPROVE APPLICATION (✅ RENAME & MOVE FILES)
========================================= */
router.post("/approve-application/:id", async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        // Generate Credentials
        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        let finalPhotoPath = app.photo || "";
        let finalMarksheetPath = app.marksheet || "";

        // ✅ FUNCTION: Rename Temp File -> Permanent File & Move to Main Uploads
        const processFile = (tempRelativePath, typePrefix) => {
            if (!tempRelativePath || tempRelativePath.startsWith("http")) return tempRelativePath;

            // 1. Resolve full path of the current TEMP file
            // Note: tempRelativePath comes from DB, e.g., "uploads/applications/TEMP_PHOTO_..."
            const oldAbsolutePath = path.join(__dirname, "../", tempRelativePath);

            if (fs.existsSync(oldAbsolutePath)) {
                const ext = path.extname(tempRelativePath);
                // 2. Define New Name: PHOTO_ST20261234.jpg
                const newFilename = `${typePrefix}_${userId}${ext}`;
                
                // 3. Define New Location: "uploads/PHOTO_ST....jpg" (Moving out of 'applications' subfolder)
                const newRelativePath = `uploads/${newFilename}`;
                const newAbsolutePath = path.join(__dirname, "../", newRelativePath);
                
                try {
                    // Rename and Move
                    fs.renameSync(oldAbsolutePath, newAbsolutePath);
                    // Return the new relative path for the DB
                    return newRelativePath.replace(/\\/g, "/"); 
                } catch (e) { 
                    console.error(`Error processing ${typePrefix}:`, e);
                    return tempRelativePath; // Fallback to old path if move fails
                }
            }
            return tempRelativePath;
        };

        // Process Files
        if (app.photo) finalPhotoPath = processFile(app.photo, "PHOTO");
        if (app.marksheet) finalMarksheetPath = processFile(app.marksheet, "MARKSHEET");

        // Create Student User
        const newUser = new User({
            name: app.name, email: app.email, phone: app.phone, role: "student",
            userId, password: hashedPassword, course: app.course,
            photo: finalPhotoPath, marksheet: finalMarksheetPath,
            dob: app.dob, address: app.address
        });

        await newUser.save();
        
        // Mark Application as Approved
        app.status = "Approved";
        await app.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "🎉 Admission Approved",
            html: getEmailTemplate("Welcome to Campus!", `
              <p>Congratulations <strong>${app.name}</strong>!</p>
              <p>Your admission has been approved. Please use the credentials below to log in:</p>
              <div style="background: #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              <p>Please change your password after logging in.</p>
            `)
        };
        transporter.sendMail(mailOptions).catch(e => console.log("Email error:", e));

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
        console.error("Approval Error:", err);
        res.status(500).json({ message: "Approval failed" });
    }
});

/* =========================================
   3. REJECT APPLICATION (✅ DELETE TEMP FILES)
========================================= */
router.post("/reject-application/:id", async (req, res) => {
    try {
        const { reason } = req.body;
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        // Send Rejection Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: app.email,
            subject: "Application Status Update",
            html: getEmailTemplate("Application Update", `
              <p>Dear <strong>${app.name}</strong>,</p>
              <p>We regret to inform you that your application has been rejected.</p>
              <p><strong>Reason:</strong> ${reason}</p>
            `)
        };
        transporter.sendMail(mailOptions).catch(e => console.log(e));

        // ✅ FUNCTION: Delete Local File
        const deleteFile = (relativePath) => {
            if (relativePath && !relativePath.startsWith("http")) {
                const absolutePath = path.join(__dirname, "../", relativePath);
                if (fs.existsSync(absolutePath)) {
                    try {
                        fs.unlinkSync(absolutePath); // 🗑️ DELETE FILE
                        console.log(`Deleted rejected file: ${absolutePath}`);
                    } catch (e) { console.error("Delete Error:", e); }
                }
            }
        };

        // Delete associated files
        deleteFile(app.photo);
        deleteFile(app.marksheet);

        // Delete Application Record
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application Rejected & Files Deleted" });
    } catch (err) { res.status(500).json({ message: "Rejection failed" }); }
});

/* =========================================
   4. NOTICE MANAGEMENT
========================================= */
router.post("/add-notice", async (req, res) => {
    try {
        const { title, content, target } = req.body; 
        const finalTarget = target || "student";

        const newNotice = new Notice({ 
            title, content, target: finalTarget, postedBy: "Admin" 
        });
        
        const savedNotice = await newNotice.save();

        let notificationCourse = "STUDENT_ALL"; 
        if (finalTarget === "faculty") notificationCourse = "FACULTY_ALL";
        else if (finalTarget === "student" || finalTarget === "all") notificationCourse = "STUDENT_ALL";
        else notificationCourse = finalTarget.toUpperCase(); 

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
   5. USERS & COURSES
========================================= */
router.get("/stats", async (req, res) => {
    try {
        const students = await User.countDocuments({ role: "student" });
        const faculty = await User.countDocuments({ role: "faculty" });
        const applications = await Application.countDocuments({ status: "Pending" });
        const courses = await Course.countDocuments();
        res.json({ students, faculty, applications, courses });
    } catch (err) { res.status(500).json({ message: "Error fetching stats" }); }
});

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
        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email, phone, role, userId, password: hashedPassword, department
        });
        await newUser.save();
        
        const mailOptions = {
            from: process.env.EMAIL_USER, to: email,
            subject: "Welcome to Campus System",
            html: getEmailTemplate("Account Created", `<p>User ID: ${userId}<br>Password: ${password}</p>`)
        };

        transporter.sendMail(mailOptions).catch(e => console.log(e));
        res.json({ success: true, message: "User created & Email sent!" });
    } catch (err) { res.status(500).json({ message: "User created but Email failed" }); }
});

router.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.get("/applications", async (req, res) => {
    try {
        const apps = await Application.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

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