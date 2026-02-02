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
  
  // ✅ ADDED: Fields to store temporary file paths
  photo: { type: String },      
  marksheet: { type: String },  
  
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema, "applications");