import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // <--- IMPORT THIS
import 'react-toastify/dist/ReactToastify.css'; // <--- IMPORT CSS
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      {/* This container shows the toasts anywhere in the app */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        
        <Route 
          path="/admin-dashboard" 
          element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/employee-dashboard" 
          element={user?.role === 'Employee' ? <EmployeeDashboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;