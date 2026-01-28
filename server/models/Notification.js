const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["material", "attendance", "notice"],
      required: true
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
      type: mongoose.Schema.Types.ObjectId
    },

    relatedModel: {
      type: String
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    recipients: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        read: {
          type: Boolean,
          default: false
        },
        readAt: Date
      }
    ]
  },
  {
    timestamps: true // ⬅️ creates createdAt
  }
);

/* ===========================
   🔥 AUTO DELETE AFTER 2 DAYS
=========================== */
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 2 } // 2 days
);

module.exports = mongoose.model("Notification", notificationSchema);
