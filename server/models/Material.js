const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  filePath: { 
    type: String, 
    required: true 
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  course: { 
    type: String, 
    required: true,
    trim: true
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isNewForStudents: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Index for faster queries
materialSchema.index({ course: 1, subject: 1 });
materialSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("Material", materialSchema);