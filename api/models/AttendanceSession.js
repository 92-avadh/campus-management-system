const mongoose = require("mongoose");

const AttendanceSessionSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // ✅ FIX: Changed to String so it accepts "C Programming"
  subject: {
    type: String, 
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete after expiry
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AttendanceSession", AttendanceSessionSchema);