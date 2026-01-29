require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
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
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CREATE UPLOAD DIRECTORIES ---
const uploadDirs = ['uploads', 'uploads/materials'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// --- 3. SERVE UPLOADS FOLDER AS STATIC (Crucial for Photos) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 4. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ FIX: Frontend ApplyModal calls '/api/applications', so we route it to studentRoutes
app.use("/api/applications", studentRoutes);

// --- 5. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => 
      console.log(`🚀 Server running on Port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));