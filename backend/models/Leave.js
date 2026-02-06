const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  // Add 'Casual' to this list 👇
leaveType: { type: String, enum: ['Paid', 'Sick', 'Unpaid', 'Casual'], required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },   // YYYY-MM-DD
  remarks: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminComments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);