const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Models
const Application = require("../models/Application");
const User = require("../models/User");
const Material = require("../models/Material");
const Attendance = require("../models/Attendance");

// ✅ EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ MULTER STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

/* =========================================
   1. APPLY FOR ADMISSION (Duplicate Check)
========================================= */
router.post(
  "/apply",
  upload.fields([{ name: "photo" }, { name: "marksheet" }]),
  async (req, res) => {
    try {
      const { email, name, phone, course, address } = req.body;

      // 1. Check if user is ALREADY A STUDENT (Enrolled)
      const existingStudent = await User.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ message: "You are already enrolled as a student." });
      }

      // 2. ✅ NEW: Check if application is PENDING
      // If found, they cannot re-apply. If rejected (and deleted), this will be null, so they CAN re-apply.
      const pendingApp = await Application.findOne({ email });
      if (pendingApp) {
        return res.status(400).json({ message: "Application already submitted! Please wait for admin review." });
      }

      // 3. Save New Application
      const newApp = new Application(req.body);
      if (req.files['photo']) newApp.photo = req.files['photo'][0].path;
      if (req.files['marksheet']) newApp.marksheet = req.files['marksheet'][0].path;
      await newApp.save();

      // 4. Attachments for Admin Email
      const attachments = [];
      if (req.files['photo']) attachments.push({ filename: 'Photo.jpg', path: req.files['photo'][0].path });
      if (req.files['marksheet']) attachments.push({ filename: 'Marksheet.pdf', path: req.files['marksheet'][0].path });

      // 5. Notify Admin
      const adminMailOptions = {
        from: `"ST College System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📄 New Admission Application: ${name}`,
        html: `
          <h3>New Application Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Please review the attached documents.</p>
        `,
        attachments
      };
      
      // 6. Acknowledge Student
      const studentMailOptions = {
        from: `"ST College Admissions" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎓 Application Received - ST College",
        html: `
          <p>Dear <strong>${name}</strong>,</p>
          <p>We have received your application for <strong>${course}</strong>.</p>
          <p>Our team will review it shortly. You will receive an update via email.</p>
        `
      };

      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(studentMailOptions);

      res.json({ message: "Application submitted successfully! Check your email." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Application failed" });
    }
  }
);

// ... (Rest of existing student routes like /materials, /mark-attendance remain here)
// Make sure to keep your existing routes below this point.

/* =========================================
   2. GET MATERIALS
========================================= */
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const rawCourse = decodeURIComponent(req.params.course).toUpperCase();
    const decodedSubject = decodeURIComponent(req.params.subject).trim();

    let normalizedCourse = rawCourse;
    if (rawCourse.includes("BCA")) normalizedCourse = "BCA";
    else if (rawCourse.includes("BBA")) normalizedCourse = "BBA";
    else if (rawCourse.includes("BCOM")) normalizedCourse = "BCOM";

    const materials = await Material.find({
      course: normalizedCourse,
      subject: decodedSubject
    })
      .populate("uploadedBy", "name")
      .sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching materials" });
  }
});

/* =========================================
   3. MARK MATERIAL AS VIEWED
========================================= */
router.post("/view-material/:materialId", async (req, res) => {
  try {
    await Material.findByIdAndUpdate(req.params.materialId, {
      $addToSet: { viewedBy: req.body.studentId },
      isNewForStudents: false
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================
   4. DOWNLOAD MATERIAL
========================================= */
router.get("/download/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.download(material.filePath, material.fileName);
  } catch (err) {
    res.status(500).json({ message: "Download failed" });
  }
});

/* =========================================
   5. MARK ATTENDANCE (QR)
========================================= */
router.post("/mark-attendance", async (req, res) => {
  try {
    const { studentId, qrData } = req.body;
    let parsedData;
    try { parsedData = JSON.parse(qrData); } catch (e) { return res.status(400).json({ message: "Invalid QR" }); }
    
    // Check Timeliness (30s)
    if ((Date.now() - parsedData.timestamp) / 1000 > 30) {
      return res.status(400).json({ message: "QR Expired!" });
    }

    // Check Duplicates
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    
    const existing = await Attendance.findOne({
      studentId,
      subject: parsedData.subject,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) return res.status(400).json({ message: "Attendance already marked." });

    await new Attendance({
      studentId,
      subject: parsedData.subject,
      status: "Present",
      date: new Date()
    }).save();

    res.json({ success: true, message: "Attendance Marked!" });
  } catch (err) {
    res.status(500).json({ message: "Attendance Error" });
  }
});

/* =========================================
   6. ATTENDANCE HISTORY
========================================= */
router.get("/attendance/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

/* =========================================
   7. GET PROFILE (Settings)
========================================= */
router.get("/profile/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================
   8. UPDATE PROFILE
========================================= */
router.put("/update-profile/:id", async (req, res) => {
  try {
    const { email, phone, address } = req.body;
    await User.findByIdAndUpdate(req.params.id, { email, phone, address });
    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

/* =========================================
   9. CHANGE PASSWORD (Student Settings)
========================================= */
router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error changing password" });
  }
});

/* =========================================
   10. GET NOTIFICATIONS (Auto-Refresh)
========================================= */
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ count: 0, latest: [] });

    // Find materials not viewed by student
    const unreadMaterials = await Material.find({
      course: student.course,
      viewedBy: { $ne: student._id }
    })
    .sort({ uploadDate: -1 })
    .limit(5);

    // ✅ NO CONSOLE LOGS HERE
    res.json({
      count: unreadMaterials.length,
      notifications: unreadMaterials.map(m => ({
        id: m._id,
        text: `New material: ${m.title}`,
        time: new Date(m.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: m.subject
      }))
    });

  } catch (err) {
    console.error("Notification Error:", err);
    res.status(500).json({ count: 0, latest: [] });
  }
});

module.exports = router;