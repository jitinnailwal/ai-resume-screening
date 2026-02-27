const Resume = require("../models/Resume");
const Job = require("../models/Job");
const fs = require("fs");
const path = require("path");
const { parsePDF, extractSkills, calculateATSScore, matchResumeToJob } = require("../utils/resumeParser");

// Helper: get absolute path to a resume file
function getResumePath(filename) {
  return path.resolve(path.join(__dirname, "..", "uploads", "resumes", filename));
}

// Helper: analyze a resume file and return full ATS analysis
async function analyzeResume(filePath) {
  console.log("[ANALYZE] Parsing file:", filePath);
  console.log("[ANALYZE] File exists:", fs.existsSync(filePath));

  const parsedText = await parsePDF(filePath);
  console.log("[ANALYZE] Parsed text length:", parsedText ? parsedText.length : 0);

  if (!parsedText || parsedText.trim().length === 0) {
    console.log("[ANALYZE] No text extracted");
    return null;
  }

  const atsResult = calculateATSScore(parsedText);
  console.log("[ANALYZE] Skills:", atsResult.skills.length, "Score:", atsResult.score);

  return {
    parsedText,
    skills: atsResult.skills,
    categorizedSkills: atsResult.categorized,
    score: atsResult.score,
    scoreBreakdown: atsResult.breakdown,
    analysisMetadata: atsResult.metadata,
  };
}

// @desc    Upload a resume
// @route   POST /api/resumes/upload
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume file (PDF or DOC)" });
    }

    console.log("[UPLOAD] File received:", req.file.originalname, "->", req.file.filename);

    // Create resume record
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.filename,
    });

    // Parse PDF
    if (req.file.originalname.toLowerCase().endsWith(".pdf")) {
      const fullPath = getResumePath(req.file.filename);

      try {
        const result = await analyzeResume(fullPath);
        if (result) {
          resume.parsedText = result.parsedText;
          resume.skills = result.skills;
          resume.categorizedSkills = result.categorizedSkills;
          resume.score = result.score;
          resume.scoreBreakdown = result.scoreBreakdown;
          resume.analysisMetadata = result.analysisMetadata;
          resume.status = "analyzed";
        } else {
          resume.status = "parsed";
        }
        await resume.save();
        console.log("[UPLOAD] Saved resume with score:", resume.score, "status:", resume.status);
      } catch (parseErr) {
        console.error("[UPLOAD] Parse error:", parseErr.message);
        console.error("[UPLOAD] Stack:", parseErr.stack);
        resume.status = "parsed";
        await resume.save();
      }
    }

    // Re-fetch from DB to ensure response has all updated fields
    const updatedResume = await Resume.findById(resume._id);
    console.log("[UPLOAD] Returning resume - score:", updatedResume.score, "status:", updatedResume.status);
    res.status(201).json(updatedResume);
  } catch (error) {
    console.error("[UPLOAD] Server error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Re-analyze a single resume
// @route   POST /api/resumes/:id/reanalyze
exports.reanalyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!resume.fileName.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({ message: "Only PDF files can be analyzed" });
    }

    const fullPath = getResumePath(resume.filePath);
    console.log("[REANALYZE] File:", fullPath, "exists:", fs.existsSync(fullPath));

    const result = await analyzeResume(fullPath);
    if (result) {
      resume.parsedText = result.parsedText;
      resume.skills = result.skills;
      resume.categorizedSkills = result.categorizedSkills;
      resume.score = result.score;
      resume.scoreBreakdown = result.scoreBreakdown;
      resume.analysisMetadata = result.analysisMetadata;
      resume.status = "analyzed";
      await resume.save();
      console.log("[REANALYZE] Updated score:", resume.score);
    } else {
      return res.status(400).json({ message: "Could not extract text from PDF" });
    }

    res.json(resume);
  } catch (error) {
    console.error("[REANALYZE] Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Re-analyze ALL resumes for current user
// @route   POST /api/resumes/reanalyze-all
exports.reanalyzeAll = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id });
    let updated = 0;

    for (const resume of resumes) {
      if (!resume.fileName.toLowerCase().endsWith(".pdf")) continue;
      const fullPath = getResumePath(resume.filePath);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const result = await analyzeResume(fullPath);
        if (result) {
          resume.parsedText = result.parsedText;
          resume.skills = result.skills;
          resume.categorizedSkills = result.categorizedSkills;
          resume.score = result.score;
          resume.scoreBreakdown = result.scoreBreakdown;
          resume.analysisMetadata = result.analysisMetadata;
          resume.status = "analyzed";
          await resume.save();
          updated++;
        }
      } catch (err) {
        console.error("[REANALYZE-ALL] Failed for", resume.fileName, err.message);
      }
    }

    const fresh = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ message: `Re-analyzed ${updated} of ${resumes.length} resumes`, resumes: fresh });
  } catch (error) {
    console.error("[REANALYZE-ALL] Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all resumes for current user
// @route   GET /api/resumes
exports.getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Delete file from disk
    const filePath = getResumePath(resume.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.deleteOne({ _id: resume._id });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get recommended jobs based on latest resume
// @route   GET /api/resumes/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    // Get the user's most recent analyzed resume
    const resume = await Resume.findOne({
      user: req.user._id,
      status: "analyzed",
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        message: "No analyzed resume found. Upload a resume first to get recommendations.",
      });
    }

    // Find jobs that match resume skills
    const jobs = await Job.find({ isActive: true });

    const recommendations = jobs
      .map((job) => {
        const matchPercentage = matchResumeToJob(resume.skills, job.skills);
        return {
          job: {
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            salary: job.salary,
            skills: job.skills,
          },
          matchPercentage,
          matchedSkills: resume.skills.filter((s) =>
            job.skills.map((js) => js.toLowerCase()).includes(s.toLowerCase())
          ),
        };
      })
      .filter((r) => r.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      resumeSkills: resume.skills,
      resumeScore: resume.score,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
