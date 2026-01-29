const express = require("express");
const router = express.Router();
const {
  startAttendance,
  markAttendance
} = require("../controllers/attendanceController");
const auth = require("../middlewares/authMiddleware");

router.post("/start", auth, startAttendance); // faculty
router.post("/mark", auth, markAttendance);   // student

module.exports = router;
