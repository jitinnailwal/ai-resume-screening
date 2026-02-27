const Resume = require("../models/Resume");
const Job = require("../models/Job");
const User = require("../models/User");

// @desc    Get dashboard analytics for the logged-in user
// @route   GET /api/analytics/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's resumes
    const resumes = await Resume.find({ user: userId });
    const totalResumes = resumes.length;
    const analyzedResumes = resumes.filter((r) => r.status === "analyzed").length;

    // Average resume score
    const scores = resumes.filter((r) => r.score > 0).map((r) => r.score);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Get all skills from user's resumes
    const allSkills = resumes.flatMap((r) => r.skills);
    const skillFrequency = {};
    allSkills.forEach((skill) => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Jobs the user has applied to
    const appliedJobs = await Job.countDocuments({ "applicants.user": userId });

    // Total active jobs available
    const totalJobs = await Job.countDocuments({ isActive: true });

    // Recent resumes
    const recentResumes = await Resume.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fileName score status createdAt scoreBreakdown");

    res.json({
      totalResumes,
      analyzedResumes,
      avgScore,
      topSkills,
      appliedJobs,
      totalJobs,
      recentResumes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get overall platform stats (public)
// @route   GET /api/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalResumes = await Resume.countDocuments();

    res.json({ totalUsers, totalJobs, totalResumes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
