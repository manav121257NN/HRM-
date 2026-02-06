require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// --- IMPORT MODELS ---
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll'); // New Import

const app = express();

// --- MIDDLEWARE (Images up to 50MB) ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ Connection Error:", err));

// --- HELPER FUNCTIONS ---
const generateEmployeeId = async (name) => {
    const companyCode = "DF"; 
    const year = new Date().getFullYear();
    const nameParts = name.trim().split(/\s+/);
    let firstName = nameParts[0] || "";
    let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const nameCode = ((firstName + "XX").substring(0, 2) + (lastName + "XX").substring(0, 2)).toUpperCase();
    
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year + 1}-01-01`);
    const count = await User.countDocuments({ role: "Employee", createdAt: { $gte: startOfYear, $lt: endOfYear } });
    const serial = (count + 1).toString().padStart(4, '0');
    
    return `${companyCode}${nameCode}${year}${serial}`;
};

const generatePassword = (length = 8) => crypto.randomBytes(length).toString('hex').slice(0, length);

// --- SEED ADMINS ---
const seedAdmins = async () => {
    const admins = [
        { email: "admin1@dayflow.com", id: "ADMIN01" },
        { email: "admin2@dayflow.com", id: "ADMIN02" },
        { email: "admin3@dayflow.com", id: "ADMIN03" }
    ];
    for (const admin of admins) {
        const exists = await User.findOne({ email: admin.email });
        if (!exists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "Super Admin", email: admin.email, password: hashedPassword,
                role: "Admin", employeeId: admin.id, companyName: "Dayflow"
            });
            console.log(`Created admin: ${admin.email}`);
        }
    }
};
seedAdmins();

// ================= ROUTES =================

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    const { loginId, password } = req.body;
    const user = await User.findOne({ $or: [{ email: loginId }, { employeeId: loginId }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login Successful", user });
});

// --- EMPLOYEES ---
app.post('/api/create-employee', async (req, res) => {
    const { name, email, phone, companyName, department, salary, profilePicture } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const employeeId = await generateEmployeeId(name);
        const autoPassword = generatePassword(); 
        const hashedPassword = await bcrypt.hash(autoPassword, 10);

        const newEmployee = new User({
            name, email, password: hashedPassword, role: "Employee",
            employeeId, phone, companyName, department, salary, profilePicture
        });
        await newEmployee.save();
        res.json({ message: "Created!", employeeId, autoPassword });
    } catch (error) { res.status(500).json({ message: "Error creating employee" }); }
});

app.get('/api/employees', async (req, res) => {
    try {
        const employees = await User.find({ role: 'Employee' }).select('-password'); 
        res.json(employees);
    } catch (error) { res.status(500).json({ message: "Error fetching employees" }); }
});

app.delete('/api/employees/:id', async (req, res) => {
    try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Employee Deleted" }); } 
    catch (error) { res.status(500).json({ message: "Error deleting" }); }
});

app.put('/api/user/update', async (req, res) => {
    const { employeeId, ...updates } = req.body;
    try {
        await User.findOneAndUpdate({ employeeId }, updates);
        res.json({ message: "Profile Updated" });
    } catch (error) { res.status(500).json({ message: "Error updating" }); }
});

// --- ATTENDANCE ---
app.post('/api/attendance/checkin', async (req, res) => {
    const { employeeId, name } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    try {
        const existing = await Attendance.findOne({ employeeId, date });
        if (existing) return res.status(400).json({ message: "Already checked in today!" });

        const newRecord = new Attendance({ employeeId, name, date, checkInTime: time, status: 'Present' });
        await newRecord.save();
        res.json({ message: "Check-In Successful!", record: newRecord });
    } catch (error) { res.status(500).json({ message: "Error checking in" }); }
});

app.post('/api/attendance/checkout', async (req, res) => {
    const { employeeId } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    try {
        const record = await Attendance.findOne({ employeeId, date });
        if (!record) return res.status(400).json({ message: "You haven't checked in yet!" });
        
        record.checkOutTime = time;
        await record.save();
        res.json({ message: "Check-Out Successful!", record });
    } catch (error) { res.status(500).json({ message: "Error checking out" }); }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const records = await Attendance.find({ date }); 
        res.json(records);
    } catch (error) { res.status(500).json({ message: "Error fetching attendance" }); }
});

app.get('/api/attendance/:employeeId', async (req, res) => {
    try {
        const records = await Attendance.find({ employeeId: req.params.employeeId });
        res.json(records);
    } catch (error) { res.status(500).json({ message: "Error fetching history" }); }
});

// --- LEAVES ---
app.post('/api/leaves/apply', async (req, res) => {
    try { await new Leave(req.body).save(); res.json({ message: "Applied!" }); } 
    catch (error) { res.status(500).json({ message: "Error applying" }); }
});

app.get('/api/leaves/my-leaves/:id', async (req, res) => {
    try { const leaves = await Leave.find({ employeeId: req.params.id }); res.json(leaves); } 
    catch (error) { res.status(500).json({ message: "Error fetching" }); }
});

app.get('/api/leaves/all', async (req, res) => {
    try { const leaves = await Leave.find({ status: 'Pending' }); res.json(leaves); } 
    catch (error) { res.status(500).json({ message: "Error fetching" }); }
});

app.put('/api/leaves/status', async (req, res) => {
    try { await Leave.findByIdAndUpdate(req.body.id, { status: req.body.status }); res.json({ message: "Updated" }); } 
    catch (error) { res.status(500).json({ message: "Error updating" }); }
});

// --- PAYROLL ROUTES (UPDATED) ---
app.post('/api/payroll/update', async (req, res) => {
    const { employeeId, name, monthlyWage } = req.body;
    
    const wage = Number(monthlyWage);

    // 1. Calculate Earnings based on Wireframe Logic
    const basicSalary = wage * 0.50; // 50% of Wage
    const hra = basicSalary * 0.50;  // 50% of Basic
    
    const standardAllowance = Math.round(basicSalary * 0.1667); // ~16.67%
    const performanceBonus = Math.round(basicSalary * 0.0833);  // ~8.33%
    const lta = Math.round(basicSalary * 0.0833);               // ~8.33%
    
    // Fixed Allowance takes the remaining balance to match Monthly Wage exactly
    const usedSoFar = basicSalary + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, wage - usedSoFar);

    // 2. Calculate Deductions
    const pf = Math.round(basicSalary * 0.12); // 12% of Basic
    const tax = 200; // Professional Tax

    // 3. Net Salary
    const totalDeductions = pf + tax;
    const netSalary = wage - totalDeductions;

    try {
        const payroll = await Payroll.findOneAndUpdate(
            { employeeId },
            { 
                employeeId, name, monthlyWage: wage,
                basicSalary, hra, standardAllowance, performanceBonus, lta, fixedAllowance,
                pf, tax, netSalary 
            },
            { new: true, upsert: true }
        );
        res.json({ message: "Payroll Updated", payroll });
    } catch (error) { res.status(500).json({ message: "Error updating payroll" }); }
});

app.get('/api/payroll/all', async (req, res) => {
    try { const payrolls = await Payroll.find(); res.json(payrolls); } 
    catch (error) { res.status(500).json({ message: "Error fetching payrolls" }); }
});

app.get('/api/payroll/:employeeId', async (req, res) => {
    try {
        const payroll = await Payroll.findOne({ employeeId: req.params.employeeId });
        if (!payroll) return res.status(404).json({ message: "Payroll not set" });
        res.json(payroll);
    } catch (error) { res.status(500).json({ message: "Error fetching payroll" }); }
});
// --- DASHBOARD STATS ROUTE ---
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'Employee' });
        
        const today = new Date().toISOString().split('T')[0];
        const presentToday = await Attendance.countDocuments({ date: today, status: 'Present' });
        
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        
        // Calculate Total Monthly Payroll Cost
        const payrolls = await Payroll.find();
        const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

        res.json({
            totalEmployees,
            presentToday,
            pendingLeaves,
            totalPayroll
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));