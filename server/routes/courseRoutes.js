const express = require("express");
const router = express.Router();

// Normalized Map for subjects
const courseMapping = {
  "bca": [
    "C Programming", 
    "Web Development", 
    "Database Management Systems (DBMS)", 
    "Data Structures & Algorithms", 
    "Operating Systems"
  ],
  "bba": [
    "Principles of Management", 
    "Marketing Management", 
    "Organizational Behavior", 
    "Business Communication", 
    "Human Resource Management"
  ],
  "bcom": [
    "Financial Accounting", 
    "Business Laws", 
    "Corporate Finance", 
    "Economics for Business", 
    "Auditing and Taxation"
  ]
};

// --- ROUTE: Get Subjects ---
router.get("/:courseName", async (req, res) => {
  try {
    const rawName = req.params.courseName.toLowerCase();
    
    // Logic to find the best match (e.g., if string contains 'bca')
    let key = "";
    if (rawName.includes("bca")) key = "bca";
    else if (rawName.includes("bba")) key = "bba";
    else if (rawName.includes("b.com") || rawName.includes("bcom")) key = "bcom";

    const subjects = courseMapping[key];

    if (subjects) {
      return res.json({ success: true, subjects });
    }

    console.log(`❌ No match found for: "${req.params.courseName}"`);
    res.status(404).json({ success: false, message: "Course subjects not found", subjects: [] });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;