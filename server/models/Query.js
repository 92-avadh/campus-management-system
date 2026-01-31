const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  file: { type: String, default: null }, 
  answer: { type: String, default: "" },
  status: { type: String, enum: ["Pending", "Answered"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.Schema.Query || mongoose.model("Query", QuerySchema);