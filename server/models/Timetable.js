const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  department: { type: String, required: true }, // e.g., "BCA"
  date: { type: Date, default: Date.now },
  schedule: [
    {
      time: { type: String, required: true }, // e.g., "09:00 - 10:00"
      subject: { type: String, required: true },
      facultyName: { type: String, required: true },
      room: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model("Timetable", TimetableSchema);