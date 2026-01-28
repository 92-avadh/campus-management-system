const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

const Application = require("../models/Application");
const User = require("../models/User");
const Material = require("../models/Material");

/* =======================
   APPLY FORM
======================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post(
  "/apply",
  upload.fields([{ name: "photo" }, { name: "marksheet" }]),
  async (req, res) => {
    try {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) {
        return res.status(400).json({ message: "Already enrolled" });
      }

      await new Application(req.body).save();
      res.json({ message: "Application submitted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Application failed" });
    }
  }
);

/* =======================
   GET MATERIALS
======================= */
router.get("/materials/:course/:subject", async (req, res) => {
  try {
    const rawCourse = decodeURIComponent(req.params.course).toUpperCase();
    const decodedSubject = decodeURIComponent(req.params.subject).trim();

    let normalizedCourse = rawCourse;
    if (rawCourse.includes("BCA")) normalizedCourse = "BCA";
    else if (rawCourse.includes("BBA")) normalizedCourse = "BBA";
    else if (rawCourse.includes("BCOM")) normalizedCourse = "BCOM";

    const materials = await Material.find({
      course: normalizedCourse,
      subject: decodedSubject
    })
      .populate("uploadedBy", "name")
      .sort({ uploadDate: -1 });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching materials" });
  }
});

/* =======================
   MARK MATERIAL AS VIEWED
======================= */
router.post("/view-material/:materialId", async (req, res) => {
  try {
    await Material.findByIdAndUpdate(req.params.materialId, {
      $addToSet: { viewedBy: req.body.studentId },
      isNewForStudents: false
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =======================
   DOWNLOAD MATERIAL
======================= */
router.get("/download/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.download(material.filePath, material.fileName);
  } catch (err) {
    res.status(500).json({ message: "Download failed" });
  }
});

// GET STUDENT BY ID (FETCH FRESH DATA)
router.get("/profile/:studentId", async (req, res) => {
  try {
    const user = await User.findById(req.params.studentId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

/* =======================
   UPDATE PROFILE
======================= */
router.put("/update-profile/:studentId", async (req, res) => {
  try {
    const { name, phone, dob, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.studentId,
      {
        name,
        phone,
        dob: dob ? new Date(dob) : null,
        address
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});


/* =======================
   CHANGE PASSWORD
======================= */
router.put("/change-password/:studentId", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.params.studentId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password update failed" });
  }
});
// =======================
// GET STUDENT PROFILE (DB)
// =======================
router.get("/profile/:studentId", async (req, res) => {
  try {
    const user = await User.findById(req.params.studentId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

module.exports = router;
