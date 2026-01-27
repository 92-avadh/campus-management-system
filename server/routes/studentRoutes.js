const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Application = require("../models/Application");
const User = require("../models/User");
const Material = require("../models/Material"); // FIXED: Added import

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

// --- 3. ROUTE: Get materials by course and subject ---
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const { course, subject } = req.params;
    
    console.log("📚 Fetching materials for:", { course, subject });
    
    // More flexible search - case insensitive for both course and subject
    const materials = await Material.find({ 
      course: { $regex: new RegExp(course, 'i') },
      subject: { $regex: new RegExp(`^${subject}$`, 'i') } // Exact match but case insensitive
    })
    .populate('uploadedBy', 'name')
    .sort({ uploadDate: -1 });
    
    console.log(`✅ Found ${materials.length} materials`);
    
    // If no materials found, let's debug
    if (materials.length === 0) {
      const allMaterials = await Material.find({});
      console.log("📋 All materials in database:", allMaterials.map(m => ({
        course: m.course,
        subject: m.subject,
        title: m.title
      })));
    }
    
    res.json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ message: "Error fetching materials" });
  }
});

// --- 4. ROUTE: Get all materials for a course ---
router.get("/materials/:course", async (req, res) => {
  try {
    const { course } = req.params;
    
    const materials = await Material.find({ 
      course: { $regex: new RegExp(course, 'i') }
    })
    .populate('uploadedBy', 'name')
    .sort({ uploadDate: -1 });
    
    res.json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ message: "Error fetching materials" });
  }
});

// --- 5. ROUTE: Mark material as viewed ---
router.post("/view-material/:materialId", async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const material = await Material.findByIdAndUpdate(
      req.params.materialId, 
      {
        $addToSet: { viewedBy: studentId }, // Only adds if studentId isn't already there
        isNewForStudents: false
      },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    res.json({ message: "Marked as viewed", material });
  } catch (err) {
    console.error("Error updating view status:", err);
    res.status(500).json({ message: "Error updating view status" });
  }
});

// --- 6. ROUTE: Download material ---
router.get("/download/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    res.download(material.filePath, material.fileName || 'download');
  } catch (err) {
    console.error("Error downloading material:", err);
    res.status(500).json({ message: "Error downloading material" });
  }
});

module.exports = router;