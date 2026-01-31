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
const Query = require("../models/Query"); 
const Notice = require("../models/Notice"); 

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// --- MULTER CONFIGURATION FOR FILE UPLOADS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // You can separate folders for different types of uploads
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

/* =========================================
   1. APPLY FOR ADMISSION
========================================= */
router.post("/apply", upload.fields([{ name: "photo" }, { name: "marksheet" }]), async (req, res) => {
    try {
      const { email, name, phone, course, address } = req.body;
      const existingStudent = await User.findOne({ email });
      if (existingStudent) return res.status(400).json({ message: "You are already enrolled as a student." });

      const pendingApp = await Application.findOne({ email });
      if (pendingApp) return res.status(400).json({ message: "Application already submitted!" });

      const newApp = new Application(req.body);
      if (req.files['photo']) newApp.photo = req.files['photo'][0].path;
      if (req.files['marksheet']) newApp.marksheet = req.files['marksheet'][0].path;
      await newApp.save();

      res.json({ message: "Application submitted successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Application failed" });
    }
});

/* =========================================
   2. GET MATERIALS
========================================= */
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const rawCourse = decodeURIComponent(req.params.course).toUpperCase();
    const decodedSubject = decodeURIComponent(req.params.subject).trim();
    let normalizedCourse = rawCourse.includes("BCA") ? "BCA" : rawCourse.includes("BBA") ? "BBA" : "BCOM";

    const materials = await Material.find({ course: normalizedCourse, subject: decodedSubject })
      .populate("uploadedBy", "name").sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) { res.status(500).json({ message: "Error fetching materials" }); }
});

/* =========================================
   3. MARK ATTENDANCE
========================================= */
router.post("/mark-attendance", async (req, res) => {
  try {
    const { studentId, qrData } = req.body;
    let parsedData;
    try { parsedData = JSON.parse(qrData); } catch (e) { return res.status(400).json({ message: "Invalid QR" }); }
    
    if ((Date.now() - parsedData.timestamp) / 1000 > 30) return res.status(400).json({ message: "QR Expired!" });

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    
    const existing = await Attendance.findOne({
      studentId,
      subject: parsedData.subject,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) return res.status(400).json({ message: "Attendance already marked." });

    await new Attendance({ studentId, subject: parsedData.subject, status: "Present", date: new Date() }).save();
    res.json({ success: true, message: "Attendance Marked!" });
  } catch (err) { res.status(500).json({ message: "Attendance Error" }); }
});

/* =========================================
   4. ATTENDANCE HISTORY
========================================= */
router.get("/attendance/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: "Error fetching attendance" }); }
});

/* =========================================
   5. PROFILE & SETTINGS
========================================= */
router.get("/profile/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    const { email, phone, address } = req.body;
    await User.findByIdAndUpdate(req.params.id, { email, phone, address });
    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (err) { res.status(500).json({ success: false, message: "Error updating profile" }); }
});

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
  } catch (err) { res.status(500).json({ success: false, message: "Error changing password" }); }
});

/* =========================================
   6. GET NOTIFICATIONS
========================================= */
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ count: 0, latest: [] });

    const unreadMaterials = await Material.find({
      course: student.course,
      viewedBy: { $ne: student._id }
    }).sort({ uploadDate: -1 }).limit(5);

    res.json({
      count: unreadMaterials.length,
      notifications: unreadMaterials.map(m => ({
        id: m._id, text: `New material: ${m.title}`, time: new Date(m.uploadDate).toLocaleTimeString(), subject: m.subject
      }))
    });
  } catch (err) { res.status(500).json({ count: 0, latest: [] }); }
});

/* =========================================
   7. GET FACULTY LIST - ✅ FIXED (HANDLES 'ALL' & MISMATCHES)
========================================= */
router.get("/faculty-list/:department", async (req, res) => {
  try {
    let dept = req.params.department.trim();
    console.log(`🔍 Searching faculty for: "${dept}"`);
    
    // ✅ 0. IF "ALL" or "UNDEFINED", RETURN ALL FACULTY IMMEDIATELY
    if (dept.toUpperCase() === "ALL" || dept.toUpperCase() === "UNDEFINED") {
       const allFaculty = await User.find({ role: "faculty" }).select("name _id department");
       console.log(`✅ Returned ALL ${allFaculty.length} faculty members.`);
       return res.json(allFaculty);
    }

    // 1. PRIMARY SEARCH: Standard Regex Match
    let faculty = await User.find({
      role: "faculty",
      department: { $regex: new RegExp(dept, "i") } 
    }).select("name _id department");
    
    // 2. FALLBACK 1: Smart Match (Strip punctuation)
    if (faculty.length === 0) {
      const cleanDept = dept.replace(/[^a-zA-Z0-9]/g, ""); 
      if (cleanDept.length > 0 && cleanDept !== dept) {
        faculty = await User.find({
            role: "faculty",
            department: { $regex: new RegExp(cleanDept, "i") }
        }).select("name _id department");
      }
    }

    // 3. FALLBACK 2: Broad Search (Keywords)
    if (faculty.length === 0) {
      let keyword = "";
      if (/computer|bca/i.test(dept)) keyword = "BCA";
      else if (/management|bba/i.test(dept)) keyword = "BBA";
      else if (/commerce|bcom/i.test(dept)) keyword = "BCom";

      if (keyword) {
        faculty = await User.find({
          role: "faculty",
          department: { $regex: new RegExp(keyword, "i") }
        }).select("name _id department");
      }
    }

    // 4. ULTIMATE FALLBACK: Return ALL Faculty if nothing matched
    if (faculty.length === 0) {
      console.log("⚠️ No specific matches found. Returning ALL faculty.");
      faculty = await User.find({ role: "faculty" }).select("name _id department");
    }

    console.log(`✅ Returning ${faculty.length} faculty members.`);
    res.json(faculty);

  } catch (err) { 
    console.error("❌ Faculty list error:", err);
    res.status(500).json({ message: "Error fetching faculty" }); 
  }
});

/* =========================================
   8. ASK A DOUBT (WITH OPTIONAL FILE UPLOAD)
========================================= */
router.post("/ask-doubt", upload.single("file"), async (req, res) => {
  try {
    const { studentId, facultyId, subject, question, course, department, studentName } = req.body;
    
    const newQuery = new Query({
      student: studentId, 
      studentName, 
      faculty: facultyId, 
      course, 
      department, 
      subject, 
      question,
      file: req.file ? req.file.path : null 
    });

    await newQuery.save();
    res.json({ success: true, message: "Doubt sent to faculty!" });
  } catch (err) { 
    console.error("Doubt Error:", err);
    res.status(500).json({ success: false, message: "Failed to send doubt" }); 
  }
});

/* =========================================
   9. GET MY DOUBTS
========================================= */
router.get("/my-doubts/:studentId", async (req, res) => {
  try {
    const doubts = await Query.find({ student: req.params.studentId })
      .populate("faculty", "name").sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) { res.status(500).json({ message: "Error fetching doubts" }); }
});

/* =========================================
   10. GET ALL NOTICES
========================================= */
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find({
      target: { $in: ["student", "all"] }
    }).sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================
   11. TOGGLE BOOKMARK
========================================= */
router.post("/toggle-bookmark", async (req, res) => {
  try {
    const { studentId, noticeId } = req.body;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const exists = user.bookmarks.find(b => b.noticeId === noticeId);
    
    if (exists) {
      user.bookmarks = user.bookmarks.filter(b => b.noticeId !== noticeId);
      await user.save();
      return res.json({ success: true, message: "Removed from bookmarks", bookmarks: user.bookmarks });
    } else {
      const notice = await Notice.findById(noticeId);
      if (!notice) return res.status(404).json({ message: "Notice expired or not found" });

      user.bookmarks.push({
        noticeId: notice._id.toString(),
        title: notice.title,
        content: notice.content,
        date: notice.date,
        sender: notice.postedBy
      });
      await user.save();
      return res.json({ success: true, message: "Saved to bookmarks", bookmarks: user.bookmarks });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating bookmarks" });
  }
});

/* =========================================
   12. FILE OPERATIONS
========================================= */
router.post("/view-material/:materialId", async (req, res) => {
    try {
      await Material.findByIdAndUpdate(req.params.materialId, {
        $addToSet: { viewedBy: req.body.studentId },
        isNewForStudents: false
      });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});
  
router.get("/download/:materialId", async (req, res) => {
    try {
      const material = await Material.findById(req.params.materialId);
      if (!material) return res.status(404).json({ message: "Material not found" });
      res.download(material.filePath, material.fileName);
    } catch (err) { res.status(500).json({ message: "Download failed" }); }
});

module.exports = router;