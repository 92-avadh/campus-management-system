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
    // 1. Remove dots, extra spaces, and convert to lowercase
    const rawName = req.params.courseName.toLowerCase().replace(/\./g, "").trim();
    
    // 2. Logic to find the best match
    let key = "";
    
    if (rawName.includes("bca") || rawName.includes("computer application")) key = "bca";
    else if (rawName.includes("bba") || rawName.includes("business administration")) key = "bba";
    else if (rawName.includes("bcom") || rawName.includes("commerce")) key = "bcom";

    const subjects = courseMapping[key];

    if (subjects) {
      return res.json({ success: true, subjects });
    }

    console.log(`❌ No match found for: "${req.params.courseName}" (Normalized: ${rawName})`);
    
    // Return empty array instead of 404 to prevent frontend crashes
    res.json({ success: false, message: "Course subjects not found", subjects: [] });
    
  } catch (error) {
    console.error("Course Route Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;