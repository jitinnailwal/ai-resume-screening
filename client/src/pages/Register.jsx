import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiOfficeBuilding } from 'react-icons/hi';

export default function Register() {
  const [role, setRole] = useState('employee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (role === 'employer' && !company.trim()) {
      return toast.error('Company name is required for employers');
    }
    setLoading(true);
    try {
      await register(name, email, password, role, company);
      toast.success('Account created!');
      navigate(role === 'employer' ? '/employer/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">AI</span>
          <h1>Create Account</h1>
          <p>Get started with AI Resume Screening</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${role === 'employee' ? 'active' : ''}`}
            onClick={() => setRole('employee')}
          >
            <HiUser size={16} /> Employee
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'employer' ? 'active' : ''}`}
            onClick={() => setRole('employer')}
          >
            <HiOfficeBuilding size={16} /> Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <HiUser className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          {role === 'employer' && (
            <div className="input-group">
              <HiOfficeBuilding className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <HiLockClosed className="input-icon" size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
            </button>
          </div>

          <div className="input-group">
            <HiLockClosed className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? 'Creating account...' : `Create ${role === 'employer' ? 'Employer' : ''} Account`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
