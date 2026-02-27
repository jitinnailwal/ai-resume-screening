const express = require("express");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
  getApplicantResume,
  getEmployerDashboard,
} = require("../controllers/employerController");

const router = express.Router();

// All employer routes require auth + employer role
router.use(protect);
router.use(requireRole("employer"));

router.get("/dashboard", getEmployerDashboard);
router.get("/jobs", getMyJobs);
router.get("/jobs/:jobId/applicants", getApplicants);
router.put("/jobs/:jobId/applicants/:applicantId", updateApplicationStatus);
router.get("/applicant/:userId/resume", getApplicantResume);

module.exports = router;
