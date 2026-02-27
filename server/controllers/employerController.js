const Job = require("../models/Job");
const Resume = require("../models/Resume");
const User = require("../models/User");

// @desc    Get all jobs posted by the employer
// @route   GET /api/employer/jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

    // Add applicant count to each job
    const jobsWithCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: job.applicants.length,
      pendingCount: job.applicants.filter((a) => a.status === "pending").length,
    }));

    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/employer/jobs/:jobId/applicants
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      postedBy: req.user._id,
    }).populate("applicants.user", "name email avatar skills bio");

    if (!job) {
      return res.status(404).json({ message: "Job not found or not authorized" });
    }

    // Get latest resume for each applicant
    const applicantsWithResumes = await Promise.all(
      job.applicants.map(async (applicant) => {
        const resume = await Resume.findOne({
          user: applicant.user._id,
          status: "analyzed",
        })
          .sort({ createdAt: -1 })
          .select("fileName score skills status createdAt");

        return {
          _id: applicant._id,
          user: applicant.user,
          status: applicant.status,
          appliedAt: applicant.appliedAt,
          resume: resume || null,
        };
      })
    );

    res.json({
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
      },
      applicants: applicantsWithResumes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Accept or reject an applicant
// @route   PUT /api/employer/jobs/:jobId/applicants/:applicantId
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
    }

    const job = await Job.findOne({
      _id: req.params.jobId,
      postedBy: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or not authorized" });
    }

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    applicant.status = status;
    await job.save();

    res.json({ message: `Applicant ${status}`, status: applicant.status });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    View an applicant's resume
// @route   GET /api/employer/applicant/:userId/resume
exports.getApplicantResume = async (req, res) => {
  try {
    // Verify the employer has a job this user applied to
    const hasApplicant = await Job.findOne({
      postedBy: req.user._id,
      "applicants.user": req.params.userId,
    });

    if (!hasApplicant) {
      return res.status(403).json({ message: "Not authorized to view this resume" });
    }

    const resumes = await Resume.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .select("fileName score skills status parsedText createdAt");

    const user = await User.findById(req.params.userId).select("name email avatar skills bio");

    res.json({ user, resumes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Employer dashboard stats
// @route   GET /api/employer/dashboard
exports.getEmployerDashboard = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.isActive).length;
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
    const pendingApplicants = jobs.reduce(
      (sum, j) => sum + j.applicants.filter((a) => a.status === "pending").length,
      0
    );
    const acceptedApplicants = jobs.reduce(
      (sum, j) => sum + j.applicants.filter((a) => a.status === "accepted").length,
      0
    );

    // Recent applicants across all jobs
    const allApplicants = [];
    for (const job of jobs) {
      for (const app of job.applicants) {
        allApplicants.push({ ...app.toObject(), jobTitle: job.title, jobId: job._id });
      }
    }
    allApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    const recentApplicants = allApplicants.slice(0, 10);

    // Populate user info for recent applicants
    const populated = await Promise.all(
      recentApplicants.map(async (app) => {
        const user = await User.findById(app.user).select("name email avatar");
        return { ...app, user };
      })
    );

    res.json({
      totalJobs,
      activeJobs,
      totalApplicants,
      pendingApplicants,
      acceptedApplicants,
      recentApplicants: populated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
