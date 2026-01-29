const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
