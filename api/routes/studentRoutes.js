const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Models
const Application = require("../models/Application");
const User = require("../models/User");
const Material = require("../models/Material");
const Attendance = require("../models/Attendance");
const Query = require("../models/Query"); 
const Notice = require("../models/Notice"); 
const Notification = require("../models/Notification"); 
const AttendanceSession = require("../models/AttendanceSession"); 
const Timetable = require("../models/Timetable");

// =========================================
// EMAIL CONFIGURATION
// =========================================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// =========================================
// CLOUDINARY CONFIGURATION
// =========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "campus_admissions",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx"],
    resource_type: "auto"
  }
});

const upload = multer({ storage });

// HTML Email Template Helper
const getHtmlTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 40px; text-align: center; color: white; }
    .content { padding: 40px; color: #334155; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎓 Admission</h1></div>
    <div class="content"><h2>${title}</h2>${bodyContent}</div>
    <div class="footer">© ${new Date().getFullYear()} Campus Management System</div>
  </div>
</body>
</html>
`;

/* =========================================
   1. APPLY FOR ADMISSION
========================================= */
router.post("/apply", upload.fields([{ name: "photo" }, { name: "marksheet" }]), async (req, res) => {
    try {
      const { email, name, phone, course } = req.body;
      const existingStudent = await User.findOne({ email });
      if (existingStudent) return res.status(400).json({ message: "You are already enrolled as a student." });

      const pendingApp = await Application.findOne({ email });
      if (pendingApp) return res.status(400).json({ message: "Application already submitted!" });

      const newApp = new Application(req.body);
      if (req.files['photo']) newApp.photo = req.files['photo'][0].path;
      if (req.files['marksheet']) newApp.marksheet = req.files['marksheet'][0].path;
      
      await newApp.save();

      // Email Notification
      const mailContent = `
        <p>Dear <strong>${name}</strong>,</p>
        <p>We received your application for <strong>${course}</strong>.</p>
        <p>Our team will review it shortly.</p>
      `;

      const mailOptions = {
        from: `Campus Admissions <${process.env.EMAIL_USER}>`, 
        to: email,
        subject: "✅ Application Received",
        html: getHtmlTemplate("Application Submitted", mailContent)
      };
      
      transporter.sendMail(mailOptions).catch(err => console.log("Email Failed", err));

      res.json({ message: "Application submitted successfully!" });
    } catch (err) { 
        console.error("Apply Error:", err);
        res.status(500).json({ message: "Application failed (Check Email)" }); 
    }
});

/* =========================================
   2. GET MATERIALS (STRICT COURSE MATCH)
========================================= */
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const rawCourse = decodeURIComponent(req.params.course).toUpperCase();
    const decodedSubject = decodeURIComponent(req.params.subject).trim();
    
    // Normalize Course
    let normalizedCourse = "BCA"; 
    if (rawCourse.includes("BBA") || rawCourse.includes("BUSINESS")) {
        normalizedCourse = "BBA";
    } 
    else if (rawCourse.includes("BCOM") || rawCourse.includes("COMMERCE")) {
        normalizedCourse = "BCOM";
    } 
    else {
        normalizedCourse = "BCA";
    }

    // Case Insensitive Subject Search
    const materials = await Material.find({ 
        course: normalizedCourse, 
        subject: { $regex: new RegExp(`^${decodedSubject}$`, "i") } 
    })
    .populate("uploadedBy", "name")
    .sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching materials" }); 
  }
});

/* =========================================
   3. ATTENDANCE OPERATIONS
========================================= */
router.post("/mark-attendance", async (req, res) => {
  try {
    const { studentId, qrData, manualCode } = req.body;
    let subject;

    if (manualCode) {
        const session = await AttendanceSession.findOne({ token: manualCode });
        if (!session) return res.status(400).json({ message: "Invalid Code" });
        if (new Date() > session.expiresAt) return res.status(400).json({ message: "Code Expired" });
        subject = session.subject; 
    } 
    else if (qrData) {
        try { 
            const parsed = JSON.parse(qrData); 
            subject = parsed.subject;
            if ((Date.now() - parsed.timestamp) / 1000 > 45) return res.status(400).json({ message: "QR Expired! Scan again." });
        } catch (e) { return res.status(400).json({ message: "Invalid QR Data" }); }
    } else {
        return res.status(400).json({ message: "No data provided" });
    }

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    
    const existing = await Attendance.findOne({
      studentId, subject, date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) return res.status(400).json({ message: "Attendance already marked for today." });

    await new Attendance({ studentId, subject, status: "Present", date: new Date() }).save();
    res.json({ success: true, message: `Present marked for ${subject}!` });

  } catch (err) { 
    res.status(500).json({ message: "Attendance Error" }); 
  }
});

router.get("/attendance/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: "Error fetching attendance" }); }
});

/* =========================================
   4. PROFILE & SETTINGS
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
  } catch (err) { res.status(500).json({ success: false }); }
});

router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

/* =========================================
   5. GET NOTIFICATIONS
========================================= */
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ count: 0, notifications: [] });

    const unreadMaterials = await Material.find({
      course: student.course,
      viewedBy: { $ne: student._id }
    }).sort({ uploadDate: -1 }).limit(5);

    const materialNotifs = unreadMaterials.map(m => ({
        id: m._id, text: `New material: ${m.title}`,
        time: new Date(m.uploadDate).toLocaleTimeString(), type: "material"
    }));

    const systemNotifications = await Notification.find({
        $or: [
            { course: "STUDENT_ALL" },           
            { course: "ALL" },                   
            { course: student.course },          
            { "recipients.studentId": student._id } 
        ]
    }).sort({ createdAt: -1 }).limit(10);

    const systemNotifs = systemNotifications.map(n => ({
        id: n._id, text: n.title,
        time: new Date(n.createdAt).toLocaleTimeString(), type: n.type
    }));

    const allNotifications = [...materialNotifs, ...systemNotifs]
        .sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ count: allNotifications.length, notifications: allNotifications });
  } catch (err) { 
    res.status(500).json({ count: 0, notifications: [] }); 
  }
});

/* =========================================
   6. FACULTY & DOUBTS (✅ FIXED FETCH LOGIC)
========================================= */
router.get("/faculty-list/:department", async (req, res) => {
  try {
    let rawDept = req.params.department.trim().toUpperCase();
    
    if (rawDept === "ALL" || rawDept === "UNDEFINED") {
       const allFaculty = await User.find({ role: "faculty" }).select("name _id department");
       return res.json(allFaculty);
    }

    // ✅ SMART MATCHING: If student is "BCA", find faculty in "Computer Science"
    let searchRegex;
    if (rawDept.includes("BCA") || rawDept.includes("COMPUTER") || rawDept.includes("CS")) {
        searchRegex = /BCA|COMPUTER|CS|IT/i;
    } else if (rawDept.includes("BBA") || rawDept.includes("BUSINESS") || rawDept.includes("MANAGEMENT")) {
        searchRegex = /BBA|BUSINESS|MANAGEMENT/i;
    } else if (rawDept.includes("BCOM") || rawDept.includes("COMMERCE") || rawDept.includes("ACCOUNT")) {
        searchRegex = /BCOM|COMMERCE|ACCOUNT/i;
    } else {
        searchRegex = new RegExp(rawDept, "i");
    }

    console.log(`🔍 Searching Faculty: ${rawDept} -> Regex: ${searchRegex}`);

    const faculty = await User.find({ 
        role: "faculty", 
        department: { $regex: searchRegex } 
    }).select("name _id department");
    
    res.json(faculty);
  } catch (err) { 
      res.status(500).json({ message: "Error" }); 
  }
});

router.post("/ask-doubt", upload.single("file"), async (req, res) => {
  try {
    const { studentId, facultyId, subject, question, course, department, studentName } = req.body;
    const newQuery = new Query({
      student: studentId, studentName, faculty: facultyId, 
      course, department, subject, question,
      file: req.file ? req.file.path : null 
    });
    await newQuery.save();
    res.json({ success: true, message: "Doubt sent!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

router.get("/my-doubts/:studentId", async (req, res) => {
  try {
    const doubts = await Query.find({ student: req.params.studentId }).populate("faculty", "name").sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

/* =========================================
   7. UTILS, TIMETABLE & DOWNLOAD (FIXED)
========================================= */
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find({ target: { $in: ["student", "all"] } }).sort({ date: -1 });
    res.json(notices);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.post("/toggle-bookmark", async (req, res) => {
  try {
    const { studentId, noticeId } = req.body;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const exists = user.bookmarks.find(b => b.noticeId === noticeId);
    if (exists) {
      user.bookmarks = user.bookmarks.filter(b => b.noticeId !== noticeId);
    } else {
      const notice = await Notice.findById(noticeId);
      if (notice) user.bookmarks.push({ noticeId: notice._id.toString(), title: notice.title, content: notice.content, date: notice.date, sender: notice.postedBy });
    }
    await user.save();
    res.json({ success: true, bookmarks: user.bookmarks });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.post("/view-material/:materialId", async (req, res) => {
    try {
      await Material.findByIdAndUpdate(req.params.materialId, { $addToSet: { viewedBy: req.body.studentId } });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});
  
// ✅ FIXED: DOWNLOAD CLOUDINARY FILE
router.get("/download/:materialId", async (req, res) => {
    try {
      const material = await Material.findById(req.params.materialId);
      if (!material) return res.status(404).json({ message: "Not found" });
      
      if (material.filePath.startsWith("http")) {
          return res.redirect(material.filePath);
      } 
      res.download(material.filePath);
    } catch (err) { res.status(500).json({ message: "Download failed" }); }
});

// ✅ FIXED: TIMETABLE FETCHING (ALL UPCOMING)
router.get("/timetable/:course", async (req, res) => {
  try {
    const startOfDay = new Date(); 
    startOfDay.setHours(0,0,0,0);
    
    // Normalize Course for Timetable
    const rawCourse = req.params.course.toUpperCase();
    let normalizedCourse = "BCA";
    if (rawCourse.includes("BBA") || rawCourse.includes("BUSINESS")) normalizedCourse = "BBA";
    else if (rawCourse.includes("BCOM") || rawCourse.includes("COMMERCE")) normalizedCourse = "BCOM";

    const timetables = await Timetable.find({
      department: normalizedCourse, 
      date: { $gte: startOfDay }
    }).sort({ date: 1 });

    const allSlots = timetables.reduce((acc, curr) => {
        const slotsWithDate = curr.schedule.map(slot => ({
            ...slot.toObject(),
            rawDate: curr.date 
        }));
        return acc.concat(slotsWithDate);
    }, []);

    res.json(allSlots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timetable" });
  }
});

/* =========================================
   8. PAYMENT
========================================= */
router.post("/pay-fees", async (req, res) => {
    try {
      const { studentId, amount, semester } = req.body;
      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
  
      await Notification.create({
          type: "payment", 
          title: `💰 Fee Payment Successful`,
          message: `Received ₹${amount} for Semester ${semester}`,
          recipients: [{ studentId: student._id }],
          createdAt: new Date()
      });
      res.json({ success: true, message: "Payment Recorded Successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Payment Transaction Failed" });
    }
});

module.exports = router;