const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

/* =========================
   🔹 COURSE NORMALIZER
========================= */
const normalizeCourse = (course = "") => {
  const upper = course.toUpperCase();
  if (upper.includes("BCA") || upper.includes("COMPUTER")) return "BCA";
  if (upper.includes("BBA") || upper.includes("BUSINESS")) return "BBA";
  if (upper.includes("BCOM") || upper.includes("COMMERCE")) return "BCOM";
  return upper.trim();
};

/* =========================
   GET ALL NOTIFICATIONS
========================= */
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const normalizedCourse = normalizeCourse(student.course);

    // ✅ FIX: Added "STUDENT_ALL" to catch Admin/Global notices
    const notifications = await Notification.find({
      $or: [
        { course: normalizedCourse },           // Specific (e.g. BCA)
        { course: "ALL" },                      // Global
        { course: "STUDENT_ALL" },              // Admin/General Student Notices
        { "recipients.studentId": studentId }   // Personal (Doubts)
      ]
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    const response = notifications.map(notif => {
      const recipient = notif.recipients?.find(
        r => r.studentId.toString() === studentId
      );

      return {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        subject: notif.subject,
        createdBy: notif.createdBy?.name || "System",
        createdAt: notif.createdAt,
        read: recipient ? recipient.read : false, 
        relatedId: notif.relatedId
      };
    });

    res.json({ count: response.filter(n => !n.read).length, notifications: response });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

/* =========================
   GET UNREAD COUNT
========================= */
router.get("/notifications/:studentId/unread-count", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);
    if (!student) return res.json({ count: 0 });

    const normalizedCourse = normalizeCourse(student.course);

    // ✅ FIX: Added "STUDENT_ALL" here too
    const notifications = await Notification.find({
      $or: [
        { course: normalizedCourse },
        { course: "ALL" },
        { course: "STUDENT_ALL" },
        { "recipients.studentId": studentId }
      ]
    });

    let unreadCount = 0;
    notifications.forEach(notif => {
      const recipient = notif.recipients?.find(
        r => r.studentId.toString() === studentId
      );
      if (!recipient || !recipient.read) unreadCount++;
    });

    res.json({ count: unreadCount });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

/* =========================
   MARK ONE AS READ
========================= */
router.post("/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { studentId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: "Not found" });

    const index = notification.recipients.findIndex(
      r => r.studentId.toString() === studentId
    );

    if (index >= 0) {
      notification.recipients[index].read = true;
      notification.recipients[index].readAt = new Date();
    } else {
      notification.recipients.push({ studentId, read: true, readAt: new Date() });
    }

    await notification.save();
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

/* =========================
   MARK ALL AS READ
========================= */
router.post("/notifications/read-all", async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Not found" });

    const normalizedCourse = normalizeCourse(student.course);

    // ✅ FIX: Added "STUDENT_ALL"
    const notifications = await Notification.find({
      $or: [
        { course: normalizedCourse },
        { course: "ALL" },
        { course: "STUDENT_ALL" },
        { "recipients.studentId": studentId }
      ]
    });

    for (const notification of notifications) {
      const index = notification.recipients.findIndex(
        r => r.studentId.toString() === studentId
      );

      if (index >= 0) {
        notification.recipients[index].read = true;
        notification.recipients[index].readAt = new Date();
      } else {
        notification.recipients.push({ studentId, read: true, readAt: new Date() });
      }
      await notification.save();
    }

    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

module.exports = router;