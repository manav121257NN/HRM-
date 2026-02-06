const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
  employeeId: { type: String, unique: true },
  
  // --- MAKE SURE THESE EXIST ---
  phone: { type: String },
  companyName: { type: String, default: 'Dayflow' },
  department: { type: String },
  salary: { type: Number },
  address: { type: String },
  profilePicture: { type: String } // <--- CRITICAL: If this is missing, images won't save!
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);