const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  
  monthlyWage: { type: Number, required: true }, // The input (e.g., 50000)
  
  // Earnings Components
  basicSalary: { type: Number, required: true }, // 50% of Wage
  hra: { type: Number, default: 0 },             // 50% of Basic
  standardAllowance: { type: Number, default: 0 },
  performanceBonus: { type: Number, default: 0 },
  lta: { type: Number, default: 0 },
  fixedAllowance: { type: Number, default: 0 },  // Balancing figure

  // Deductions
  pf: { type: Number, default: 0 },              // 12% of Basic
  tax: { type: Number, default: 0 },             // Prof Tax (200)
  
  netSalary: { type: Number, required: true }    // In-Hand
}, { timestamps: true });

module.exports = mongoose.model('Payroll', PayrollSchema);