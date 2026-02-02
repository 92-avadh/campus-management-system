const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String 
  },
  type: {
    type: String,
    // ✅ FIX: Added 'alert' (for cancellations) and 'payment' (for fees) to the list
    enum: ["notice", "material", "query", "alert", "payment", "general"], 
    required: true
  },
  course: { 
    type: String 
  }, // e.g., 'ALL', 'STUDENT_ALL', 'BCA', or specific Department
  
  // Optional: Link to a specific object (Notice ID, Material ID, etc.)
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'relatedModel' 
  },
  relatedModel: { 
    type: String 
  },

  // For specific targeted notifications (optional)
  recipients: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      read: { type: Boolean, default: false }
  }],

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);