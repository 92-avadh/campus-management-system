const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");
const { generateToken } = require("../utils/token");

// Faculty starts attendance
exports.startAttendance = async (req, res) => {
  const { subjectId } = req.body;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute

  const session = await AttendanceSession.create({
    subjectId,
    facultyId: req.user.id,
    token,
    expiresAt
  });

  res.json({
    sessionId: session._id,
    token,
    expiresAt
  });
};

// Student marks attendance
exports.markAttendance = async (req, res) => {
  const { sessionId, token } = req.body;

  const session = await AttendanceSession.findById(sessionId);

  if (!session || !session.isActive)
    return res.status(400).json({ message: "Session expired" });

  if (session.token !== token)
    return res.status(400).json({ message: "Invalid QR" });

  if (new Date() > session.expiresAt)
    return res.status(400).json({ message: "QR expired" });

  const alreadyMarked = await Attendance.findOne({
    studentId: req.user.id,
    sessionId
  });

  if (alreadyMarked)
    return res.status(400).json({ message: "Already marked" });

  await Attendance.create({
    studentId: req.user.id,
    subjectId: session.subjectId,
    sessionId
  });

  res.json({ message: "Attendance marked successfully" });
};
