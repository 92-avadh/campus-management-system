const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  try {
    const { department } = req.query;
    const students = await User.find({
      role: "student",
      department,
      isFeePaid: true
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

/* =======================
   GET SUBJECTS
======================= */
router.get("/subjects/:courseName", async (req, res) => {
  try {
    const course = await Course.findOne({
      name: { $regex: new RegExp(req.params.courseName, "i") }
    });

    if (!course) return res.json({ subjects: [] });
    res.json({ subjects: course.subjects });
  } catch (err) {
    res.status(500).json({ subjects: [] });
  }
});

/* =======================
   UPLOAD MATERIAL (FINAL FIX)
======================= */
router.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    const { title, course, subject, uploadedBy } = req.body;

    if (!req.file || !title || !course || !subject || !uploadedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedCourse = course.trim().toUpperCase();
    const normalizedSubject = subject.trim();

    /* 🔹 Save material */
    const material = new Material({
      title: title.trim(),
      course: normalizedCourse,
      subject: normalizedSubject,
      uploadedBy,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    const savedMaterial = await material.save();

    /* 🔹 Find all paid students of same course */
    const students = await User.find({
      role: "student",
      course: normalizedCourse,
      isFeePaid: true
    });

    /* 🔹 Create notification WITH recipients */
    await Notification.create({
      type: "material",
      title: "New Study Material Uploaded",
      message: `${title} uploaded for ${normalizedSubject}`,
      course: normalizedCourse,
      subject: normalizedSubject,
      relatedId: savedMaterial._id,
      relatedModel: "Material",
      createdBy: uploadedBy,
      recipients: students.map(student => ({
        studentId: student._id,
        read: false
      }))
    });

    res.status(201).json(savedMaterial);
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ message: "Material upload failed" });
  }
});

/* =======================
   MY MATERIALS
======================= */
router.get("/my-materials/:facultyId", async (req, res) => {
  try {
    const materials = await Material.find({
      uploadedBy: req.params.facultyId
    }).sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Failed to load materials" });
  }
});

/* =======================
   DELETE MATERIAL
======================= */
router.delete("/material/:materialId", async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Material not found" });

    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
