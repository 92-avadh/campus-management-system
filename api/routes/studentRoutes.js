const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// ================= MODELS =================
const Application = require("../models/Application");
const User = require("../models/User");
const Material = require("../models/Material");
const Attendance = require("../models/Attendance");
const Query = require("../models/Query");
const Notice = require("../models/Notice");
const Notification = require("../models/Notification");
const AttendanceSession = require("../models/AttendanceSession");
const Timetable = require("../models/Timetable");

// ================= EMAIL CONFIG =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Gmail App Password
  }
});

transporter.verify((err) => {
  if (err) console.error("❌ Email Error:", err);
  else console.log("✅ Email Service Ready");
});

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "campus_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto"
  }
});

const upload = multer({ storage });

// ================= EMAIL TEMPLATE =================
const emailTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f4f6f8;padding:20px">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px">
    <h2 style="color:#1e3a8a">${title}</h2>
    ${body}
    <p style="font-size:12px;color:#888;margin-top:30px">
      © ${new Date().getFullYear()} Campus Management System
    </p>
  </div>
</body>
</html>
`;

// =================================================
// 1️⃣ APPLY FOR ADMISSION
// =================================================
router.post(
  "/apply",
  upload.fields([{ name: "photo" }, { name: "marksheet" }]),
  async (req, res) => {
    try {
      const { email, name, course } = req.body;

      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Already enrolled" });
      }

      if (await Application.findOne({ email })) {
        return res.status(400).json({ message: "Application already exists" });
      }

      const app = new Application(req.body);
      if (req.files.photo) app.photo = req.files.photo[0].path;
      if (req.files.marksheet) app.marksheet = req.files.marksheet[0].path;

      await app.save();

      await transporter.sendMail({
        from: `Campus Admission <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "✅ Application Received",
        html: emailTemplate(
          "Application Submitted",
          `<p>Hello <b>${name}</b>,</p>
           <p>Your application for <b>${course}</b> is received.</p>`
        )
      });

      res.json({ success: true, message: "Application submitted" });
    } catch (err) {
      console.error("Apply Error:", err);
      res.status(500).json({ message: "Application failed" });
    }
  }
);

// =================================================
// 2️⃣ MATERIALS
// =================================================
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const course = decodeURIComponent(req.params.course).toUpperCase();
    const subject = decodeURIComponent(req.params.subject).trim();

    const materials = await Material.find({
      course,
      subject
    })
      .sort({ uploadDate: -1 })
      .populate("uploadedBy", "name");

    res.json(materials);
  } catch {
    res.status(500).json({ message: "Material fetch failed" });
  }
});

// =================================================
// 3️⃣ ATTENDANCE
// =================================================
router.post("/mark-attendance", async (req, res) => {
  try {
    const { studentId, qrData, manualCode } = req.body;
    let subject;

    if (manualCode) {
      const session = await AttendanceSession.findOne({ token: manualCode });
      if (!session || new Date() > session.expiresAt)
        return res.status(400).json({ message: "Invalid / Expired Code" });
      subject = session.subject;
    } else if (qrData) {
      const parsed = JSON.parse(qrData);
      if ((Date.now() - parsed.timestamp) / 1000 > 45)
        return res.status(400).json({ message: "QR expired" });
      subject = parsed.subject;
    } else {
      return res.status(400).json({ message: "No data provided" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const already = await Attendance.findOne({
      studentId,
      subject,
      date: { $gte: todayStart }
    });

    if (already)
      return res.status(400).json({ message: "Already marked" });

    await Attendance.create({
      studentId,
      subject,
      status: "Present",
      date: new Date()
    });

    res.json({ success: true, message: "Attendance marked" });
  } catch (err) {
    res.status(500).json({ message: "Attendance error" });
  }
});

router.get("/attendance/:studentId", async (req, res) => {
  const records = await Attendance.find({ studentId: req.params.studentId });
  res.json(records);
});

// =================================================
// 4️⃣ PROFILE
// =================================================
router.get("/profile/:id", async (req, res) => {
  const student = await User.findById(req.params.id).select("-password");
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
});

router.put("/change-password/:id", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    return res.status(400).json({ message: "Wrong password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "Password changed" });
});

// =================================================
// 5️⃣ NOTIFICATIONS
// =================================================
router.get("/notifications/:studentId", async (req, res) => {
  const notices = await Notification.find({
    "recipients.studentId": req.params.studentId
  }).sort({ createdAt: -1 });

  res.json(notices);
});

// =================================================
// 6️⃣ DOUBTS
// =================================================
router.post("/ask-doubt", upload.single("file"), async (req, res) => {
  try {
    const doubt = new Query({
      ...req.body,
      file: req.file ? req.file.path : null
    });
    await doubt.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.get("/my-doubts/:studentId", async (req, res) => {
  const doubts = await Query.find({ student: req.params.studentId })
    .populate("faculty", "name")
    .sort({ createdAt: -1 });
  res.json(doubts);
});

// =================================================
// 7️⃣ NOTICES & TIMETABLE
// =================================================
router.get("/notices", async (req, res) => {
  const notices = await Notice.find().sort({ date: -1 });
  res.json(notices);
});

router.get("/timetable/:course", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const timetable = await Timetable.findOne({
    department: req.params.course,
    date: { $gte: start }
  });

  res.json(timetable ? timetable.schedule : []);
});

// =================================================
// 8️⃣ PAYMENT (MOCK)
// =================================================
router.post("/pay-fees", async (req, res) => {
  const { studentId, amount, semester } = req.body;

  await Notification.create({
    type: "payment",
    title: "💰 Fee Payment Successful",
    message: `₹${amount} paid for semester ${semester}`,
    recipients: [{ studentId }]
  });

  res.json({ success: true });
});

module.exports = router;
