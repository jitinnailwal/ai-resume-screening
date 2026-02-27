import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="app-body">
        {user && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className={`main-content ${user && sidebarOpen ? 'with-sidebar' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
