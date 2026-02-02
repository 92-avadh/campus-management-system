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

  // Documents & Personal Details
  photo: { type: String, default: "" },      
  marksheet: { type: String, default: "" },
  dob: { type: Date },      // ✅ Ensured
  address: { type: String }, // ✅ Ensured
  
  // OTP
  otp: { type: String },
  otpExpires: { type: Date },

  // Bookmarks
  bookmarks: [{
    noticeId: { type: String },
    title: { type: String },
    content: { type: String },
    date: { type: Date },
    sender: { type: String }
  }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);