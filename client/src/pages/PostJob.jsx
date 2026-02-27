import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, updateJob, getJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiBriefcase } from 'react-icons/hi';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    type: 'full-time',
    mode: 'remote',
    description: '',
    requirements: '',
    skills: '',
    salaryMin: '',
    salaryMax: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    getJob(jobId)
      .then((res) => {
        const job = res.data;
        setForm({
          title: job.title || '',
          company: job.company || '',
          location: job.location || '',
          type: job.type || 'full-time',
          mode: job.mode || 'remote',
          description: job.description || '',
          requirements: (job.requirements || []).join('\n'),
          skills: (job.skills || []).join(', '),
          salaryMin: job.salary?.min || '',
          salaryMax: job.salary?.max || '',
        });
      })
      .catch(() => toast.error('Failed to load job details'))
      .finally(() => setFetching(false));
  }, [jobId]);

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
  const jobModes = ['remote', 'hybrid', 'on-site'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location || !form.description) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const data = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        mode: form.mode,
        description: form.description,
        requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (form.salaryMin || form.salaryMax) {
        data.salary = {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: 'INR',
        };
      }
      if (isEdit) {
        await updateJob(jobId, data);
        toast.success('Job updated successfully!');
      } else {
        await createJob(data);
        toast.success('Job posted successfully!');
      }
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="post-job-page">
      <div className="page-header">
        <h1><HiBriefcase size={24} /> {isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        <p>{isEdit ? 'Update your job listing details' : 'Fill in the details to create a new job listing'}</p>
      </div>

      <form onSubmit={handleSubmit} className="card post-job-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior React Developer"
              required
            />
          </div>

          <div className="form-group">
            <label>Company *</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company name"
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. New York, NY or Remote"
              required
            />
          </div>

          <div className="form-group">
            <label>Job Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              {jobTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Job Mode</label>
            <select name="mode" value={form.mode} onChange={handleChange}>
              {jobModes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Salary Min</label>
            <input
              name="salaryMin"
              type="number"
              value={form.salaryMin}
              onChange={handleChange}
              placeholder="e.g. 50000"
            />
          </div>

          <div className="form-group">
            <label>Salary Max</label>
            <input
              name="salaryMax"
              type="number"
              value={form.salaryMax}
              onChange={handleChange}
              placeholder="e.g. 100000"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the role and responsibilities..."
            rows={5}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Requirements (one per line)</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            placeholder="3+ years of experience in React&#10;Strong understanding of REST APIs&#10;..."
            rows={4}
          />
        </div>

        <div className="form-group full-width">
          <label>Skills (comma-separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React, Node.js, TypeScript, MongoDB..."
          />
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Job' : 'Post Job')}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
