const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty", "admin"], required: true },
  
  // This will store Enrollment No. (Student) or Employee ID (Faculty)
  userId: { type: String, required: true, unique: true },
  
  password: { type: String, required: true },
  
  // Optional fields
  course: { type: String }, // For students
  department: { type: String }, // For faculty
  isPasswordChanged: { type: Boolean, default: false } // Force change on first login
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);