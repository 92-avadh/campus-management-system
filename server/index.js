require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Models
const Course = require("./models/Course");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// --- 1. MIDDLEWARE (UPDATED FOR MOBILE ACCESS) ---
app.use(cors({
  // ✅ Allow all origins so mobile/laptop IPs work
  origin: "*", 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CREATE UPLOAD DIRECTORIES ---
// Ensure uploads and subfolders exist
const uploadDirs = ['uploads', 'uploads/materials', 'uploads/doubts'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Serve static files (images, PDFs)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/notifications", notificationRoutes);
// Note: Applications route logic was inside studentRoutes in previous steps
app.use("/api/applications", studentRoutes);

// --- 4. MIGRATION LOGIC ---
const migrateCourses = async () => {
  const courseMapping = {
    "BCA": ["C Programming", "Web Development", "Database Management Systems (DBMS)", "Data Structures & Algorithms", "Operating Systems"],
    "BBA": ["Principles of Management", "Marketing Management", "Organizational Behavior", "Business Communication", "Human Resource Management"],
    "BCom": ["Financial Accounting", "Business Laws", "Corporate Finance", "Economics for Business", "Auditing and Taxation"]
  };

  try {
    for (let name in courseMapping) {
      // Case-insensitive check
      const exists = await Course.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (!exists) {
        await Course.create({ name, subjects: courseMapping[name] });
        console.log(`✅ Seeded ${name} to database`);
      }
    }
  } catch (err) {
    console.error("Migration Error:", err);
  }
};

// --- 5. DATABASE CONNECTION & SERVER START ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    // Run migration
    await migrateCourses();

    // Listen on 0.0.0.0 to accept external (mobile) connections
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => 
      console.log(`🚀 Server running on Port ${PORT} (Accessible via IP)`)
    );
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));