const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Notification = require("../models/Notification"); // ADDED

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `material-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only PDFs and common document types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only documents (PDF, DOC, DOCX, PPT, PPTX, TXT) are allowed!"));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get students for faculty dashboard - FIXED: using query params
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    const students = await User.find({ 
      role: "student", 
      department: department,
      isFeePaid: true // Only show paid students
    });
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// Get subjects based on course name
router.get("/subjects/:courseName", async (req, res) => {
  try {
    const courseName = req.params.courseName;
    const course = await Course.findOne({ 
      name: { $regex: new RegExp(courseName, 'i') } 
    });
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json({ subjects: course.subjects || [] });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// Upload Material Route
router.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    const { title, course, subject, uploadedBy } = req.body;
    
    console.log("📤 Material upload request:", {
      title,
      course,
      subject,
      uploadedBy,
      fileName: req.file?.originalname
    });
    
    // Detailed validation
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (!uploadedBy) {
      return res.status(400).json({ 
        message: "Faculty ID (uploadedBy) is required. Please login again.",
        debug: { uploadedBy, bodyKeys: Object.keys(req.body) }
      });
    }

    const newMaterial = new Material({
      title,
      course,
      subject,
      uploadedBy,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await newMaterial.save();
    
    console.log("✅ Material saved successfully:", {
      id: newMaterial._id,
      title: newMaterial.title,
      course: newMaterial.course,
      subject: newMaterial.subject
    });
    
    // 🔔 CREATE NOTIFICATION for students
    try {
      const notification = new Notification({
        type: 'material',
        title: 'New Study Material Uploaded',
        message: `${title} has been uploaded for ${subject}`,
        course: course,
        subject: subject,
        relatedId: newMaterial._id,
        relatedModel: 'Material',
        createdBy: uploadedBy,
        recipients: [] // Students will see this based on their course
      });
      
      await notification.save();
      console.log("🔔 Notification created for material upload");
    } catch (notifErr) {
      console.error("Error creating notification:", notifErr);
      // Don't fail the upload if notification fails
    }
    
    res.status(201).json({ 
      message: "Material uploaded successfully!",
      material: newMaterial
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ 
      message: "Upload failed: " + err.message,
      error: err.name === "ValidationError" ? err.errors : err.message
    });
  }
});

// Get all materials uploaded by a specific faculty
router.get("/my-materials/:facultyId", async (req, res) => {
  try {
    const materials = await Material.find({ 
      uploadedBy: req.params.facultyId 
    }).sort({ uploadDate: -1 });
    
    res.json(materials || []);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json([]);
  }
});

// Delete material
router.delete("/material/:materialId", async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    // Optionally delete the file from disk
    const fs = require('fs');
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }
    
    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ message: "Error deleting material" });
  }
});

module.exports = router;