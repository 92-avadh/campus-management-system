require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Resend } = require("resend");
const serverless = require("serverless-http");

const app = express();

// ❌ REMOVED: fs, path, and express.static("uploads")
// Cloudflare Workers do not support local file writing. 
// Rely entirely on your Cloudinary integration for file uploads.

// ✅ CORS CONFIGURATION
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://campus-management-system-peach.vercel.app",
    "https://campus-management-system-u1x1.vercel.app"
    // Note: Remember to add your new Cloudflare Pages frontend URLs here once deployed!
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Serverless MongoDB Connection Logic
// Serverless functions spin up and down constantly. 
// We check if a connection exists before trying to reconnect on every request.
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  }
};

// Ensure DB is connected before handling any route
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ✅ Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// ✅ Resend Setup
const resend = new Resend(process.env.RESEND_API_KEY);
// Note: In a serverless environment, testing email on boot will fire every time a new edge node spins up.
// Consider moving this test to a specific admin route instead of running it globally here.

// ❌ REMOVED: app.listen(PORT, ...)

// ✅ Cloudflare Worker Export
module.exports = {
  fetch: serverless(app)
};