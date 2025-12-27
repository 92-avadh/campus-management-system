const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// 👇 IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // <--- ADDED THIS
const studentRoutes = require("./routes/studentRoutes");
dotenv.config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json()); 

// --- 2. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // <--- ADDED THIS (Connects the Dashboard)
app.use("/api/applications", studentRoutes);
// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));