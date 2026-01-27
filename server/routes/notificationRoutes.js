const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

// Get notifications for a student
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log("🔔 Fetching notifications for student:", studentId);
    
    // Get student's course to filter relevant notifications
    const student = await User.findById(studentId);
    if (!student) {
      console.log("❌ Student not found:", studentId);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student found:", { 
      name: student.name, 
      course: student.course,
      role: student.role 
    });

    // Find notifications for this student's course
    const notifications = await Notification.find({
      course: { $regex: new RegExp(student.course, 'i') }
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

    console.log(`📬 Found ${notifications.length} notifications for course: ${student.course}`);

    // Map to include read status for this specific student
    const notificationsWithReadStatus = notifications.map(notif => {
      const recipient = notif.recipients.find(r => r.studentId.toString() === studentId);
      return {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        subject: notif.subject,
        createdBy: notif.createdBy?.name,
        createdAt: notif.createdAt,
        read: recipient ? recipient.read : false,
        relatedId: notif.relatedId
      };
    });

    res.json(notificationsWithReadStatus);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Get unread notification count
router.get("/notifications/:studentId/unread-count", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log("🔢 Fetching unread count for student:", studentId);
    
    const student = await User.findById(studentId);
    if (!student) {
      console.log("❌ Student not found for unread count");
      return res.status(404).json({ count: 0 });
    }

    const notifications = await Notification.find({
      course: { $regex: new RegExp(student.course, 'i') }
    });

    // Count notifications where student hasn't read yet
    let unreadCount = 0;
    notifications.forEach(notif => {
      const recipient = notif.recipients.find(r => r.studentId.toString() === studentId);
      if (!recipient || !recipient.read) {
        unreadCount++;
      }
    });

    console.log(`📊 Unread count: ${unreadCount} out of ${notifications.length} total`);

    res.json({ count: unreadCount });
  } catch (err) {
    console.error("❌ Error fetching unread count:", err);
    res.status(500).json({ count: 0 });
  }
});

// Mark notification as read
router.post("/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { studentId } = req.body;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if student is already in recipients
    const recipientIndex = notification.recipients.findIndex(
      r => r.studentId.toString() === studentId
    );

    if (recipientIndex >= 0) {
      // Update existing recipient
      notification.recipients[recipientIndex].read = true;
      notification.recipients[recipientIndex].readAt = new Date();
    } else {
      // Add new recipient
      notification.recipients.push({
        studentId: studentId,
        read: true,
        readAt: new Date()
      });
    }

    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking as read:", err);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Mark all notifications as read
router.post("/notifications/read-all", async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const notifications = await Notification.find({
      course: { $regex: new RegExp(student.course, 'i') }
    });

    for (const notification of notifications) {
      const recipientIndex = notification.recipients.findIndex(
        r => r.studentId.toString() === studentId
      );

      if (recipientIndex >= 0) {
        notification.recipients[recipientIndex].read = true;
        notification.recipients[recipientIndex].readAt = new Date();
      } else {
        notification.recipients.push({
          studentId: studentId,
          read: true,
          readAt: new Date()
        });
      }

      await notification.save();
    }

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

module.exports = router;