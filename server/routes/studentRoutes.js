const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Application = require("../models/Application");

// --- 1. CONFIGURATION FOR FILE UPLOAD ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// --- 2. ROUTE: Submit Admission Form ---
router.post("/apply", upload.fields([{ name: "photo" }, { name: "marksheet" }]), async (req, res) => {
  try {
    const { name, email, phone, course, dob, gender, address, percentage } = req.body;

    const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
    const marksheetPath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;

    const existing = await Application.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "You have already applied with this email!" });
    }

    const newApp = new Application({ 
      name, email, phone, course, 
      dob, gender, address, percentage, 
      photo: photoPath,       
      marksheet: marksheetPath 
    });
    
    await newApp.save();
    res.status(201).json({ message: "Application Submitted Successfully!" });
  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: "Server error during application." });
  }
});

module.exports = router;