const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Application = require("../models/Application");

// --- 1. CONFIGURATION FOR FILE UPLOAD ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Rename file to: FieldName-Date-OriginalName (e.g., photo-123456789.jpg)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// --- 2. ROUTE: Submit Admission Form (with Files) ---
// upload.fields tells multer to expect two specific files: 'photo' and 'marksheet'
router.post("/apply", upload.fields([{ name: "photo" }, { name: "marksheet" }]), async (req, res) => {
  try {
    // Access text fields via req.body
    const { 
      name, email, phone, course, 
      dob, gender, address, percentage 
    } = req.body;

    // Access file paths via req.files
    // Note: We save the PATH so we can display it later
    const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
    const marksheetPath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;

    // Check if email already applied
    const existing = await Application.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "You have already applied with this email!" });
    }

    const newApp = new Application({ 
      name, email, phone, course, 
      dob, gender, address, percentage, 
      photo: photoPath,       // Save path to DB
      marksheet: marksheetPath // Save path to DB
    });
    
    await newApp.save();

    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;