require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 

const app = express();

// ✅ Create necessary upload folders locally and on Render
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ UPDATED CORS CONFIGURATION
// This allows your local React apps and your Vercel domains to access the backend securely
const corsOptions = {
  origin: [
    "http://localhost:3000",             // Local Client
    "http://localhost:3001",             // Local Admin
    "https://your-client-app.vercel.app", // ⚠️ Replace with your actual Vercel Client URL after deployment
    "https://your-admin-app.vercel.app"   // ⚠️ Replace with your actual Vercel Admin URL after deployment
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  // ✅ 0.0.0.0 allows access from other devices on the network
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on Port ${PORT}`);
  });
}