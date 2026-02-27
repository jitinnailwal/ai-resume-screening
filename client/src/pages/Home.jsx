import { useState, useRef } from 'react';
import { uploadResume, getRecommendations, reanalyzeResume } from '../services/api';
import toast from 'react-hot-toast';
import { HiUpload, HiDocumentText, HiStar, HiBriefcase, HiCheckCircle } from 'react-icons/hi';

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

function AnalysisMetadata({ metadata }) {
  if (!metadata) return null;
  const items = [
    { label: 'Years of Exp', value: metadata.yearsOfExperience || 0 },
    { label: 'Degree', value: metadata.highestDegree || 'N/A' },
    { label: 'Words', value: metadata.totalWords || 0 },
    { label: 'Bullet Points', value: metadata.bulletPoints || 0 },
    { label: 'Action Verbs', value: metadata.actionVerbCount || 0 },
    { label: 'Achievements', value: metadata.quantifiedAchievements || 0 },
    { label: 'Certifications', value: metadata.certificationCount || 0 },
    { label: 'Email', value: metadata.hasEmail, bool: true },
    { label: 'Phone', value: metadata.hasPhone, bool: true },
    { label: 'LinkedIn', value: metadata.hasLinkedIn, bool: true },
    { label: 'GitHub', value: metadata.hasGitHub, bool: true },
  ];
  return (
    <div className="analysis-metadata">
      <h3>Analysis Details</h3>
      <div className="metadata-grid">
        {items.map((item) => (
          <div key={item.label} className="metadata-item">
            <span className="metadata-label">{item.label}</span>
            <span className={`metadata-value ${item.bool ? (item.value ? 'meta-yes' : 'meta-no') : ''}`}>
              {item.bool ? (item.value ? 'Yes' : 'No') : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategorizedSkills({ categorizedSkills, flatSkills }) {
  // If categorized data exists, show grouped view
  const categories = categorizedSkills && typeof categorizedSkills === 'object'
    ? Object.entries(categorizedSkills).filter(([, skills]) => skills && skills.length > 0)
    : null;

  if (categories && categories.length > 0) {
    return (
      <div className="categorized-skills">
        <h3>Skills Detected ({categories.reduce((sum, [, s]) => sum + s.length, 0)})</h3>
        {categories.map(([category, skills]) => (
          <div key={category} className="skill-category">
            <div className="skill-category-name">{category}</div>
            <div className="skill-tags">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: flat list for old resumes
  if (flatSkills && flatSkills.length > 0) {
    return (
      <div className="skills-found">
        <h3>Skills Detected</h3>
        <div className="skill-tags">
          {flatSkills.map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resume, setResume] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await uploadResume(formData);
      let resumeData = res.data;

      // If score is still 0, force a re-analyze
      if (resumeData._id && resumeData.score === 0) {
        try {
          const reRes = await reanalyzeResume(resumeData._id);
          resumeData = reRes.data;
        } catch {}
      }

      setResume(resumeData);
      toast.success('Resume uploaded and analyzed!');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      fetchRecommendations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await getRecommendations();
      setRecommendations(res.data.recommendations || []);
    } catch {
      // No recommendations available yet
    } finally {
      setLoadingRecs(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  };

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>AI Resume Screening</h1>
        <p>Upload your resume and get instant AI-powered analysis and job recommendations</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section card">
        <h2><HiUpload size={22} /> Upload Resume</h2>
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            hidden
          />
          {file ? (
            <div className="file-info">
              <HiDocumentText size={40} />
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="drop-prompt">
              <HiUpload size={40} />
              <p>Drag & drop your resume here</p>
              <p className="drop-hint">or click to browse (PDF, DOC, DOCX)</p>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      </div>

      {/* Resume Score */}
      {resume && (
        <div className="results-section">
          <div className="card score-card">
            <h2><HiStar size={22} /> Resume Analysis</h2>
            <div className="score-display">
              <div className={`score-circle ${getScoreColor(resume.score)}`}>
                <span className="score-number">{resume.score}</span>
                <span className="score-label">/ 100</span>
              </div>
              <div className="score-details">
                <p className="score-status">
                  Status: <span className="badge">{resume.status}</span>
                </p>
                <p>File: {resume.fileName}</p>
              </div>
            </div>

            <ScoreBreakdown breakdown={resume.scoreBreakdown} />
            <AnalysisMetadata metadata={resume.analysisMetadata} />
            <CategorizedSkills
              categorizedSkills={resume.categorizedSkills}
              flatSkills={resume.skills}
            />
          </div>

          {/* Job Recommendations */}
          <div className="card recommendations-card">
            <h2><HiBriefcase size={22} /> Job Recommendations</h2>
            {loadingRecs ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : recommendations.length > 0 ? (
              <div className="rec-list">
                {recommendations.map((rec) => (
                  <div key={rec.job?._id} className="rec-item">
                    <div className="rec-header">
                      <h3>{rec.job?.title}</h3>
                      <span className={`match-badge ${getScoreColor(rec.matchPercentage)}`}>
                        {Math.round(rec.matchPercentage)}% Match
                      </span>
                    </div>
                    <p className="rec-company">
                      {rec.job?.company} — {rec.job?.location}
                    </p>
                    {rec.matchedSkills?.length > 0 && (
                      <div className="matched-skills">
                        {rec.matchedSkills.map((s) => (
                          <span key={s} className="skill-tag matched">
                            <HiCheckCircle size={14} /> {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No recommendations yet. Jobs need to be posted first to get matched.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
