const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, // Links to the custom ID (e.g., DFMABA...)
  name: { type: String, required: true },       // Store name for easy display
  date: { type: String, required: true },       // Format: YYYY-MM-DD
  checkInTime: { type: String },                // Format: HH:MM AM/PM
  checkOutTime: { type: String },
  status: { type: String, default: 'Absent' }   // Present, Absent, Half-day
});

module.exports = mongoose.model('Attendance', AttendanceSchema);