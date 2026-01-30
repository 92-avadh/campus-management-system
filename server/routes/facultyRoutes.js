const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); 
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const Query = require("../models/Query");
/* =======================
   MULTER CONFIG
======================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/materials/"),
  filename: (req, file, cb) =>
    cb(null, `material-${Date.now()}${path.extname(file.originalname)}`)
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|ppt|pptx|txt/;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

const upload = multer({ storage, fileFilter });

/* =======================
   GET STUDENTS (✅ FIXED LOGIC)
======================= */
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    
    console.log(`👨‍🏫 Fetching students for Dept: ${department}`); // DEBUG LOG

    // Logic: Find students where their 'course' OR 'department' matches the Faculty's department
    // We REMOVED 'isFeePaid: true' so ALL students show up.
    const students = await User.find({
      role: "student",
      $or: [
        { department: { $regex: new RegExp(`^${department}$`, "i") } }, // Case-insensitive match
        { course: { $regex: new RegExp(`^${department}$`, "i") } }
      ]
    }).select("-password"); // Security: Don't send passwords

    console.log(`✅ Found ${students.length} students.`); // DEBUG LOG
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =======================
   GET SUBJECTS
======================= */
router.get("/subjects/:courseName", async (req, res) => {
  const course = await Course.findOne({
    name: { $regex: new RegExp(req.params.courseName, "i") }
  });
  if (!course) return res.json({ subjects: [] });
  res.json({ subjects: course.subjects });
});

/* =======================
   UPLOAD MATERIAL
======================= */
router.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    const { title, course, subject, uploadedBy } = req.body;

    if (!req.file || !title || !course || !subject || !uploadedBy) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMaterial = new Material({
      title: title.trim(),
      course: course.trim().toUpperCase(),
      subject: subject.trim(),
      uploadedBy,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    const saved = await newMaterial.save();

    await Notification.create({
      type: "material",
      title: "New Study Material",
      message: `${title} uploaded`,
      course: saved.course,
      subject: saved.subject,
      relatedId: saved._id,
      relatedModel: "Material",
      createdBy: uploadedBy
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================
   MY MATERIALS
======================= */
router.get("/my-materials/:facultyId", async (req, res) => {
  const materials = await Material.find({
    uploadedBy: req.params.facultyId
  }).sort({ uploadDate: -1 });

  res.json(materials);
});

/* =======================
   DELETE MATERIAL
======================= */
router.delete("/material/:materialId", async (req, res) => {
  const material = await Material.findByIdAndDelete(req.params.materialId);
  if (!material) return res.status(404).json({ message: "Not found" });

  const fs = require("fs");
  if (fs.existsSync(material.filePath)) fs.unlinkSync(material.filePath);

  res.json({ message: "Deleted" });
});

/* =======================
   GENERATE DYNAMIC QR
======================= */
router.post("/generate-qr", async (req, res) => {
  try {
    const { course, subject, facultyId } = req.body;
    const data = {
      course,
      subject,
      facultyId,
      timestamp: Date.now(), 
      nonce: crypto.randomBytes(4).toString('hex') 
    };
    const qrData = JSON.stringify(data);
    res.json({ qrData });
  } catch (err) {
    console.error("QR Error:", err);
    res.status(500).json({ message: "Error generating QR" });
  }
});

/* =======================
   PROFILE & SETTINGS
======================= */
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    const { email, phone, address, dob } = req.body;
    await User.findByIdAndUpdate(req.params.id, { email, phone, address, dob });
    res.json({ success: true, message: "Profile updated!" });
  } catch (err) { res.status(500).json({ success: false, message: "Update failed" }); }
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
    res.json({ success: true, message: "Password changed!" });
  } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});
/* =======================
   GET PENDING DOUBTS
======================= */
router.get("/doubts/:facultyId", async (req, res) => {
  try {
    const doubts = await Query.find({ faculty: req.params.facultyId })
      .sort({ status: 1, createdAt: -1 }); // Pending first, then new ones
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doubts" });
  }
});

/* =======================
   ANSWER DOUBT
======================= */
router.put("/answer-doubt/:id", async (req, res) => {
  try {
    const { answer } = req.body;
    
    await Query.findByIdAndUpdate(req.params.id, {
      answer,
      status: "Resolved",
      resolvedAt: Date.now()
    });

    res.json({ success: true, message: "Answer sent!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to answer" });
  }
});

module.exports = router;