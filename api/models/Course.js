const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  duration: { type: String }, 
  fees: { type: Number },
  hod: { type: String },
  subjects: { type: [String], default: [] } // <--- THIS WAS MISSING
});

module.exports = mongoose.model("Course", courseSchema);