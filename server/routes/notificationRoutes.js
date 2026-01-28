const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

/* =========================
   🔹 COURSE NORMALIZER
========================= */
const normalizeCourse = (course = "") => {
  const upper = course.toUpperCase();
  if (upper.includes("BCA")) return "BCA";
  if (upper.includes("BBA")) return "BBA";
  if (upper.includes("BCOM")) return "BCOM";
  return upper.trim();
};

/* =========================
   GET ALL NOTIFICATIONS
========================= */
router.get("/notifications/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("🔔 Fetching notifications for student:", studentId);

    const student = await User.findById(studentId);
    if (!student) {
      console.log("❌ Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    const normalizedCourse = normalizeCourse(student.course);

    console.log("✅ Student found:", {
      name: student.name,
      course: student.course,
      normalizedCourse
    });

    const notifications = await Notification.find({
      course: normalizedCourse
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(
      `📬 Found ${notifications.length} notifications for course: ${normalizedCourse}`
    );

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
        createdBy: notif.createdBy?.name || "Faculty",
        createdAt: notif.createdAt,
        read: recipient ? recipient.read : false,
        relatedId: notif.relatedId
      };
    });

    res.json(response);
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

    const notifications = await Notification.find({
      course: normalizedCourse
    });

    let unreadCount = 0;

    notifications.forEach(notif => {
      const recipient = notif.recipients?.find(
        r => r.studentId.toString() === studentId
      );

      if (!recipient || !recipient.read) {
        unreadCount++;
      }
    });

    console.log(
      `📊 Unread count for ${normalizedCourse}: ${unreadCount}`
    );

    res.json({ count: unreadCount });
  } catch (err) {
    console.error("❌ Error fetching unread count:", err);
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
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const index = notification.recipients.findIndex(
      r => r.studentId.toString() === studentId
    );

    if (index >= 0) {
      notification.recipients[index].read = true;
      notification.recipients[index].readAt = new Date();
    } else {
      notification.recipients.push({
        studentId,
        read: true,
        readAt: new Date()
      });
    }

    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("❌ Error marking as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

/* =========================
   MARK ALL AS READ
========================= */
router.post("/notifications/read-all", async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const normalizedCourse = normalizeCourse(student.course);

    const notifications = await Notification.find({
      course: normalizedCourse
    });

    for (const notification of notifications) {
      const index = notification.recipients.findIndex(
        r => r.studentId.toString() === studentId
      );

      if (index >= 0) {
        notification.recipients[index].read = true;
        notification.recipients[index].readAt = new Date();
      } else {
        notification.recipients.push({
          studentId,
          read: true,
          readAt: new Date()
        });
      }

      await notification.save();
    }

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Error marking all as read:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

module.exports = router;
