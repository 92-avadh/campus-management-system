const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET Course Details by Name (e.g., /api/courses/BCA)
router.get("/:name", async (req, res) => {
  try {
    const course = await Course.findOne({ name: req.params.name });
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;