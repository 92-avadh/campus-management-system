require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 

const app = express();

// Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ----------------------------------------------------
// ✅ HYBRID CONFIGURATION (Localhost vs. Vercel)
// ----------------------------------------------------

// Only create directories if running LOCALLY (Vercel is read-only)
if (!process.env.VERCEL) {
  const dirs = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads/materials"),
    path.join(__dirname, "uploads/doubts")
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📂 Created directory: ${dir}`);
    }
  });

  // Only serve static files locally (Vercel uses Cloudinary)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Root Route
app.get("/", (req, res) => {
  res.send("Campus Management System API is Running...");
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ----------------------------------------------------
// ✅ SERVER STARTUP
// ----------------------------------------------------

// Export for Vercel
module.exports = app;

// Listen for Localhost
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on Port ${PORT}`);
  });
}