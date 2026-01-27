const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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
   GET MATERIALS (FINAL FIX)
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

module.exports = router;
