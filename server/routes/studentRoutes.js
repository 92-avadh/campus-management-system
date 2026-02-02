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
const Notification = require("../models/Notification"); 
const AttendanceSession = require("../models/AttendanceSession"); 
const Timetable = require("../models/Timetable");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ✅ UNIFIED EMAIL TEMPLATE
const getHtmlTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 0; margin: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 40px; text-align: center; color: white; }
    .content { padding: 40px; color: #334155; line-height: 1.7; }
    .status-badge { background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block; margin: 10px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
      <h1 style="margin: 0; font-size: 22px;">Campus Admission</h1>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">© ${new Date().getFullYear()} Campus Management System</div>
  </div>
</body>
</html>
`;

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const safeEmail = req.body.email ? req.body.email.replace(/[^a-zA-Z0-9]/g, "_") : "applicant";
        const type = file.fieldname.toUpperCase();
        cb(null, `TEMP_${type}_${safeEmail}_${Date.now()}${path.extname(file.originalname)}`);
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
      if (req.files['photo']) newApp.photo = req.files['photo'][0].path.replace(/\\/g, "/");
      if (req.files['marksheet']) newApp.marksheet = req.files['marksheet'][0].path.replace(/\\/g, "/");
      
      await newApp.save();

      // ✅ Redesigned Application Email
      const mailContent = `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for choosing our campus! We have successfully received your application for the <strong>${course}</strong> program.</p>
        <div style="text-align: center; margin: 25px 0;">
           <span class="status-badge">📄 Application Status: Pending Review</span>
        </div>
        <p>Our admin team will review your details and documents shortly. You will receive an email update once a decision has been made.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 14px; color: #64748b;"><strong>Details Submitted:</strong><br>Phone: ${phone}<br>Email: ${email}</p>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "✅ Application Received - Campus System",
        html: getHtmlTemplate("Application Submitted Successfully", mailContent)
      };
      
      // ✅ AWAIT EMAIL
      await transporter.sendMail(mailOptions);

      res.json({ message: "Application submitted successfully!" });
    } catch (err) { 
        console.error("Apply Error:", err);
        res.status(500).json({ message: "Application failed (Check Email)" }); 
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
    if (rawCourse.includes("BBA")) normalizedCourse = "BBA";
    else if (rawCourse.includes("COM")) normalizedCourse = "BCOM";

    const materials = await Material.find({ course: normalizedCourse, subject: decodedSubject })
      .populate("uploadedBy", "name").sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) { res.status(500).json({ message: "Error fetching materials" }); }
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
   6. FACULTY & DOUBTS
========================================= */
router.get("/faculty-list/:department", async (req, res) => {
  try {
    let dept = req.params.department.trim();
    if (dept.toUpperCase() === "ALL" || dept.toUpperCase() === "UNDEFINED") {
       const allFaculty = await User.find({ role: "faculty" }).select("name _id department");
       return res.json(allFaculty);
    }
    const faculty = await User.find({ role: "faculty", department: { $regex: new RegExp(dept, "i") } }).select("name _id department");
    res.json(faculty);
  } catch (err) { res.status(500).json({ message: "Error" }); }
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
   7. UTILS & TIMETABLE
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
      res.download(material.filePath, material.fileName);
    } catch (err) { res.status(500).json({ message: "Download failed" }); }
});

// GET: Fetch Today's Timetable
router.get("/timetable/:course", async (req, res) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

    const timetable = await Timetable.findOne({
      department: req.params.course, 
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json(timetable ? timetable.schedule : []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timetable" });
  }
});

// ✅ ADDED: PAYMENT ROUTE
router.post("/pay-fees", async (req, res) => {
    try {
      const { studentId, amount, semester } = req.body;
      
      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
  
      // Simulate Payment Record
      await Notification.create({
          type: "payment", // ✅ Uses valid enum 'payment'
          title: `💰 Fee Payment Successful`,
          message: `Received ₹${amount} for Semester ${semester}`,
          recipients: [{ studentId: student._id }],
          createdAt: new Date()
      });
  
      res.json({ success: true, message: "Payment Recorded Successfully!" });
  
    } catch (err) {
      console.error("Payment Error:", err);
      res.status(500).json({ message: "Payment Transaction Failed" });
    }
});

module.exports = router;