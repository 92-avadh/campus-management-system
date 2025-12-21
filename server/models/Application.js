const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  percentage: { type: String, required: true },
  
  // --- CHANGED FIELDS ---
  photo: { type: String },      // Stores path like "uploads/photo-123.jpg"
  marksheet: { type: String },  // Stores path like "uploads/marksheet-123.pdf"
  
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema, "applications");