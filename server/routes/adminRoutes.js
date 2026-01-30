const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notice = require("../models/Notice"); // ✅ Import Notice
const Notification = require("../models/Notification"); // ✅ Import Notification
const Application = require("../models/Application");
const Course = require("../models/Course"); // For dashboard stats

/* =========================================
   1. ADMIN LOGIN (Dummy Check or DB Check)
========================================= */
// Note: In production, use real admin collection or User role="admin"
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    // Hardcoded for demo/project simplicity
    if (username === "admin" && password === "admin123") {
        return res.json({ 
            success: true, 
            token: "admin-token-secret", 
            user: { name: "Administrator", role: "admin" } 
        });
    }
    res.status(401).json({ message: "Invalid Credentials" });
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
   3. NOTICES (✅ FIX FOR CRASH)
========================================= */
router.post("/add-notice", async (req, res) => {
    try {
        const { title, content, target, postedBy } = req.body;

        // 1. Create Notice
        const newNotice = new Notice({
            title,
            content,
            target,
            postedBy: postedBy || "Admin"
        });
        const savedNotice = await newNotice.save();

        // 2. Create Notification
        // ⚠️ CRITICAL FIX: Do NOT pass 'createdBy' if it is just a string like "Admin".
        // The Notification model expects an ObjectId for 'createdBy'.
        // Leaving it undefined prevents the CastError.
        
        await Notification.create({
            type: "notice",
            title: "📢 Admin Notice: " + title,
            message: content.substring(0, 50) + "...", // Short preview
            course: "ALL", // Target everyone
            relatedId: savedNotice._id,
            relatedModel: "Notice",
            // createdBy: ... OMIT THIS FOR ADMIN
            createdAt: new Date()
        });

        res.json({ success: true, message: "Notice sent successfully!" });
    } catch (err) {
        console.error("Admin Notice Error:", err);
        res.status(500).json({ message: "Failed to send notice" });
    }
});

router.get("/notices", async (req, res) => {
    try {
        const notices = await Notice.find({ postedBy: "Admin" }).sort({ date: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notices" });
    }
});

router.delete("/delete-notice/:id", async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error deleting notice" });
    }
});

/* =========================================
   4. APPLICATIONS MANAGEMENT
========================================= */
router.get("/applications", async (req, res) => {
    try {
        const apps = await Application.find().sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.post("/approve-application/:id", async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        // Create Student User
        // Generate random password or use phone number
        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate User ID (e.g., ST + Year + Random)
        const userId = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        const newUser = new User({
            name: app.name,
            email: app.email,
            phone: app.phone,
            role: "student",
            userId: userId,
            password: hashedPassword,
            course: app.course,
            address: app.address,
            photo: app.photo,
            marksheet: app.marksheet
        });

        await newUser.save();
        
        // Update Application Status
        app.status = "Approved";
        await app.save();

        // In production: Send email to student with userId & password here

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Approval failed" });
    }
});

router.delete("/reject-application/:id", async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application Rejected" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

/* =========================================
   5. USER MANAGEMENT
========================================= */
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

/* =========================================
   6. COURSE MANAGEMENT
========================================= */
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.post("/add-course", async (req, res) => {
    try {
        const { name, duration, fees, description } = req.body;
        const newCourse = new Course({ name, duration, fees, description, subjects: [] });
        await newCourse.save();
        res.json({ success: true, message: "Course added" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

router.delete("/delete-course/:id", async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

module.exports = router;