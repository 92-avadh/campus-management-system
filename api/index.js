require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

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

// ✅ CORS CONFIGURATION
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://campus-management-system-peach.vercel.app",
    "https://campus-management-system-u1x1.vercel.app"
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

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Mail Server Verify Check (remove after confirmed working)
const testTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

testTransporter.verify((err, success) => {
  if (err) console.error("❌ Mail Error:", err.message);
  else console.log("✅ Mail Server Ready");
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on Port ${PORT}`);
  });
}