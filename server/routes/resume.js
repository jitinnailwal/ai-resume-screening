const express = require("express");
const { protect } = require("../middleware/auth");
const { uploadResume } = require("../middleware/upload");
const {
  uploadResume: uploadResumeController,
  getMyResumes,
  getResume,
  deleteResume,
  getRecommendations,
  reanalyzeResume,
  reanalyzeAll,
} = require("../controllers/resumeController");

const router = express.Router();

// All resume routes require authentication
router.use(protect);

router.get("/recommendations", getRecommendations);
router.post("/reanalyze-all", reanalyzeAll);
router.post("/upload", uploadResume.single("resume"), uploadResumeController);
router.get("/", getMyResumes);
router.get("/:id", getResume);
router.post("/:id/reanalyze", reanalyzeResume);
router.delete("/:id", deleteResume);

module.exports = router;
