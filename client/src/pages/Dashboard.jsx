import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiDocumentText, HiStar, HiBriefcase, HiTrendingUp } from 'react-icons/hi';

function MiniBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const categories = [
    breakdown.sectionDetection,
    breakdown.skillsMatching,
    breakdown.experienceQuality,
    breakdown.education,
    breakdown.formattingStructure,
    breakdown.contactInformation,
    breakdown.keywordRelevance,
    breakdown.achievementsImpact,
  ].filter(Boolean);

  if (categories.length === 0) return null;

  const totalMax = categories.reduce((sum, c) => sum + c.max, 0);

  return (
    <div className="mini-breakdown">
      {categories.map((cat, i) => {
        const pct = totalMax > 0 ? (cat.max / totalMax) * 100 : 0;
        const fillPct = cat.max > 0 ? (cat.score / cat.max) * 100 : 0;
        const segClass = fillPct >= 70 ? 'seg-high' : fillPct >= 40 ? 'seg-mid' : 'seg-low';
        return (
          <div
            key={i}
            className={`mini-breakdown-seg ${segClass}`}
            style={{ width: `${pct}%`, opacity: cat.score === 0 ? 0.25 : 1 }}
          />
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (!data) {
    return <div className="page-center"><p>Could not load dashboard data.</p></div>;
  }

  const stats = [
    { label: 'Total Resumes', value: data.totalResumes ?? 0, icon: <HiDocumentText size={24} />, color: 'stat-blue' },
    { label: 'Avg Score', value: data.avgScore ?? 0, icon: <HiStar size={24} />, color: 'stat-yellow' },
    { label: 'Jobs Applied', value: data.appliedJobs ?? 0, icon: <HiBriefcase size={24} />, color: 'stat-green' },
    { label: 'Available Jobs', value: data.totalJobs ?? 0, icon: <HiTrendingUp size={24} />, color: 'stat-purple' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your resume screening overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{typeof stat.value === 'number' ? Math.round(stat.value) : stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Top Skills */}
        <div className="card">
          <h2>Top Skills</h2>
          {data.topSkills?.length > 0 ? (
            <div className="skills-list">
              {data.topSkills.map((item, i) => (
                <div key={i} className="skill-row">
                  <span className="skill-name">{item.skill || item}</span>
                  {item.count && <span className="skill-count">{item.count}x</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No skills data yet. Upload a resume to get started.</p>
          )}
        </div>

        {/* Recent Resumes */}
        <div className="card">
          <div className="card-header-row">
            <h2>Recent Resumes</h2>
            <Link to="/resumes" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {data.recentResumes?.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentResumes.map((r) => (
                    <tr key={r._id}>
                      <td className="file-cell">{r.fileName}</td>
                      <td>
                        <span className={`score-badge ${r.score >= 70 ? 'score-high' : r.score >= 40 ? 'score-mid' : 'score-low'}`}>
                          {r.score}
                        </span>
                        <MiniBreakdown breakdown={r.scoreBreakdown} />
                      </td>
                      <td><span className="badge">{r.status}</span></td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-text">No resumes uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
