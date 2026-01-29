const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); 
const User = require("../models/User");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

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
   GET STUDENTS
======================= */
router.get("/students", async (req, res) => {
  const { department } = req.query;
  const students = await User.find({
    role: "student",
    department,
    isFeePaid: true
  });
  res.json(students);
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
   GENERATE DYNAMIC QR (✅ NEW)
======================= */
router.post("/generate-qr", async (req, res) => {
  try {
    const { course, subject, facultyId } = req.body;

    // Create a payload with a short expiration time (timestamp)
    const data = {
      course,
      subject,
      facultyId,
      timestamp: Date.now(), // Current server time
      nonce: crypto.randomBytes(4).toString('hex') // Random salt
    };

    // Serialize to string
    const qrData = JSON.stringify(data);
    
    res.json({ qrData });
  } catch (err) {
    console.error("QR Error:", err);
    res.status(500).json({ message: "Error generating QR" });
  }
});

module.exports = router;