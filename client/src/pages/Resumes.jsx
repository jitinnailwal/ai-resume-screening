import { useState, useEffect, useRef } from 'react';
import { getMyResumes, uploadResume, deleteResume, reanalyzeResume, reanalyzeAllResumes } from '../services/api';
import toast from 'react-hot-toast';
import { HiDocumentText, HiUpload, HiTrash, HiStar, HiRefresh, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const BREAKDOWN_LABELS = {
  sectionDetection: 'Sections',
  skillsMatching: 'Skills',
  experienceQuality: 'Experience',
  education: 'Education',
  formattingStructure: 'Formatting',
  contactInformation: 'Contact',
  keywordRelevance: 'Keywords',
  achievementsImpact: 'Achievements',
};

function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;
  return (
    <div className="score-breakdown">
      <h3>Score Breakdown</h3>
      {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => {
        const item = breakdown[key];
        if (!item) return null;
        const pct = item.max > 0 ? (item.score / item.max) * 100 : 0;
        const fillClass = pct >= 70 ? 'fill-high' : pct >= 40 ? 'fill-mid' : 'fill-low';
        return (
          <div key={key} className="breakdown-row">
            <span className="breakdown-label">{label}</span>
            <div className="breakdown-bar-wrap">
              <div className={`breakdown-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="breakdown-value">{item.score}/{item.max}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(null);
  const [expanded, setExpanded] = useState({});
  const fileRef = useRef(null);

  const fetchResumes = async () => {
    try {
      const res = await getMyResumes();
      setResumes(res.data.resumes || res.data || []);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      await uploadResume(formData);
      toast.success('Resume uploaded!');
      fetchResumes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return;
    setDeleting(id);
    try {
      await deleteResume(id);
      toast.success('Resume deleted');
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const handleReanalyze = async (id) => {
    setReanalyzing(id);
    try {
      const res = await reanalyzeResume(id);
      toast.success(`Score updated: ${res.data.score}/100`);
      setResumes((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Re-analyze failed');
    } finally {
      setReanalyzing(null);
    }
  };

  const handleReanalyzeAll = async () => {
    setReanalyzing('all');
    try {
      const res = await reanalyzeAllResumes();
      toast.success(res.data.message);
      if (res.data.resumes) setResumes(res.data.resumes);
      else fetchResumes();
    } catch (err) {
      toast.error('Re-analyze failed');
    } finally {
      setReanalyzing(null);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="resumes-page">
      <div className="page-header">
        <h1>My Resumes</h1>
        <div className="header-actions">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            hidden
          />
          <button
            className="btn btn-outline"
            onClick={handleReanalyzeAll}
            disabled={reanalyzing === 'all' || resumes.length === 0}
          >
            <HiRefresh size={18} />
            {reanalyzing === 'all' ? 'Analyzing...' : 'Re-analyze All'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <HiUpload size={18} />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>

      {resumes.length > 0 ? (
        <div className="resumes-list">
          {resumes.map((resume) => (
            <div key={resume._id} className="card resume-card resume-card-expandable" style={{ flexWrap: 'wrap' }}>
              <div className="resume-icon">
                <HiDocumentText size={32} />
              </div>
              <div className="resume-info">
                <h3>{resume.fileName}</h3>
                <div className="resume-meta">
                  <span className="badge">{resume.status}</span>
                  <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                </div>
                {resume.skills?.length > 0 && (
                  <div className="skill-tags">
                    {resume.skills.slice(0, 6).map((s) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                    {resume.skills.length > 6 && (
                      <span className="skill-tag more">+{resume.skills.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="resume-score-col">
                <div
                  className={`score-badge-lg ${getScoreColor(resume.score)}`}
                  onClick={() => toggleExpand(resume._id)}
                  title="Click to toggle breakdown"
                >
                  <HiStar size={16} />
                  <span>{resume.score}</span>
                  {resume.scoreBreakdown && (
                    expanded[resume._id] ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />
                  )}
                </div>
              </div>
              <div className="resume-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleReanalyze(resume._id)}
                  disabled={reanalyzing === resume._id}
                  title="Re-analyze resume"
                >
                  <HiRefresh size={16} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(resume._id)}
                  disabled={deleting === resume._id}
                  title="Delete resume"
                >
                  <HiTrash size={16} />
                </button>
              </div>

              {expanded[resume._id] && resume.scoreBreakdown && (
                <div className="resume-expanded-content">
                  <ScoreBreakdown breakdown={resume.scoreBreakdown} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <HiDocumentText size={48} />
          <p>No resumes uploaded yet. Upload your first resume to get started!</p>
        </div>
      )}
    </div>
  );
}
