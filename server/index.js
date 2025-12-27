const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // <--- 1. IMPORT THIS (Required for file paths)

// 👇 IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const courseRoutes = require("./routes/courseRoutes");

dotenv.config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json()); 

// 👇 2. THIS LINE IS CRITICAL - IT MAKES IMAGES VISIBLE 👇
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// --- 2. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));