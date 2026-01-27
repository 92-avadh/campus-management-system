const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['material', 'attendance', 'notice']
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  course: { 
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Material', 'Notice', 'Attendance']
  },
  recipients: [{
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    readAt: { 
      type: Date 
    }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ 'recipients.studentId': 1, 'recipients.read': 1 });
notificationSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);