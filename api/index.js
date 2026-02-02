require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 

const app = express();

// ✅ Only create directories if running LOCALLY (Vercel is read-only)
if (!process.env.VERCEL) {
  const dirs = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads/materials"),
    path.join(__dirname, "uploads/doubts")
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  // Serve files locally
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Root Route (To check if server is running)
app.get("/", (req, res) => {
  res.send("API is Running...");
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ REQUIRED FOR VERCEL
module.exports = app;

// Local Server Start
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on Port ${PORT}`);
  });
}