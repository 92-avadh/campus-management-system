const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "BCA"
  duration: { type: String }, // "3 Years"
  fees: { type: Number },     // 40000
  hod: { type: String }       // Head of Dept
});

module.exports = mongoose.model("Course", courseSchema);