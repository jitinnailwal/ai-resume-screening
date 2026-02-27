import { useState, useEffect } from 'react';
import { getEmployerDashboard, getEmployerJobs } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiBriefcase, HiUsers, HiCheckCircle, HiClock, HiPlus, HiPencil } from 'react-icons/hi';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEmployerDashboard(), getEmployerJobs()])
      .then(([dashRes, jobsRes]) => {
        setData(dashRes.data);
        setJobs(jobsRes.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const stats = [
    { label: 'Total Jobs', value: data?.totalJobs ?? 0, icon: <HiBriefcase size={24} /> },
    { label: 'Active Jobs', value: data?.activeJobs ?? 0, icon: <HiBriefcase size={24} /> },
    { label: 'Total Applicants', value: data?.totalApplicants ?? 0, icon: <HiUsers size={24} /> },
    { label: 'Pending Review', value: data?.pendingApplicants ?? 0, icon: <HiClock size={24} /> },
  ];

  return (
    <div className="employer-dashboard">
      <div className="page-header">
        <div>
          <h1>Employer Dashboard</h1>
          <p>{user?.company || 'Your Company'}</p>
        </div>
        <Link to="/employer/post-job" className="btn btn-primary">
          <HiPlus size={18} /> Post New Job
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Posted Jobs */}
      <div className="card">
        <div className="card-header-row">
          <h2><HiBriefcase size={20} /> Your Job Listings</h2>
          <Link to="/employer/post-job" className="btn btn-outline btn-sm">
            <HiPlus size={14} /> New Job
          </Link>
        </div>
        {jobs.length > 0 ? (
          <div className="employer-jobs-list">
            {jobs.map((job) => (
              <div key={job._id} className="employer-job-item">
                <div className="employer-job-info">
                  <h3>{job.title}</h3>
                  <p>{job.company} — {job.location}</p>
                  <div className="job-meta">
                    {job.type && <span className="badge">{job.type}</span>}
                    {job.mode && <span className="badge">{job.mode}</span>}
                    <span className="badge">{job.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="employer-job-stats">
                  <div className="applicant-count">
                    <span className="count-number">{job.applicantCount || 0}</span>
                    <span className="count-label">Applicants</span>
                  </div>
                  {job.pendingCount > 0 && (
                    <span className="pending-badge">{job.pendingCount} pending</span>
                  )}
                </div>
                <div className="employer-job-actions">
                  <Link to={`/employer/edit-job/${job._id}`} className="btn btn-outline btn-sm">
                    <HiPencil size={14} /> Edit
                  </Link>
                  <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">
                    View Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">No jobs posted yet. Create your first job listing!</p>
        )}
      </div>

      {/* Recent Applicants */}
      {data?.recentApplicants?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2><HiUsers size={20} /> Recent Applicants</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplicants.map((app, i) => (
                  <tr key={i}>
                    <td>{app.user?.name || 'Unknown'}</td>
                    <td>{app.user?.email || '-'}</td>
                    <td>{app.jobTitle}</td>
                    <td><span className={`badge status-${app.status}`}>{app.status}</span></td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
