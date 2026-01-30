const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentName: { type: String }, 
  course: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending"
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model("Query", QuerySchema);