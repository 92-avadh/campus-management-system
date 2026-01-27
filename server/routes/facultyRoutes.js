const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Material = require("../models/Material");

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `material-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Get students for faculty dashboard
router.get("/students/:department", async (req, res) => {
  try {
    const students = await User.find({ role: "student", department: req.params.department });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

// Upload Material Route (New)
router.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    const { title, course, subject, uploadedBy } = req.body;
    
    const newMaterial = new Material({
      title,
      course,
      subject,
      uploadedBy,
      filePath: req.file.path
    });

    await newMaterial.save();
    res.status(201).json({ message: "Material uploaded successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;