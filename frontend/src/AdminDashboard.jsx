import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaClock, FaMoneyBillWave, FaSignOutAlt, FaPlus, FaTrash, FaTimes, FaPhone, FaMapMarkerAlt, FaEnvelope, FaBriefcase, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './App.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home'); // Default to Dashboard View
  
  // --- STATE ---
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, pendingLeaves: 0, totalPayroll: 0 });
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  
  // --- MODAL STATE ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmpPayroll, setSelectedEmpPayroll] = useState(null);

  // --- FORMS ---
  const [payrollForm, setPayrollForm] = useState({ employeeId: '', name: '', monthlyWage: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', companyName: 'Dayflow', department: '', salary: '', profilePicture: '' });
  const [createdEmployee, setCreatedEmployee] = useState(null);
  
  const navigate = useNavigate();

  // --- DATA FETCHING ---
  useEffect(() => {
    if (activeTab === 'home') fetchStats();
    else if (activeTab === 'employees') fetchEmployees();
    else if (activeTab === 'attendance') fetchAttendance();
    else if (activeTab === 'timeoff') fetchLeaves();
    else if (activeTab === 'payroll') fetchPayrolls();
  }, [activeTab]);

  const fetchStats = async () => { try { const res = await axios.get('http://localhost:5000/api/dashboard/stats'); setStats(res.data); } catch (err) {} };
  const fetchEmployees = async () => { try { const res = await axios.get('http://localhost:5000/api/employees'); setEmployees(res.data); } catch (err) {} };
  const fetchAttendance = async () => { try { const res = await axios.get('http://localhost:5000/api/attendance'); setAttendanceRecords(res.data); } catch (err) {} };
  const fetchLeaves = async () => { try { const res = await axios.get('http://localhost:5000/api/leaves/all'); setLeaveRequests(res.data); } catch (err) {} };
  const fetchPayrolls = async () => { try { const res = await axios.get('http://localhost:5000/api/payroll/all'); setPayrolls(res.data); } catch (err) {} };

  // --- HANDLERS ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        toast.success("Employee Deleted Successfully"); 
        fetchEmployees();
    } catch (err) { toast.error("Error deleting employee"); } 
  };

  const handleViewProfile = async (emp) => {
      setSelectedEmp(emp);
      setSelectedEmpPayroll(null);
      setShowViewModal(true);
      try {
          const res = await axios.get(`http://localhost:5000/api/payroll/${emp.employeeId}`);
          setSelectedEmpPayroll(res.data);
      } catch (err) { }
  };

  const handlePayrollUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/payroll/update', payrollForm);
      toast.success("Salary Structure Updated!"); 
      setShowPayrollModal(false);
      fetchPayrolls();
    } catch (err) { toast.error("Error updating payroll"); } 
  };

 const openPayrollModal = (e, emp) => {
    e.stopPropagation();
    // Default to existing salary or 0
    setPayrollForm({ employeeId: emp.employeeId, name: emp.name, monthlyWage: emp.salary || 0 });
    setShowPayrollModal(true);
};
  const handleLeaveAction = async (id, status) => { 
      try { 
          await axios.put('http://localhost:5000/api/leaves/status', { id, status }); 
          toast.success(`Leave ${status} Successfully!`); 
          fetchLeaves(); 
      } catch (err) { toast.error("Action failed"); } 
  };
  
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.readAsDataURL(file); reader.onloadend = () => { setFormData({ ...formData, profilePicture: reader.result }); }; } };
  
const handleSubmit = async (e) => { 
      e.preventDefault(); 

      // --- 1. VALIDATION (Matches your current screen) ---
      // We only check fields that actually exist in your form right now.
      if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.salary) {
          toast.warn("⚠️ Please fill in all text fields!");
          return; // Stops here if anything is empty
      }

      if (!formData.profilePicture) {
          toast.warn("⚠️ Please upload a profile picture!");
          return; // Stops here if no image
      }

      // --- 2. SEND TO SERVER ---
      try { 
          const res = await axios.post('http://localhost:5000/api/create-employee', formData); 
          
          // Show Success Info
          setCreatedEmployee({ id: res.data.employeeId, password: res.data.autoPassword }); 
          
          // Clear Form (Reset all fields)
          setFormData({ 
              name: '', email: '', phone: '', companyName: 'Dayflow', 
              department: '', salary: '', profilePicture: '',
              // These will just be ignored if you haven't added the inputs yet
              address: '', designation: '', joiningDate: '' 
          }); 
          
          fetchEmployees(); 
          toast.success("✅ Employee Created Successfully!"); 

      } catch (err) { 
          // Show the specific error from the backend (like "Email already exists")
          toast.error(err.response?.data?.message || "❌ Error creating employee"); 
      } 
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="brand"><h2>Dayflow Admin</h2></div>
        <div className="nav-tabs">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Dashboard</button>
          <button className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>Employees</button>
          <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
          <button className={`nav-item ${activeTab === 'timeoff' ? 'active' : ''}`} onClick={() => setActiveTab('timeoff')}>Time Off</button>
          <button className={`nav-item ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>Payroll</button>
        </div>
        <button className="logout-btn" onClick={() => navigate('/')}>Logout <FaSignOutAlt /></button>
      </div>

      {/* --- 1. HOME DASHBOARD TAB --- */}
      {activeTab === 'home' && (
        <>
            <h2 style={{marginBottom: '20px', color: '#444'}}>Overview</h2>
            <div className="grid-layout" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '30px'}}>
                
                {/* Card 1: Total Employees */}
                <div className="employee-card" style={{display:'flex', alignItems:'center', gap:'20px', padding:'25px', borderLeft: '5px solid #6366f1'}}>
                    <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '12px', color: '#6366f1'}}><FaUsers size={24}/></div>
                    <div style={{textAlign: 'left'}}>
                        <h3 style={{fontSize: '2rem', margin: 0}}>{stats.totalEmployees}</h3>
                        <p style={{margin: 0}}>Total Employees</p>
                    </div>
                </div>

                {/* Card 2: Present Today */}
                <div className="employee-card" style={{display:'flex', alignItems:'center', gap:'20px', padding:'25px', borderLeft: '5px solid #10b981'}}>
                    <div style={{background: '#d1fae5', padding: '15px', borderRadius: '12px', color: '#10b981'}}><FaUserCheck size={24}/></div>
                    <div style={{textAlign: 'left'}}>
                        <h3 style={{fontSize: '2rem', margin: 0}}>{stats.presentToday}</h3>
                        <p style={{margin: 0}}>Present Today</p>
                    </div>
                </div>

                {/* Card 3: Pending Leaves */}
                <div className="employee-card" style={{display:'flex', alignItems:'center', gap:'20px', padding:'25px', borderLeft: '5px solid #f59e0b'}}>
                    <div style={{background: '#fef3c7', padding: '15px', borderRadius: '12px', color: '#f59e0b'}}><FaClock size={24}/></div>
                    <div style={{textAlign: 'left'}}>
                        <h3 style={{fontSize: '2rem', margin: 0}}>{stats.pendingLeaves}</h3>
                        <p style={{margin: 0}}>Pending Leaves</p>
                    </div>
                </div>

                {/* Card 4: Monthly Payroll */}
                <div className="employee-card" style={{display:'flex', alignItems:'center', gap:'20px', padding:'25px', borderLeft: '5px solid #ec4899'}}>
                    <div style={{background: '#fce7f3', padding: '15px', borderRadius: '12px', color: '#ec4899'}}><FaMoneyBillWave size={24}/></div>
                    <div style={{textAlign: 'left'}}>
                        <h3 style={{fontSize: '1.5rem', margin: 0}}>₹{(stats.totalPayroll / 1000).toFixed(1)}k</h3>
                        <p style={{margin: 0}}>Monthly Payroll</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 style={{marginBottom: '15px', color: '#666'}}>Quick Actions</h3>
            <div style={{display: 'flex', gap: '15px'}}>
                <button className="btn-primary" onClick={() => { setActiveTab('employees'); setShowCreateForm(true); }}>
                    <FaPlus style={{marginRight: '8px'}}/> Add New Employee
                </button>
                <button className="btn-secondary" onClick={() => setActiveTab('timeoff')}>
                    Review Leave Requests
                </button>
            </div>
        </>
      )}

      {/* --- 2. EMPLOYEES TAB --- */}
      {activeTab === 'employees' && (
        <>
          <div className="controls-bar">
            <button className="btn-primary" onClick={() => setShowCreateForm(true)}><FaPlus style={{ marginRight: '8px' }} /> Add Employee</button>
          </div>
          <div className="grid-layout">
            {employees.map(emp => (
              <div key={emp._id} className="employee-card" onClick={() => handleViewProfile(emp)} style={{cursor: 'pointer'}}>
                <button onClick={(e) => handleDelete(e, emp._id)} style={{position: 'absolute', top: '15px', right: '15px', background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '50%', zIndex: 10}} title="Delete">
                    <FaTrash size={12} />
                </button>
                {emp.profilePicture ? <img src={emp.profilePicture} className="card-avatar" alt={emp.name} /> : <FaUserCircle size={80} color="#e5e7eb" style={{marginBottom: '1rem'}} />}
                <div className="card-info">
                  <h3>{emp.name}</h3><p>{emp.department || 'General Staff'}</p><span className="card-id">{emp.employeeId}</span>
                </div>
                <div style={{marginTop: '1.5rem'}}>
                   <button className="btn-secondary" onClick={(e) => openPayrollModal(e, emp)}><FaMoneyBillWave style={{marginRight: '5px'}}/> Structure Salary</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- 3. ATTENDANCE TAB --- */}
      {activeTab === 'attendance' && (
        <div className="table-wrapper">
            <table className="data-table">
                <thead><tr><th>Employee</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
                <tbody>{attendanceRecords.map(r => (<tr key={r._id}><td><strong>{r.name}</strong></td><td>{r.checkInTime}</td><td>{r.checkOutTime || '--:--'}</td><td><span className={`badge badge-neutral`}>{r.status}</span></td></tr>))}</tbody>
            </table>
        </div>
      )}

      {/* --- 4. TIME OFF TAB --- */}
      {activeTab === 'timeoff' && (
        <div className="table-wrapper">
          <table className="data-table">
             <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Action</th></tr></thead>
             <tbody>
               {leaveRequests.length === 0 ? (
                  <tr><td colSpan="4" style={{textAlign:'center', color:'#999'}}>No pending requests</td></tr>
               ) : (
                  leaveRequests.map(req => (
                   <tr key={req._id}>
                     <td><strong>{req.name}</strong></td>
                     <td>{req.leaveType}</td>
                     <td>{req.startDate} <span style={{color:'#999'}}>to</span> {req.endDate}</td>
                     <td>
                       <div style={{display: 'flex', gap: '10px'}}>
                           <button className="btn-success" onClick={() => handleLeaveAction(req._id, 'Approved')} style={{fontSize:'0.85rem', padding: '6px 12px'}}>Approve</button>
                           <button className="btn-danger" onClick={() => handleLeaveAction(req._id, 'Rejected')} style={{fontSize:'0.85rem', padding: '6px 12px'}}>Reject</button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      )}

      {/* --- 5. PAYROLL TAB --- */}
      {activeTab === 'payroll' && (
        <div className="table-wrapper">
            <table className="data-table">
                <thead><tr><th>Employee</th><th>Basic</th><th>Net Salary</th></tr></thead>
                <tbody>{payrolls.map(p => (<tr key={p._id}><td><strong>{p.name}</strong></td><td>₹{p.basicSalary}</td><td style={{fontWeight:'bold', color:'var(--primary-color)'}}>₹{p.netSalary}</td></tr>))}</tbody>
            </table>
        </div>
      )}

      {/* --- MODAL: CREATE EMPLOYEE --- */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={(e) => {if(e.target.className === 'modal-overlay') setShowCreateForm(false)}}>
          <div className="modal-content">
            <h2 style={{marginBottom: '1.5rem'}}>Create New Employee</h2>
            {createdEmployee ? (
              <div style={{background:'#ecfdf5', padding:'1.5rem', borderRadius:'12px', color:'#065f46', textAlign: 'center'}}>
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>🎉</div>
                <h3 style={{marginBottom: '10px'}}>Employee Created!</h3>
                <div style={{background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #d1fae5', margin: '15px 0'}}>
                    <p><strong>Login ID:</strong> {createdEmployee.id}</p><p><strong>Password:</strong> {createdEmployee.password}</p>
                </div>
                <button className="btn-primary" style={{marginTop:'1.5rem', width: '100%'}} onClick={() => { setCreatedEmployee(null); setShowCreateForm(false); }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Full Name</label><input className="modern-input" onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="grid-layout" style={{gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0'}}>
                    <div className="form-group"><label>Email</label><input type="email" className="modern-input" onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                    <div className="form-group"><label>Phone</label><input type="text" className="modern-input" onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                </div>
                <div className="grid-layout" style={{gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0'}}>
                    <div className="form-group"><label>Department</label><input className="modern-input" onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                    <div className="form-group"><label>Initial Salary</label><input type="number" className="modern-input" onChange={e => setFormData({ ...formData, salary: e.target.value })} /></div>
                </div>
                <div className="form-group" style={{marginTop: '1rem'}}>
                    <label>Profile Picture</label>
                    <div style={{border: '2px dashed #e5e7eb', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative'}}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} />
                        {formData.profilePicture ? <span style={{color: 'green', fontWeight:'bold'}}>Image Selected</span> : <span style={{color: '#9ca3af'}}>Click to upload</span>}
                    </div>
                </div>
                <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
                   <button type="submit" className="btn-primary" style={{flex:1}}>Create Employee</button>
                   <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: PAYROLL --- */}
      {showPayrollModal && (
        <div className="modal-overlay" onClick={(e) => {if(e.target.className === 'modal-overlay') setShowPayrollModal(false)}}>
          <div className="modal-content" style={{maxWidth: '800px', width: '90%'}}>
            <h2 style={{borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px'}}>Salary Info</h2>
            
            <form onSubmit={handlePayrollUpdate}>
              
              {/* Top Row: Wage Input */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                  <div style={{flex: 1, marginRight: '20px'}}>
                      <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Month Wage (CTC)</label>
                      <input 
                          type="number" 
                          style={{width: '100%', fontSize: '1.5rem', padding: '10px', border: 'none', borderBottom: '2px solid #333', outline: 'none', fontWeight: 'bold'}}
                          value={payrollForm.monthlyWage}
                          onChange={e => setPayrollForm({ ...payrollForm, monthlyWage: Number(e.target.value) })}
                          required
                      />
                  </div>
                  <div style={{flex: 1}}>
                       <label style={{display: 'block', color: '#666', marginBottom: '5px'}}>Yearly Wage</label>
                       <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#666'}}>
                           ₹ {(payrollForm.monthlyWage * 12).toLocaleString()} / Year
                       </div>
                  </div>
              </div>

              {/* LIVE PREVIEW GRID */}
              <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px'}}>
                  
                  {/* LEFT COLUMN: EARNINGS */}
                  <div>
                      <h4 style={{borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px'}}>Salary Components</h4>
                      
                      {/* We calculate local variables just for preview display */}
                      {[
                        { label: 'Basic Salary (50%)', val: payrollForm.monthlyWage * 0.5 },
                        { label: 'House Rent Allowance (50% of Basic)', val: (payrollForm.monthlyWage * 0.5) * 0.5 },
                        { label: 'Standard Allowance (~16%)', val: (payrollForm.monthlyWage * 0.5) * 0.1667 },
                        { label: 'Performance Bonus (~8%)', val: (payrollForm.monthlyWage * 0.5) * 0.0833 },
                        { label: 'Leave Travel Allowance (~8%)', val: (payrollForm.monthlyWage * 0.5) * 0.0833 },
                        { label: 'Fixed Allowance (Balance)', val: payrollForm.monthlyWage - ((payrollForm.monthlyWage * 0.5) + ((payrollForm.monthlyWage * 0.5) * 0.5) + ((payrollForm.monthlyWage * 0.5) * 0.1667) + ((payrollForm.monthlyWage * 0.5) * 0.0833) * 2) },
                      ].map((item, i) => (
                          <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem'}}>
                              <span>{item.label}</span>
                              <strong>₹ {Math.max(0, Math.round(item.val)).toLocaleString()}</strong>
                          </div>
                      ))}
                      <div style={{borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between'}}>
                          <strong>Gross Earnings</strong>
                          <strong>₹ {payrollForm.monthlyWage}</strong>
                      </div>
                  </div>

                  {/* RIGHT COLUMN: DEDUCTIONS */}
                  <div>
                      <h4 style={{borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px'}}>Deductions</h4>
                      
                      <div style={{marginBottom: '20px'}}>
                          <div style={{fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem'}}>Provident Fund (PF)</div>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}>
                              <span>Employee (12% of Basic)</span>
                              <strong style={{color: '#dc2626'}}>- ₹ {Math.round((payrollForm.monthlyWage * 0.5) * 0.12)}</strong>
                          </div>
                      </div>

                      <div style={{marginBottom: '20px'}}>
                          <div style={{fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem'}}>Tax Deductions</div>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}>
                              <span>Professional Tax</span>
                              <strong style={{color: '#dc2626'}}>- ₹ 200</strong>
                          </div>
                      </div>

                      <div style={{background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '20px'}}>
                          <div style={{fontSize: '0.9rem', color: '#166534', marginBottom: '5px'}}>Net Monthly Pay</div>
                          <div style={{fontSize: '1.8rem', fontWeight: '800', color: '#166534'}}>
                              ₹ {Math.round(payrollForm.monthlyWage - ((payrollForm.monthlyWage * 0.5) * 0.12) - 200).toLocaleString()}
                          </div>
                      </div>
                  </div>
              </div>

              <button type="submit" className="btn-primary" style={{width:'100%', marginTop: '30px', padding: '15px', fontSize: '1rem'}}>
                  Confirm & Save Structure
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VIEW PROFILE --- */}
      {showViewModal && selectedEmp && (
         <div className="modal-overlay" onClick={(e) => {if(e.target.className === 'modal-overlay') setShowViewModal(false)}}>
            <div className="modal-content" style={{maxWidth: '700px', width: '90%'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
                    <h2 style={{margin: 0}}>Employee Details</h2>
                    <button onClick={() => setShowViewModal(false)} style={{background: 'none', fontSize: '1.2rem', color: '#666', cursor: 'pointer'}}><FaTimes/></button>
                </div>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', background: '#f9fafb', padding: '20px', borderRadius: '12px'}}>
                    {selectedEmp.profilePicture ? <img src={selectedEmp.profilePicture} style={{width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} /> : <FaUserCircle size={100} color="#ccc" />}
                    <div>
                        <h2 style={{margin: 0, fontSize: '1.5rem'}}>{selectedEmp.name}</h2>
                        <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                            <span style={{background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>{selectedEmp.employeeId}</span>
                            <span style={{background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>{selectedEmp.role}</span>
                        </div>
                    </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                    <div>
                        <h4 style={{marginBottom: '15px', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Personal Information</h4>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Email Address</div><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FaEnvelope color="#6366f1"/> {selectedEmp.email}</div></div>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Phone Number</div><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FaPhone color="#6366f1"/> {selectedEmp.phone || 'Not Provided'}</div></div>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Residential Address</div><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FaMapMarkerAlt color="#6366f1"/> {selectedEmp.address || 'Not Provided'}</div></div>
                    </div>
                    <div>
                        <h4 style={{marginBottom: '15px', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Job Details</h4>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Department</div><div style={{fontWeight: '500'}}>{selectedEmp.department || 'General'}</div></div>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Designation</div><div style={{fontWeight: '500'}}>{selectedEmp.designation || 'Employee'}</div></div>
                        <div style={{marginBottom: '10px'}}><div style={{fontSize: '0.8rem', color: '#999'}}>Date of Joining</div><div style={{fontWeight: '500'}}>{selectedEmp.joiningDate || 'Not Set'}</div></div>
                    </div>
                </div>
                <div style={{marginTop: '30px', borderTop: '2px dashed #eee', paddingTop: '20px'}}>
                    <h4 style={{marginBottom: '15px', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center'}}><FaMoneyBillWave style={{marginRight: '8px', color: '#10b981'}}/> Financial Overview</h4>
                    {selectedEmpPayroll ? (
                        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '15px'}}>
                                <div>
                                    <span style={{fontSize: '0.9rem', color: '#666'}}>Total CTC</span>
                                    <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>₹ {selectedEmpPayroll.monthlyWage}</div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{fontSize: '0.9rem', color: '#666'}}>Net Pay</span>
                                    <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#16a34a'}}>₹ {selectedEmpPayroll.netSalary}</div>
                                </div>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem'}}>
                                <div>
                                    <strong style={{color: '#444'}}>Earnings</strong>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}><span>Basic</span> <span>{selectedEmpPayroll.basicSalary}</span></div>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}><span>HRA</span> <span>{selectedEmpPayroll.hra}</span></div>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Allowances</span> <span>{selectedEmpPayroll.standardAllowance + selectedEmpPayroll.performanceBonus + selectedEmpPayroll.lta + selectedEmpPayroll.fixedAllowance}</span></div>
                                </div>
                                <div>
                                    <strong style={{color: '#444'}}>Deductions</strong>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#dc2626'}}><span>PF</span> <span>- {selectedEmpPayroll.pf}</span></div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', color: '#dc2626'}}><span>Tax</span> <span>- {selectedEmpPayroll.tax}</span></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '8px', color: '#9ca3af', fontStyle: 'italic'}}>Salary structure has not been defined for this employee yet.<br/><button onClick={(e) => { setShowViewModal(false); openPayrollModal(e, selectedEmp); }} style={{marginTop: '10px', color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}>Set Structure Now</button></div>
                    )}
                </div>
            </div>
         </div>
      )}
    </div>
  );
}
export default AdminDashboard;