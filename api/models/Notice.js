const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now, expires: 1209600 },
  target: { type: String, enum: ["all", "student", "faculty"], default: "all" }, // Who sees it?
  postedBy: { type: String } // e.g., "Admin"
});

module.exports = mongoose.model("Notice", noticeSchema);