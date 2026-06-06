require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

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

app.get("/", (req, res) => {
  res.json({ message: "Campus API is running on Cloudflare Workers" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

module.exports = app;
