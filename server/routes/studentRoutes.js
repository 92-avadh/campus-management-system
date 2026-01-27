const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Application = require("../models/Application");
const User = require("../models/User"); // ADDED: Need to check if user already exists

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

    // 1. Check if they already have an APPROVED account in User collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "You are already an enrolled student!" });
    }

    // 2. Check if they have a PENDING application
    const existingApp = await Application.findOne({ email });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied with this email! Please wait for admin review." });
    }

    const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
    const marksheetPath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;

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
// Mark material as viewed
router.post("/view-material/:materialId", async (req, res) => {
  try {
    const { studentId } = req.body;
    await Material.findByIdAndUpdate(req.params.materialId, {
      $addToSet: { viewedBy: studentId } // Only adds if studentId isn't already there
    });
    res.json({ message: "Marked as viewed" });
  } catch (err) {
    res.status(500).json({ message: "Error updating view status" });
  }
});
module.exports = router;