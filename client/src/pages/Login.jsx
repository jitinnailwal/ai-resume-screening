import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiOfficeBuilding } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleTab, setRoleTab] = useState('employee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      // Navigate based on actual user role from backend
      const userRole = data.user?.role || 'employee';
      navigate(userRole === 'employer' ? '/employer/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">AI</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Role Tabs */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${roleTab === 'employee' ? 'active' : ''}`}
            onClick={() => setRoleTab('employee')}
          >
            <HiUser size={16} /> Employee
          </button>
          <button
            type="button"
            className={`role-btn ${roleTab === 'employer' ? 'active' : ''}`}
            onClick={() => setRoleTab('employer')}
          >
            <HiOfficeBuilding size={16} /> Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <HiMail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <HiLockClosed className="input-icon" size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? 'Signing in...' : `Sign In as ${roleTab === 'employer' ? 'Employer' : 'Employee'}`}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
