const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); 
const paymentRoutes = require("./routes/paymentRoutes");

// --- IMPORT ROUTES ---
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes"); 
// Load environment variables from .env file
dotenv.config();

// Initialize Express App
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse incoming JSON data

// --- SERVE STATIC FILES (UPLOADS) ---
// This makes the 'uploads' folder accessible via URL
// Example: http://localhost:5000/uploads/photo-123456.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---
app.use("/api/admin", adminRoutes);     // For Admin Dashboard (Approve/Reject)
app.use("/api/student", studentRoutes); // For Public "Apply Now" Form
app.use("/api/auth", authRoutes);       // For Login (Students/Faculty/Admin)
app.use("/api/payment", paymentRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Campus Management System API is Running...");
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});