import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './App.css'; // Make sure this is imported!

function Login({ setUser }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/login', { loginId, password });
      
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Welcome back, ${res.data.user.name}!`);

      if (res.data.user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Header Section */}
        <div className="login-header">
          <div style={{display:'flex', justifyContent:'center', marginBottom:'10px'}}>
             <div style={{background: 'linear-gradient(to right, #6366f1, #a855f7)', padding:'12px', borderRadius:'12px', color:'white'}}>
                 <FaBuilding size={24}/>
             </div>
          </div>
          <h1 className="brand-title">Dayflow HRM</h1>
          <p className="brand-subtitle">Secure access to your workforce portal</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="login-form">
          
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input 
              type="text" 
              className="modern-input"
              placeholder="Employee ID / Email" 
              value={loginId}
              onChange={e => setLoginId(e.target.value)} 
              required 
            />
          </div>

          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              className="modern-input"
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>

        </form>

        {/* Footer Section */}
        <div className="login-footer">
          <p>Forgot your password? Contact your HR Admin.</p>
        </div>

      </div>
    </div>
  );
}

export default Login;