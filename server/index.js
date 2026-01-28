const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // ✅ ADDED

dotenv.config();
const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ ADDED for file uploads

// --- 2. CREATE UPLOAD DIRECTORIES IF THEY DON'T EXIST ---
const uploadDirs = ['uploads', 'uploads/materials'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// --- 3. SERVE UPLOADS FOLDER AS STATIC ---
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// --- 4. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", studentRoutes);      // For application submission
app.use("/api/student", studentRoutes);            // ✅ For materials viewing
app.use("/api/student", notificationRoutes);       // ✅ For notifications
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    routes: {
      materials: "/api/student/materials/:course/:subject",
      notifications: "/api/student/notifications/:studentId",
      upload: "/api/faculty/upload-material"
    }
  });
});

// ✅ TEMPORARY TEST ROUTES - Remove after debugging
app.get("/test-materials", async (req, res) => {
  try {
    const Material = require("./models/Material");
    const materials = await Material.find({}).limit(10);
    res.json({
      count: materials.length,
      materials: materials.map(m => ({
        _id: m._id,
        title: m.title,
        course: m.course,
        subject: m.subject,
        fileName: m.fileName,
        uploadDate: m.uploadDate
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/test-notifications", async (req, res) => {
  try {
    const Notification = require("./models/Notification");
    const notifications = await Notification.find({}).limit(10);
    res.json({
      count: notifications.length,
      notifications: notifications.map(n => ({
        _id: n._id,
        type: n.type,
        title: n.title,
        course: n.course,
        subject: n.subject,
        createdAt: n.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// --- 6. ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`\n🔗 Test these URLs to verify:`);
  console.log(`   - GET  http://localhost:${PORT}/test-materials`);
  console.log(`   - GET  http://localhost:${PORT}/test-notifications`);
  console.log(`   - POST http://localhost:${PORT}/api/faculty/upload-material`);
  console.log(`   - GET  http://localhost:${PORT}/api/student/materials/BCA/Web%20Development`);
  console.log(`\n📝 Available routes registered successfully!`);
});