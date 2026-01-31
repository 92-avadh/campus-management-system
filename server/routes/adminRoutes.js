const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notice = require("../models/Notice");
const Notification = require("../models/Notification");
const Application = require("../models/Application");
const Course = require("../models/Course");

/* =========================================
   1. ADMIN AUTHENTICATION
========================================= */

/**
 * Admin Login
 * Checks database for a user with role 'admin'
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await User.findOne({ 
            $or: [{ email: username }, { userId: username }], 
            role: "admin" 
        });

        if (!admin) {
            // Fallback for initial setup
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

/**
 * Fetch counts for the Admin Overview cards
 */
router.get("/stats", async (req, res) => {
    try {
        const students = await User.countDocuments({ role: "student" });
        const faculty = await User.countDocuments({ role: "faculty" });
        const applications = await Application.countDocuments({ status: "Pending" });
        const courses = await Course.countDocuments();

        // Returns keys matching the frontend AdminOverview component
        res.json({ students, faculty, applications, courses });
    } catch (err) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

/* =========================================
   3. ADMIN PROFILE MANAGEMENT
========================================= */

/**
 * Get profile details for the logged-in admin
 */
router.get("/profile/:id", async (req, res) => {
    try {
        const admin = await User.findById(req.params.id).select("-password");
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin details" });
    }
});

/**
 * Update admin profile information
 */
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

/**
 * Change admin password
 */
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

/**
 * Fetch all users for the Manage User tab
 */
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

/**
 * Manually add a Faculty or Admin user
 */
router.post("/add-user", async (req, res) => {
    try {
        const { name, email, phone, role, department } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const prefix = role === "admin" ? "AD" : "FA";
        const userId = `${prefix}${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedPassword = await bcrypt.hash("college123", 10);

        const newUser = new User({
            name, email, phone, role, userId,
            password: hashedPassword,
            department: role === "faculty" ? department : undefined
        });

        await newUser.save();
        res.json({ success: true, message: "User created! Default password: college123" });
    } catch (err) {
        res.status(500).json({ message: "Failed to create user" });
    }
});

/**
 * Permanently remove user access
 */
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

/**
 * Get all courses and their subjects
 */
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses" });
    }
});

/**
 * Create a new course with an initial subjects list
 */
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

/**
 * Add a single subject to an existing course
 */
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

/**
 * Remove a single subject from a course
 */
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

/**
 * Delete an entire course
 */
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

        const password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

        const newUser = new User({
            name: app.name, email: app.email, phone: app.phone, role: "student",
            userId, password: hashedPassword, course: app.course
        });

        await newUser.save();
        app.status = "Approved";
        await app.save();

        res.json({ success: true, message: "Student Approved!", userId, password });
    } catch (err) {
        res.status(500).json({ message: "Approval failed" });
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