import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiDocumentText, HiBriefcase, HiChartBar, HiUser, HiUsers, HiPlus } from 'react-icons/hi';

const employeeLinks = [
  { to: '/', icon: <HiHome size={20} />, label: 'Home' },
  { to: '/dashboard', icon: <HiChartBar size={20} />, label: 'Dashboard' },
  { to: '/jobs', icon: <HiBriefcase size={20} />, label: 'Jobs' },
  { to: '/resumes', icon: <HiDocumentText size={20} />, label: 'Resumes' },
  { to: '/profile', icon: <HiUser size={20} />, label: 'Profile' },
];

const employerLinks = [
  { to: '/employer/dashboard', icon: <HiChartBar size={20} />, label: 'Dashboard' },
  { to: '/employer/post-job', icon: <HiPlus size={20} />, label: 'Post Job' },
  { to: '/profile', icon: <HiUser size={20} />, label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === 'employer' ? employerLinks : employeeLinks;

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-content">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/employer/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => { if (window.innerWidth <= 768) onClose(); }}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
