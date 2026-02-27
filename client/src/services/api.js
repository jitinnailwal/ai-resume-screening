import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// User profile
export const updateName = (name) => api.put('/user/name', { name });
export const changePassword = (data) => api.put('/user/password', data);
export const updateTheme = (theme) => api.put('/user/theme', { theme });
export const updateProfile = (data) => api.put('/user/profile', data);
export const uploadAvatar = (formData) =>
  api.put('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Resumes
export const uploadResume = (formData) =>
  api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyResumes = () => api.get('/resumes');
export const getResume = (id) => api.get(`/resumes/${id}`);
export const deleteResume = (id) => api.delete(`/resumes/${id}`);
export const getRecommendations = () => api.get('/resumes/recommendations');
export const reanalyzeResume = (id) => api.post(`/resumes/${id}/reanalyze`);
export const reanalyzeAllResumes = () => api.post('/resumes/reanalyze-all');

// Jobs
export const getJobs = (params) => api.get('/jobs', { params });
export const getJob = (id) => api.get(`/jobs/${id}`);
export const applyJob = (id) => api.post(`/jobs/${id}/apply`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard');
export const getStats = () => api.get('/analytics/stats');

// Employer
export const getEmployerDashboard = () => api.get('/employer/dashboard');
export const getEmployerJobs = () => api.get('/employer/jobs');
export const getApplicants = (jobId) => api.get(`/employer/jobs/${jobId}/applicants`);
export const updateApplicantStatus = (jobId, applicantId, status) =>
  api.put(`/employer/jobs/${jobId}/applicants/${applicantId}`, { status });
export const getApplicantResume = (userId) => api.get(`/employer/applicant/${userId}/resume`);

export default api;
