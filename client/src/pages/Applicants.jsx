import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicants, updateApplicantStatus, getApplicantResume } from '../services/api';
import toast from 'react-hot-toast';
import { HiUsers, HiCheckCircle, HiXCircle, HiDocumentText, HiArrowLeft, HiStar } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';

export default function Applicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await getApplicants(jobId);
      setJob(res.data.job);
      setApplicants(res.data.applicants);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (applicantId, status) => {
    setUpdating(applicantId);
    try {
      await updateApplicantStatus(jobId, applicantId, status);
      toast.success(`Applicant ${status}`);
      setApplicants((prev) =>
        prev.map((a) => (a._id === applicantId ? { ...a, status } : a))
      );
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const viewResume = async (userId) => {
    setLoadingResume(true);
    try {
      const res = await getApplicantResume(userId);
      setSelectedResume(res.data);
    } catch (err) {
      toast.error('Failed to load resume');
    } finally {
      setLoadingResume(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const getStatusColor = (status) => {
    if (status === 'accepted') return 'status-accepted';
    if (status === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  return (
    <div className="applicants-page">
      <div className="page-header">
        <Link to="/employer/dashboard" className="back-link">
          <HiArrowLeft size={18} /> Back to Dashboard
        </Link>
        <h1><HiUsers size={24} /> Applicants</h1>
        {job && <p>{job.title} at {job.company}</p>}
      </div>

      {applicants.length > 0 ? (
        <div className="applicants-list">
          {applicants.map((app) => (
            <div key={app._id} className="card applicant-card">
              <div className="applicant-header">
                <div className="applicant-avatar">
                  {app.user?.avatar && app.user.avatar !== 'default-avatar.png' ? (
                    <img src={`/uploads/avatars/${app.user.avatar}`} alt="" />
                  ) : (
                    <FiUser size={24} />
                  )}
                </div>
                <div className="applicant-info">
                  <h3>{app.user?.name || 'Unknown'}</h3>
                  <p>{app.user?.email}</p>
                  {app.user?.skills?.length > 0 && (
                    <div className="skill-tags">
                      {app.user.skills.slice(0, 5).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="applicant-status-col">
                  <span className={`badge ${getStatusColor(app.status)}`}>{app.status}</span>
                  <p className="applied-date">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Resume Preview */}
              {app.resume && (
                <div className="applicant-resume-preview">
                  <HiDocumentText size={16} />
                  <span>{app.resume.fileName}</span>
                  <span className={`score-badge ${app.resume.score >= 70 ? 'score-high' : app.resume.score >= 40 ? 'score-mid' : 'score-low'}`}>
                    Score: {app.resume.score}
                  </span>
                </div>
              )}

              <div className="applicant-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => viewResume(app.user._id)}
                  disabled={loadingResume}
                >
                  <HiDocumentText size={14} /> View Resume
                </button>
                {app.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatus(app._id, 'accepted')}
                      disabled={updating === app._id}
                    >
                      <HiCheckCircle size={14} /> Accept
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatus(app._id, 'rejected')}
                      disabled={updating === app._id}
                    >
                      <HiXCircle size={14} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <HiUsers size={48} />
          <p>No applicants for this job yet.</p>
        </div>
      )}

      {/* Resume Modal */}
      {selectedResume && (
        <div className="modal-overlay" onClick={() => setSelectedResume(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedResume.user?.name}'s Profile</h2>
              <button className="icon-btn" onClick={() => setSelectedResume(null)}>
                <HiXCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="resume-profile-info">
                <p><strong>Email:</strong> {selectedResume.user?.email}</p>
                {selectedResume.user?.bio && <p><strong>Bio:</strong> {selectedResume.user.bio}</p>}
                {selectedResume.user?.skills?.length > 0 && (
                  <div>
                    <strong>Skills:</strong>
                    <div className="skill-tags">
                      {selectedResume.user.skills.map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Resumes</h3>
              {selectedResume.resumes?.length > 0 ? (
                selectedResume.resumes.map((r) => (
                  <div key={r._id} className="resume-detail-card">
                    <div className="resume-detail-header">
                      <span><HiDocumentText size={16} /> {r.fileName}</span>
                      <span className={`score-badge ${r.score >= 70 ? 'score-high' : r.score >= 40 ? 'score-mid' : 'score-low'}`}>
                        <HiStar size={12} /> {r.score}/100
                      </span>
                    </div>
                    <p className="resume-detail-status">Status: {r.status} | {new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.skills?.length > 0 && (
                      <div className="skill-tags">
                        {r.skills.map((s) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    )}
                    {r.parsedText && (
                      <details className="resume-text-details">
                        <summary>View Parsed Text</summary>
                        <pre className="resume-parsed-text">{r.parsedText.substring(0, 2000)}</pre>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-text">No resumes uploaded by this applicant.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
