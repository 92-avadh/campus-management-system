const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  department: { type: String, required: true },
  date: { type: Date, default: Date.now },
  schedule: [
    {
      time: { type: String, required: true }, 
      subject: { type: String, required: true },
      facultyName: { type: String, required: true },
      room: { type: String, required: true },
      isCancelled: { type: Boolean, default: false } // ✅ Added Status
    }
  ]
});

module.exports = mongoose.model("Timetable", TimetableSchema);