const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "student", "faculty"] },
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Student Specific
  course: { type: String },
  department: { type: String },
  percentage: { type: Number },
  isFeePaid: { type: Boolean, default: false },

  // Documents
  photo: { type: String },      
  marksheet: { type: String },
  dob: { type: Date },
  address: { type: String },
  
  // OTP
  otp: { type: String },
  otpExpires: { type: Date },

  // ✅ NEW: Persistent Bookmarks (Stores copy of notice)
  bookmarks: [{
    noticeId: { type: String }, // Reference to original
    title: { type: String },
    content: { type: String },
    date: { type: Date },
    sender: { type: String }
  }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);