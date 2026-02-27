import { useState, useEffect } from 'react';
import { getJobs, applyJob } from '../services/api';
import toast from 'react-hot-toast';
import { HiSearch, HiFilter, HiBriefcase, HiLocationMarker, HiCurrencyRupee, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const formatINR = (salary) => {
  if (!salary?.min && !salary?.max) return null;
  const fmt = (n) => n?.toLocaleString('en-IN');
  if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)}`;
  if (salary.min) return `₹${fmt(salary.min)}+`;
  return `Up to ₹${fmt(salary.max)}`;
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(null);

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await getJobs(params);
      setJobs(res.data.jobs || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await applyJob(jobId);
      toast.success('Application submitted!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };


  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1>Job Listings</h1>
        <p>Browse and apply to available positions</p>
      </div>

      {/* Search & Filter */}
      <div className="card search-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group">
            <HiSearch className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Search jobs by title, skills, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div className="filter-row">
          <HiFilter size={16} />
          <button
            className={`filter-chip ${!typeFilter ? 'active' : ''}`}
            onClick={() => { setTypeFilter(''); setPage(1); }}
          >
            All
          </button>
          {jobTypes.map((type) => (
            <button
              key={type}
              className={`filter-chip ${typeFilter === type ? 'active' : ''}`}
              onClick={() => { setTypeFilter(type); setPage(1); }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="loading-inline"><div className="spinner" /></div>
      ) : jobs.length > 0 ? (
        <>
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job._id} className="card job-card">
                <div className="job-main">
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                    <div className="job-meta">
                      <span><HiLocationMarker size={14} /> {job.location}</span>
                      {job.type && <span className="badge">{job.type}</span>}
                      {job.mode && <span className="badge">{job.mode}</span>}
                      {formatINR(job.salary) && (
                        <span><HiCurrencyRupee size={14} /> {formatINR(job.salary)}</span>
                      )}
                    </div>
                    {job.skills?.length > 0 && (
                      <div className="skill-tags">
                        {job.skills.slice(0, 5).map((s) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                        {job.skills.length > 5 && <span className="skill-tag more">+{job.skills.length - 5}</span>}
                      </div>
                    )}
                  </div>
                  <div className="job-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}
                    >
                      {selectedJob?._id === job._id ? 'Less' : 'Details'}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApply(job._id)}
                      disabled={applying === job._id}
                    >
                      {applying === job._id ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </div>
                {selectedJob?._id === job._id && (
                  <div className="job-detail">
                    <div className="job-detail-divider" />
                    <div className="job-description">
                      <h4>Description</h4>
                      <p>{job.description}</p>
                    </div>
                    {job.requirements?.length > 0 && (
                      <div className="job-requirements">
                        <h4>Requirements</h4>
                        <ul>
                          {job.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {job.skills?.length > 0 && (
                      <div className="job-all-skills">
                        <h4>Skills</h4>
                        <div className="skill-tags">
                          {job.skills.map((s) => (
                            <span key={s} className="skill-tag">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <HiChevronLeft size={16} /> Prev
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <HiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card empty-state">
          <HiBriefcase size={48} />
          <p>No jobs found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
