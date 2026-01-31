const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); 
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Notification = require("../models/Notification"); // ✅ Ensure this is imported
const Query = require("../models/Query");
const Notice = require("../models/Notice");

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
   ✅ NOTICE OPERATIONS
======================= */

// 1. ADD NOTICE & NOTIFY STUDENTS
router.post("/add-notice", async (req, res) => {
  try {
    const { title, content, target, postedBy, userId } = req.body;
    
    if (!title || !content || !postedBy || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNotice = new Notice({
      title,
      content,
      target: target || "student", 
      postedBy
    });

    const savedNotice = await newNotice.save();

    await Notification.create({
      type: "notice",
      title: "New Notice Posted",
      message: title, 
      course: "ALL",  
      relatedId: savedNotice._id,
      relatedModel: "Notice",
      createdBy: userId, 
      createdAt: new Date()
    });

    res.json({ success: true, message: "Notice Posted & Students Notified!" });

  } catch (err) {
    console.error("Notice Error:", err);
    res.status(500).json({ message: "Failed to post notice" });
  }
});

// 2. GET FACULTY NOTICES
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notices" });
  }
});

// 3. DELETE NOTICE
router.delete("/delete-notice/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notice" });
  }
});

/* =======================
   GET STUDENTS
======================= */
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    // console.log(`Fetching students for: ${department}`); 

    const students = await User.find({
      role: "student",
      $or: [
        { department: { $regex: department, $options: "i" } },
        { course: { $regex: department, $options: "i" } }
      ]
    }).select("-password");

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
      .sort({ status: 1, createdAt: -1 }); 
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doubts" });
  }
});

/* =======================
   ANSWER DOUBT (UPDATED)
======================= */
router.put("/answer-doubt/:id", async (req, res) => {
  try {
    const { answer } = req.body;
    
    // 1. Update Query & Get the Updated Document
    const updatedQuery = await Query.findByIdAndUpdate(req.params.id, {
      answer,
      status: "Resolved",
      resolvedAt: Date.now()
    }, { new: true }); // {new:true} returns the updated document

    if (!updatedQuery) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    // 2. ✅ CREATE NOTIFICATION FOR THE STUDENT
    // Using the 'student' ID found in the Query document
    await Notification.create({
      type: "query", // Matches the new enum added to Notification model
      title: "Doubt Resolved",
      message: `Your doubt in ${updatedQuery.subject} has been answered.`,
      course: updatedQuery.course || "General",
      subject: updatedQuery.subject,
      relatedId: updatedQuery._id,
      relatedModel: "Query",
      createdBy: updatedQuery.faculty,
      // Target only the student who asked
      recipients: [{ studentId: updatedQuery.student, read: false }] 
    });

    res.json({ success: true, message: "Answer sent & Student Notified!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to answer" });
  }
});

module.exports = router;