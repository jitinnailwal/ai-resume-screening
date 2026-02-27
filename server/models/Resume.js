const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    parsedText: {
      type: String,
      default: "",
    },
    skills: [String],
    categorizedSkills: {
      type: Map,
      of: [String],
      default: {},
    },
    experience: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      sectionDetection: { score: { type: Number, default: 0 }, max: { type: Number, default: 10 } },
      skillsMatching: { score: { type: Number, default: 0 }, max: { type: Number, default: 25 } },
      experienceQuality: { score: { type: Number, default: 0 }, max: { type: Number, default: 20 } },
      education: { score: { type: Number, default: 0 }, max: { type: Number, default: 10 } },
      formattingStructure: { score: { type: Number, default: 0 }, max: { type: Number, default: 10 } },
      contactInformation: { score: { type: Number, default: 0 }, max: { type: Number, default: 5 } },
      keywordRelevance: { score: { type: Number, default: 0 }, max: { type: Number, default: 10 } },
      achievementsImpact: { score: { type: Number, default: 0 }, max: { type: Number, default: 10 } },
    },
    analysisMetadata: {
      detectedSections: [String],
      yearsOfExperience: { type: Number, default: 0 },
      highestDegree: { type: String, default: "" },
      totalWords: { type: Number, default: 0 },
      totalLines: { type: Number, default: 0 },
      bulletPoints: { type: Number, default: 0 },
      actionVerbCount: { type: Number, default: 0 },
      quantifiedAchievements: { type: Number, default: 0 },
      certificationCount: { type: Number, default: 0 },
      hasEmail: { type: Boolean, default: false },
      hasPhone: { type: Boolean, default: false },
      hasLinkedIn: { type: Boolean, default: false },
      hasGitHub: { type: Boolean, default: false },
      hasPortfolio: { type: Boolean, default: false },
      industryKeywordsFound: { type: Number, default: 0 },
      stuffingPenalty: { type: Boolean, default: false },
      leadershipIndicators: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["uploaded", "parsed", "analyzed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
