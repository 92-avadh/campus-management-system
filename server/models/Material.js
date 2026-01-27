const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,
  filePath: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  course: String, // e.g., "BCA", "BBA"
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  isNewForStudents: { type: Boolean, default: true } // For notification badge
});

module.exports = mongoose.model("Material", materialSchema);