import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { toast } from 'react-toastify'; // <--- Import Toast
import './App.css'; 

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [leaveForm, setLeaveForm] = useState({ type: 'Paid', startDate: '', endDate: '', remarks: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditForm(userData);
      fetchData(userData.employeeId);
    } else navigate('/');
  }, []);

  const fetchData = async (empId) => {
    try {
      const attRes = await axios.get(`http://localhost:5000/api/attendance/${empId}`);
      setAttendanceHistory(attRes.data);
      const leaveRes = await axios.get(`http://localhost:5000/api/leaves/my-leaves/${empId}`);
      setMyLeaves(leaveRes.data);
      const payRes = await axios.get(`http://localhost:5000/api/payroll/${empId}`);
      setPayroll(payRes.data);
    } catch (err) { }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin', { employeeId: user.employeeId, name: user.name });
      toast.success("Checked IN Successfully!"); // <--- TOAST
      fetchData(user.employeeId);
    } catch (err) { toast.error(err.response?.data?.message); } // <--- TOAST
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkout', { employeeId: user.employeeId });
      toast.success("Checked OUT Successfully!"); // <--- TOAST
      fetchData(user.employeeId);
    } catch (err) { toast.error(err.response?.data?.message); } // <--- TOAST
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/user/update', { employeeId: user.employeeId, phone: editForm.phone, address: editForm.address });
      toast.success("Profile Updated!"); // <--- TOAST
      const updatedUser = { ...user, phone: editForm.phone, address: editForm.address };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); setIsEditing(false);
    } catch (err) { toast.error("Update failed"); }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/leaves/apply', { employeeId: user.employeeId, name: user.name, leaveType: leaveForm.type, startDate: leaveForm.startDate, endDate: leaveForm.endDate, remarks: leaveForm.remarks });
      toast.success("Leave Request Sent!"); // <--- TOAST
      fetchData(user.employeeId);
    } catch (err) { toast.error("Failed to apply"); }
  };
// Helper to calculate days between dates
  const calculateDays = (start, end) => {
      if (!start || !end) return 0;
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Calculate difference in time
      const diffTime = Math.abs(endDate - startDate);
      // Calculate difference in days (divide by milliseconds in a day)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day
      
      return diffDays > 0 ? diffDays : 0;
  };

  // Get current days count for display
  const daysCount = calculateDays(leaveForm.startDate, leaveForm.endDate);
  if (!user) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="brand"><h2>Welcome, {user.name}</h2></div>
        <div className="nav-tabs">
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
          <button className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>Leaves</button>
          <button className={`nav-item ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>Salary</button>
        </div>
        <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/'); }}>Logout <FaSignOutAlt /></button>
      </div>

      {activeTab === 'profile' && (
        <div className="employee-card" style={{maxWidth: '600px', margin: '0 auto'}}>
          {user.profilePicture ? <img src={user.profilePicture} className="card-avatar" style={{width: '120px', height: '120px'}} /> : <FaUserCircle size={100} color="#e5e7eb" style={{marginBottom: '1rem'}} />}
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0'}}>
             <button className="btn-success" onClick={handleCheckIn} style={{width: '150px'}}>Check IN</button>
             <button className="btn-danger" onClick={handleCheckOut} style={{width: '150px'}}>Check OUT</button>
          </div>
          {!isEditing ? (
            <div style={{textAlign: 'left', background: '#f9fafb', padding: '1.5rem', borderRadius: '12px'}}>
               <p><strong>Email:</strong> {user.email}</p><p style={{marginTop: '0.5rem'}}><strong>Phone:</strong> {user.phone || 'Not set'}</p><p style={{marginTop: '0.5rem'}}><strong>Address:</strong> {user.address || 'Not set'}</p><p style={{marginTop: '0.5rem'}}><strong>Department:</strong> {user.department}</p>
               <button className="btn-secondary" style={{marginTop: '1.5rem', width: '100%'}} onClick={() => setIsEditing(true)}>Edit Contact Info</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} style={{textAlign: 'left'}}>
               <div className="form-group"><label>Phone</label><input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
               <div className="form-group"><label>Address</label><input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
               <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
                  <button type="submit" className="btn-primary" style={{flex:1}}>Save</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
               </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'attendance' && <div className="table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead><tbody>{attendanceHistory.map(r => (<tr key={r._id}><td>{r.date}</td><td>{r.checkInTime}</td><td>{r.checkOutTime}</td><td>{r.status}</td></tr>))}</tbody></table></div>}

      {activeTab === 'leaves' && (
        <div className="grid-layout" style={{gridTemplateColumns: '1fr 1fr'}}>
          <div className="employee-card" style={{textAlign: 'left'}}>
             <h3 style={{marginBottom: '1rem'}}>Apply for Leave</h3>
             <form onSubmit={handleApplyLeave}>
                <div className="form-group">
                    <label>Type</label>
                    <select className="modern-input" onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}>
                        <option>Paid</option>
                        <option>Sick</option>
                        <option>Casual</option>
                    </select>
                </div>
                
                <div className="grid-layout" style={{gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0'}}>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" className="modern-input" onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" className="modern-input" onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
                    </div>
                </div>

                {/* --- NEW: DAYS CALCULATOR DISPLAY --- */}
                {leaveForm.startDate && leaveForm.endDate && (
                    <div style={{background: '#e0f2fe', color: '#0369a1', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center'}}>
                        Applying for: {daysCount} Day{daysCount > 1 ? 's' : ''}
                    </div>
                )}

                <div className="form-group">
                    <label>Reason / Remarks</label>
                    <textarea 
                        className="modern-input" 
                        placeholder="Why do you need leave?"
                        onChange={e => setLeaveForm({ ...leaveForm, remarks: e.target.value })}
                        style={{minHeight: '80px'}}
                    />
                </div>

                <button type="submit" className="btn-primary" style={{width: '100%'}}>Submit Request</button>
             </form>
          </div>

          <div className="employee-card" style={{textAlign: 'left'}}>
             <h3 style={{marginBottom: '1rem'}}>My Requests</h3>
             {myLeaves.length === 0 ? <p style={{color: 'gray'}}>No requests yet.</p> : 
               myLeaves.map(l => (
                 <div key={l._id} style={{padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <strong>{l.leaveType}</strong>
                        <div style={{fontSize: '0.8rem', color: '#666', marginTop: '4px'}}>
                            {l.startDate} to {l.endDate}
                        </div>
                        <div style={{fontSize: '0.8rem', fontStyle: 'italic', color: '#999'}}>
                             "{l.remarks || 'No remarks'}"
                        </div>
                    </div>
                    <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                 </div>
               ))
             }
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="employee-card" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'left'}}>
           {payroll ? (
             <>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee'}}>
                   <FaWallet size={30} color="var(--primary-color)" /><h2>Salary Slip</h2>
                </div>
                <div style={{display: 'flex', gap: '4rem'}}>
                   <div style={{flex: 1}}>
                      <h4 style={{color: 'gray', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem'}}>Earnings</h4>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}><span>Basic Salary</span> <strong>₹{payroll.basicSalary}</strong></div>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}><span>HRA</span> <strong>₹{payroll.hra}</strong></div>
                   </div>
                   <div style={{flex: 1}}>
                      <h4 style={{color: 'gray', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem'}}>Deductions</h4>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}><span>PF</span> <strong style={{color: 'var(--danger-color)'}}>- ₹{payroll.pf}</strong></div>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}><span>Tax</span> <strong style={{color: 'var(--danger-color)'}}>- ₹{payroll.tax}</strong></div>
                   </div>
                </div>
                <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>Net Pay</span><span style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>₹{payroll.netSalary}</span>
                </div>
             </>
           ) : <p>Salary structure not set by Admin yet.</p>}
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;