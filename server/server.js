const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const resumeRoutes = require("./routes/resume");
const jobRoutes = require("./routes/job");
const analyticsRoutes = require("./routes/analytics");
const employerRoutes = require("./routes/employer");

const app = express();

// Connect to MongoDB and migrate existing jobs
connectDB().then(async () => {
  try {
    const Job = require("./models/Job");
    const result = await Job.updateMany({ mode: { $exists: false } }, { $set: { mode: "remote" } });
    if (result.modifiedCount > 0) {
      console.log(`Migrated ${result.modifiedCount} existing jobs with mode: "remote"`);
    }
  } catch (err) {
    console.error("Migration error:", err.message);
  }
}).catch((err) => {
  console.error("DB connection failed:", err.message);
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://client-ai-resume-vercel.app",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/employer", employerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug: test PDF parsing directly (no auth needed)
app.get("/api/debug/test-parse", async (req, res) => {
  const fs = require("fs");
  const resumeDir = path.join(__dirname, "uploads", "resumes");
  try {
    const files = fs.readdirSync(resumeDir).filter((f) => f.endsWith(".pdf"));
    if (files.length === 0) return res.json({ error: "No PDF files found in uploads/resumes" });

    const testFile = path.resolve(path.join(resumeDir, files[0]));
    const { parsePDF, extractSkills, calculateScore } = require("./utils/resumeParser");
    const text = await parsePDF(testFile);
    if (!text) return res.json({ error: "parsePDF returned null", file: testFile, exists: fs.existsSync(testFile) });

    const skills = extractSkills(text);
    const score = calculateScore(text, skills);
    res.json({ file: files[0], textLength: text.length, textPreview: text.substring(0, 300), skills, score });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large" });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
});

// Only listen when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
