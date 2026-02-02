const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // Links to User
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Absent"], default: "Absent" },
  subject: { type: String }
});

module.exports = mongoose.model("Attendance", attendanceSchema);