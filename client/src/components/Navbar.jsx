import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiSun, HiMoon, HiMenu, HiX } from 'react-icons/hi';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = user?.avatar && user.avatar !== 'default-avatar.png'
    ? `/uploads/avatars/${user.avatar}`
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user && (
          <button className="icon-btn" onClick={onToggleSidebar}>
            {sidebarOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        )}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">AI</span>
          <span>ResumeScreen</span>
        </Link>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
        </button>

        {user ? (
          <div className="dropdown" ref={dropdownRef}>
            <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <FiUser size={18} />
                </div>
              )}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <FiUser size={16} /> Profile
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
