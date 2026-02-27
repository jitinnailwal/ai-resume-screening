const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyJob,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getJob);

// Protected routes
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyJob);

module.exports = router;
