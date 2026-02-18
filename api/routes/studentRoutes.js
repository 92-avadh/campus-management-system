const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

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
// ✅ TEMP STORAGE CONFIGURATION
// =========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";
    
    // Store applications in a specific subfolder
    if (file.fieldname === "photo" || file.fieldname === "marksheet") {
        folder = path.join(__dirname, "../uploads/applications");
    } else if (file.fieldname === "file") {
        folder = path.join(__dirname, "../uploads/doubts");
    } else {
        folder = path.join(__dirname, "../uploads/others");
    }

    // Ensure folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // ✅ Logic: TEMP_TYPE_EMAIL_TIMESTAMP.ext
    // Clean email to be filename-safe (replace special chars with _)
    const emailStr = req.body.email ? req.body.email.replace(/[^a-zA-Z0-9]/g, "_") : "applicant";
    const fileType = file.fieldname.toUpperCase(); // PHOTO or MARKSHEET
    const ext = path.extname(file.originalname);
    
    // Example: TEMP_PHOTO_john_gmail_com_1789922.jpg
    cb(null, `TEMP_${fileType}_${emailStr}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// HTML Email Helper
const getHtmlTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
    <div style="color: #475569; line-height: 1.6;">${bodyContent}</div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} Campus Management System</p>
  </div>
</body>
</html>
`;

/* =========================================
   1. APPLY FOR ADMISSION (Saves Temp Files)
========================================= */
router.post("/apply", upload.fields([{ name: "photo" }, { name: "marksheet" }]), async (req, res) => {
    try {
      const { email, name, course } = req.body;

      // Check existing users/applications
      const existingStudent = await User.findOne({ email });
      if (existingStudent) return res.status(400).json({ message: "You are already enrolled as a student." });

      const pendingApp = await Application.findOne({ email });
      if (pendingApp) return res.status(400).json({ message: "Application already submitted!" });

      const newApp = new Application(req.body);

      // ✅ Store the RELATIVE path (e.g., "uploads/applications/TEMP_PHOTO_....jpg")
      if (req.files['photo']) {
        newApp.photo = "uploads/applications/" + req.files['photo'][0].filename;
      }
      if (req.files['marksheet']) {
        newApp.marksheet = "uploads/applications/" + req.files['marksheet'][0].filename;
      }
      
      await newApp.save();

      // Email Notification
      const mailOptions = {
        from: `Admissions <${process.env.EMAIL_USER}>`, 
        to: email,
        subject: "✅ Application Received",
        html: getHtmlTemplate("Application Submitted", `
          <p>Dear <strong>${name}</strong>,</p>
          <p>We have received your application for <strong>${course}</strong>.</p>
          <p>Our team will review your documents shortly.</p>
        `)
      };
      
      transporter.sendMail(mailOptions).catch(err => console.log("Email Failed", err));

      res.json({ message: "Application submitted successfully!" });
    } catch (err) { 
        console.error("Apply Error:", err);
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
    
    let normalizedCourse = "BCA"; 
    if (rawCourse.includes("BBA") || rawCourse.includes("BUSINESS")) normalizedCourse = "BBA";
    else if (rawCourse.includes("BCOM") || rawCourse.includes("COMMERCE")) normalizedCourse = "BCOM";

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

    if (existing) return res.status(400).json({ message: "Attendance already marked." });

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
   5. NOTIFICATIONS
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
   6. FACULTY & DOUBTS
========================================= */
router.get("/faculty-list/:department", async (req, res) => {
  try {
    let rawDept = req.params.department.trim().toUpperCase();
    
    if (rawDept === "ALL" || rawDept === "UNDEFINED") {
       const allFaculty = await User.find({ role: "faculty" }).select("name _id department");
       return res.json(allFaculty);
    }

    let searchRegex;
    if (rawDept.includes("BCA") || rawDept.includes("COMPUTER") || rawDept.includes("CS")) {
        searchRegex = /BCA|COMPUTER|CS|IT/i;
    } else if (rawDept.includes("BBA") || rawDept.includes("BUSINESS")) {
        searchRegex = /BBA|BUSINESS|MANAGEMENT/i;
    } else if (rawDept.includes("BCOM") || rawDept.includes("COMMERCE")) {
        searchRegex = /BCOM|COMMERCE|ACCOUNT/i;
    } else {
        searchRegex = new RegExp(rawDept, "i");
    }

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
      file: req.file ? "uploads/doubts/" + req.file.filename : null 
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
   7. UTILS & DOWNLOAD
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
  
router.get("/download/:materialId", async (req, res) => {
    try {
      const material = await Material.findById(req.params.materialId);
      if (!material) return res.status(404).json({ message: "Not found" });
      
      if (material.filePath.startsWith("http")) return res.redirect(material.filePath);
      
      const absolutePath = path.join(__dirname, "../", material.filePath);
      if (fs.existsSync(absolutePath)) res.download(absolutePath);
      else res.status(404).json({ message: "File not found on server" });

    } catch (err) { res.status(500).json({ message: "Download failed" }); }
});

router.get("/timetable/:course", async (req, res) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
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