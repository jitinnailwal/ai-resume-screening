import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Resumes from './pages/Resumes';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import Applicants from './pages/Applicants';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Employee routes */}
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
              <Route path="/resumes" element={<PrivateRoute><Resumes /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              {/* Employer routes */}
              <Route path="/employer/dashboard" element={<PrivateRoute><EmployerDashboard /></PrivateRoute>} />
              <Route path="/employer/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
              <Route path="/employer/edit-job/:jobId" element={<PrivateRoute><PostJob /></PrivateRoute>} />
              <Route path="/employer/jobs/:jobId/applicants" element={<PrivateRoute><Applicants /></PrivateRoute>} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
