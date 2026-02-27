const fs = require("fs");
const path = require("path");

// ============================================
// SKILLS DATABASE — ~150 skills with aliases
// ============================================
const SKILLS_DATABASE = {
  "Programming Languages": {
    javascript: ["js", "es6", "es2015", "ecmascript"],
    typescript: ["ts"],
    python: ["py", "python3"],
    java: [],
    "c++": ["cpp", "cplusplus"],
    "c#": ["csharp", "c sharp"],
    ruby: ["rb"],
    php: [],
    swift: [],
    kotlin: ["kt"],
    go: ["golang"],
    rust: [],
    scala: [],
    r: [],
    matlab: [],
    perl: [],
    haskell: [],
    lua: [],
    dart: [],
    elixir: [],
    clojure: [],
    "objective-c": ["objc"],
    assembly: ["asm"],
    shell: ["bash", "zsh", "sh"],
  },
  "Frontend Frameworks": {
    react: ["reactjs", "react.js"],
    angular: ["angularjs", "angular.js"],
    vue: ["vuejs", "vue.js"],
    svelte: ["sveltejs"],
    "next.js": ["nextjs", "next"],
    "nuxt.js": ["nuxtjs", "nuxt"],
    gatsby: [],
    ember: ["emberjs"],
    backbone: ["backbonejs"],
  },
  "Backend Frameworks": {
    "node.js": ["nodejs", "node"],
    express: ["expressjs", "express.js"],
    django: [],
    flask: [],
    "spring boot": ["spring", "springboot"],
    "ruby on rails": ["rails", "ror"],
    laravel: [],
    fastapi: [],
    nestjs: ["nest.js"],
    koa: [],
    "asp.net": ["aspnet", "dotnet", ".net"],
  },
  "Web Technologies": {
    html: ["html5"],
    css: ["css3"],
    sass: ["scss"],
    less: [],
    tailwind: ["tailwindcss"],
    bootstrap: [],
    jquery: [],
    webpack: [],
    vite: [],
    babel: [],
    "rest api": ["restful", "rest"],
    graphql: ["gql"],
    websocket: ["websockets", "ws"],
  },
  Databases: {
    mongodb: ["mongo"],
    postgresql: ["postgres", "psql"],
    mysql: [],
    sqlite: [],
    redis: [],
    firebase: ["firestore"],
    elasticsearch: ["elastic"],
    cassandra: [],
    dynamodb: [],
    "oracle db": ["oracle"],
    "sql server": ["mssql"],
    neo4j: [],
    couchdb: [],
  },
  "Cloud & DevOps": {
    aws: ["amazon web services"],
    azure: ["microsoft azure"],
    gcp: ["google cloud", "google cloud platform"],
    docker: [],
    kubernetes: ["k8s"],
    terraform: [],
    ansible: [],
    jenkins: [],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
    github: ["github actions"],
    gitlab: ["gitlab ci"],
    nginx: [],
    apache: [],
    heroku: [],
    vercel: [],
    netlify: [],
  },
  "Data & ML": {
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    tensorflow: ["tf"],
    pytorch: ["torch"],
    nlp: ["natural language processing"],
    "computer vision": ["cv", "opencv"],
    "data analysis": ["data analytics"],
    "data science": [],
    pandas: [],
    numpy: [],
    scikit: ["sklearn", "scikit-learn"],
    keras: [],
    spark: ["apache spark", "pyspark"],
    hadoop: [],
    tableau: [],
    "power bi": ["powerbi"],
    excel: [],
    sql: [],
  },
  "Tools & Practices": {
    git: [],
    agile: [],
    scrum: [],
    jira: [],
    confluence: [],
    figma: [],
    photoshop: [],
    illustrator: [],
    "ui/ux": ["ux", "ui design", "ux design"],
    wireframing: [],
    linux: ["unix"],
    networking: [],
    cybersecurity: ["security"],
    microservices: [],
    serverless: [],
    "design patterns": [],
    "unit testing": ["jest", "mocha", "pytest"],
    selenium: [],
    cypress: [],
  },
  Mobile: {
    "react native": [],
    flutter: [],
    "ios development": ["ios"],
    "android development": ["android"],
    xamarin: [],
    ionic: [],
    "swift ui": ["swiftui"],
  },
};

// Build fast alias-to-canonical lookup
function buildSkillsLookup() {
  const lookup = new Map();
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    for (const [canonical, aliases] of Object.entries(skills)) {
      lookup.set(canonical.toLowerCase(), { canonical, category });
      for (const alias of aliases) {
        lookup.set(alias.toLowerCase(), { canonical, category });
      }
    }
  }
  return lookup;
}

const SKILLS_LOOKUP = buildSkillsLookup();

// Short terms that need word-boundary matching to avoid false positives
const SHORT_TERMS = new Set(["r", "go", "js", "ts", "py", "rb", "kt", "sh", "dl", "ml", "cv", "ws", "tf", "ux", "ui", "sql", "css", "asm", "ios"]);

/**
 * Parse PDF file and extract text (pdf-parse v2 API)
 */
async function parsePDF(filePath) {
  console.log("[parsePDF] Input path:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("[parsePDF] File does not exist:", filePath);
    return null;
  }

  try {
    const { PDFParse } = require("pdf-parse");
    const fileBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(fileBuffer);
    console.log("[parsePDF] File read, buffer size:", uint8Array.length);

    const parser = new PDFParse({ data: uint8Array });
    await parser.load();
    const result = await parser.getText();

    let text = "";
    if (result && result.pages && result.pages.length > 0) {
      text = result.pages.map((p) => p.text || "").join("\n");
    }

    parser.destroy();
    console.log("[parsePDF] Extracted text length:", text.length);

    if (text.trim().length > 0) return text;
    return null;
  } catch (error) {
    console.error("[parsePDF] Error:", error.message);
    console.error("[parsePDF] Stack:", error.stack);

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      if (readable.length > 50) {
        console.log("[parsePDF] Fallback text extraction, length:", readable.length);
        return readable;
      }
    } catch (e) { /* ignore */ }
    return null;
  }
}

/**
 * Extract skills with categorization
 * Returns { skills: string[], categorized: { [category]: string[] } }
 */
function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const found = new Set();
  const categorized = {};

  for (const [term, { canonical, category }] of SKILLS_LOOKUP.entries()) {
    if (found.has(canonical)) continue;

    let matched = false;
    if (SHORT_TERMS.has(term) || term.length <= 2) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      matched = regex.test(lowerText);
    } else {
      matched = lowerText.includes(term);
    }

    if (matched) {
      found.add(canonical);
      if (!categorized[category]) categorized[category] = [];
      if (!categorized[category].includes(canonical)) {
        categorized[category].push(canonical);
      }
    }
  }

  return { skills: [...found], categorized };
}

// ============================================
// SECTION DETECTION
// ============================================
const SECTION_PATTERNS = {
  summary: /\b(summary|objective|profile|about\s*me|professional\s*summary|career\s*objective)\b/i,
  experience: /\b(experience|work\s*history|employment|professional\s*experience|work\s*experience)\b/i,
  education: /\b(education|academic|qualification|degree|university|college)\b/i,
  skills: /\b(skills|technical\s*skills|core\s*competencies|technologies|proficiencies)\b/i,
  contact: /\b(contact|email|phone|address|personal\s*information|personal\s*details)\b/i,
  certifications: /\b(certification|certificate|licensed|accreditation|credentials)\b/i,
  projects: /\b(projects|portfolio|personal\s*projects|academic\s*projects|key\s*projects)\b/i,
};

function detectSections(text) {
  const detected = [];
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(text)) {
      detected.push(section);
    }
  }
  return detected;
}

// ============================================
// EXPERIENCE ANALYSIS
// ============================================
const ACTION_VERBS = [
  "achieved", "administered", "analyzed", "architected", "automated",
  "built", "collaborated", "configured", "created", "debugged",
  "delivered", "deployed", "designed", "developed", "directed",
  "engineered", "enhanced", "established", "executed", "expanded",
  "facilitated", "generated", "implemented", "improved", "increased",
  "initiated", "integrated", "launched", "led", "maintained",
  "managed", "mentored", "migrated", "monitored", "negotiated",
  "operated", "optimized", "orchestrated", "organized", "oversaw",
  "performed", "planned", "presented", "published", "redesigned",
  "reduced", "refactored", "resolved", "reviewed", "scaled",
  "shipped", "simplified", "spearheaded", "streamlined", "supervised",
  "tested", "trained", "transformed", "troubleshot", "upgraded",
];

function analyzeExperience(text) {
  const lowerText = text.toLowerCase();

  // Action verbs found
  const foundVerbs = ACTION_VERBS.filter((v) => lowerText.includes(v));

  // Quantified achievements (numbers with %, $, x, etc.)
  const quantifiedMatches = text.match(/\d+[\s]*[%$x×]|\$[\s]*[\d,]+|[\d,]+\s*(users|customers|clients|projects|teams|members|employees|applications|servers|requests|transactions)/gi) || [];

  // Years of experience mentions
  const yearMatches = text.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi) || [];
  let yearsOfExperience = 0;
  for (const match of yearMatches) {
    const num = parseInt(match.match(/\d+/)?.[0] || "0", 10);
    if (num > yearsOfExperience) yearsOfExperience = num;
  }

  // Bullet points (lines starting with •, -, *, or numbers)
  const lines = text.split(/\n/);
  const bulletPoints = lines.filter((l) => /^\s*[•\-\*▪▸►◆⦁]\s|^\s*\d+[.)]\s/.test(l)).length;

  return {
    actionVerbCount: foundVerbs.length,
    actionVerbs: foundVerbs.slice(0, 15),
    quantifiedAchievements: quantifiedMatches.length,
    yearsOfExperience,
    bulletPoints,
  };
}

// ============================================
// EDUCATION ANALYSIS
// ============================================
const DEGREE_LEVELS = {
  phd: { level: 5, label: "PhD / Doctorate" },
  doctorate: { level: 5, label: "PhD / Doctorate" },
  "ph.d": { level: 5, label: "PhD / Doctorate" },
  master: { level: 4, label: "Master's Degree" },
  "m.tech": { level: 4, label: "Master's Degree" },
  "m.s": { level: 4, label: "Master's Degree" },
  "m.sc": { level: 4, label: "Master's Degree" },
  msc: { level: 4, label: "Master's Degree" },
  mba: { level: 4, label: "MBA" },
  "m.e": { level: 4, label: "Master's Degree" },
  bachelor: { level: 3, label: "Bachelor's Degree" },
  "b.tech": { level: 3, label: "Bachelor's Degree" },
  "b.s": { level: 3, label: "Bachelor's Degree" },
  "b.sc": { level: 3, label: "Bachelor's Degree" },
  bsc: { level: 3, label: "Bachelor's Degree" },
  "b.e": { level: 3, label: "Bachelor's Degree" },
  bca: { level: 3, label: "Bachelor's Degree" },
  bba: { level: 3, label: "Bachelor's Degree" },
  diploma: { level: 2, label: "Diploma" },
  associate: { level: 2, label: "Associate Degree" },
  certificate: { level: 1, label: "Certificate" },
};

const RELEVANT_FIELDS = [
  "computer science", "software engineering", "information technology",
  "data science", "artificial intelligence", "machine learning",
  "electrical engineering", "electronics", "mathematics",
  "statistics", "physics", "information systems",
  "cybersecurity", "network engineering", "web development",
];

function analyzeEducation(text) {
  const lowerText = text.toLowerCase();

  // Highest degree
  let highestLevel = 0;
  let highestDegree = "Not detected";
  for (const [keyword, { level, label }] of Object.entries(DEGREE_LEVELS)) {
    const regex = new RegExp(`\\b${keyword.replace(/\./g, "\\.")}\\b`, "i");
    if (regex.test(lowerText) && level > highestLevel) {
      highestLevel = level;
      highestDegree = label;
    }
  }

  // Relevant field
  const hasRelevantField = RELEVANT_FIELDS.some((field) => lowerText.includes(field));

  // Certifications count
  const certPatterns = /\b(certified|certification|certificate|aws certified|google certified|azure certified|pmp|cissp|ccna|ccnp|cka|ckad|comptia|scrum master|csm|togaf)\b/gi;
  const certMatches = lowerText.match(certPatterns) || [];
  const certCount = new Set(certMatches.map((c) => c.toLowerCase())).size;

  return {
    highestDegree,
    degreeLevel: highestLevel,
    hasRelevantField,
    certificationCount: certCount,
  };
}

// ============================================
// CONTACT ANALYSIS
// ============================================
function analyzeContact(text) {
  const hasEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/.test(text);
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);
  const hasGitHub = /github\.com|github/i.test(text);
  const hasPortfolio = /portfolio|personal\s*website|\.dev|\.io|\.me/i.test(text);

  return { hasEmail, hasPhone, hasLinkedIn, hasGitHub, hasPortfolio };
}

// ============================================
// KEYWORD DENSITY / RELEVANCE
// ============================================
const INDUSTRY_KEYWORDS = [
  "agile", "scrum", "kanban", "devops", "full stack", "fullstack",
  "frontend", "backend", "api", "database", "cloud", "saas",
  "microservices", "distributed", "scalable", "architecture",
  "product", "startup", "enterprise", "performance", "security",
  "testing", "automation", "deployment", "monitoring", "analytics",
  "leadership", "communication", "teamwork", "problem solving",
  "critical thinking", "time management", "collaboration",
];

function analyzeKeywordDensity(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).length;

  const foundKeywords = INDUSTRY_KEYWORDS.filter((kw) => lowerText.includes(kw));

  // Keyword stuffing detection: if any single skill/keyword appears too many times
  let stuffingPenalty = false;
  const wordFreq = {};
  lowerText.split(/\s+/).forEach((w) => {
    if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const maxRepeat = Math.max(0, ...Object.values(wordFreq));
  // If a word appears more than 2% of total words, flag stuffing
  if (words > 100 && maxRepeat > words * 0.02 && maxRepeat > 10) {
    stuffingPenalty = true;
  }

  return {
    industryKeywordsFound: foundKeywords.length,
    totalKeywordsChecked: INDUSTRY_KEYWORDS.length,
    stuffingPenalty,
  };
}

// ============================================
// FORMATTING & STRUCTURE
// ============================================
function analyzeFormatting(text, sections) {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  const bulletPoints = text.split(/\n/).filter((l) => /^\s*[•\-\*▪▸►◆⦁]\s|^\s*\d+[.)]\s/.test(l)).length;

  return {
    totalWords: words,
    totalLines: lines.length,
    sectionCount: sections.length,
    bulletPoints,
  };
}

// ============================================
// ACHIEVEMENTS & IMPACT
// ============================================
const LEADERSHIP_INDICATORS = [
  "led", "managed", "directed", "supervised", "mentored",
  "spearheaded", "oversaw", "coordinated", "founded",
  "co-founded", "head of", "team lead", "tech lead",
  "principal", "senior", "staff", "chief", "vp",
];

function analyzeAchievements(text) {
  const lowerText = text.toLowerCase();

  // Quantified results
  const quantifiedResults = (text.match(/\d+[\s]*[%$x×]|\$[\s]*[\d,]+|\b\d{2,}\b.*\b(increase|decrease|improve|reduce|save|grow|revenue|users|clients)/gi) || []).length;

  // Leadership indicators
  const leadershipFound = LEADERSHIP_INDICATORS.filter((l) => lowerText.includes(l)).length;

  // Project quality signals
  const projectSignals = (lowerText.match(/\b(open source|production|deployed|launched|published|patent|award|recognition|first place|winner|hackathon)\b/g) || []).length;

  return {
    quantifiedResults,
    leadershipIndicators: leadershipFound,
    projectSignals,
  };
}

// ============================================
// MAIN ATS SCORE CALCULATOR
// ============================================
function calculateATSScore(text) {
  const sections = detectSections(text);
  const { skills, categorized } = extractSkills(text);
  const experience = analyzeExperience(text);
  const education = analyzeEducation(text);
  const contact = analyzeContact(text);
  const keywords = analyzeKeywordDensity(text);
  const formatting = analyzeFormatting(text, sections);
  const achievements = analyzeAchievements(text);

  // 1. Section Detection (max 10)
  const sectionScore = Math.min(Math.round((sections.length / 5) * 10), 10);

  // 2. Skills Matching (max 25)
  const skillScore = Math.min(Math.round((skills.length / 12) * 25), 25);

  // 3. Experience Quality (max 20)
  let expScore = 0;
  expScore += Math.min(experience.actionVerbCount, 10); // up to 10 for verbs
  expScore += Math.min(experience.quantifiedAchievements * 2, 4); // up to 4
  expScore += Math.min(experience.yearsOfExperience, 3); // up to 3
  expScore += Math.min(Math.floor(experience.bulletPoints / 3), 3); // up to 3
  expScore = Math.min(expScore, 20);

  // 4. Education (max 10)
  let eduScore = 0;
  eduScore += Math.min(education.degreeLevel * 2, 6); // up to 6
  if (education.hasRelevantField) eduScore += 2;
  eduScore += Math.min(education.certificationCount, 2); // up to 2
  eduScore = Math.min(eduScore, 10);

  // 5. Formatting & Structure (max 10)
  let fmtScore = 0;
  if (formatting.totalWords >= 200) fmtScore += 2;
  if (formatting.totalWords >= 400) fmtScore += 1;
  if (formatting.totalWords >= 600) fmtScore += 1;
  fmtScore += Math.min(formatting.sectionCount, 4); // up to 4
  if (formatting.bulletPoints >= 5) fmtScore += 1;
  if (formatting.bulletPoints >= 10) fmtScore += 1;
  fmtScore = Math.min(fmtScore, 10);

  // 6. Contact Information (max 5)
  let contactScore = 0;
  if (contact.hasEmail) contactScore += 2;
  if (contact.hasPhone) contactScore += 1;
  if (contact.hasLinkedIn) contactScore += 1;
  if (contact.hasGitHub || contact.hasPortfolio) contactScore += 1;
  contactScore = Math.min(contactScore, 5);

  // 7. Keyword Relevance (max 10)
  let kwScore = Math.min(Math.round((keywords.industryKeywordsFound / 8) * 10), 10);
  if (keywords.stuffingPenalty) kwScore = Math.max(kwScore - 3, 0);

  // 8. Achievements & Impact (max 10)
  let achScore = 0;
  achScore += Math.min(achievements.quantifiedResults * 2, 4);
  achScore += Math.min(achievements.leadershipIndicators, 3);
  achScore += Math.min(achievements.projectSignals * 2, 3);
  achScore = Math.min(achScore, 10);

  const totalScore = sectionScore + skillScore + expScore + eduScore + fmtScore + contactScore + kwScore + achScore;

  return {
    score: Math.min(totalScore, 100),
    breakdown: {
      sectionDetection: { score: sectionScore, max: 10 },
      skillsMatching: { score: skillScore, max: 25 },
      experienceQuality: { score: expScore, max: 20 },
      education: { score: eduScore, max: 10 },
      formattingStructure: { score: fmtScore, max: 10 },
      contactInformation: { score: contactScore, max: 5 },
      keywordRelevance: { score: kwScore, max: 10 },
      achievementsImpact: { score: achScore, max: 10 },
    },
    metadata: {
      detectedSections: sections,
      yearsOfExperience: experience.yearsOfExperience,
      highestDegree: education.highestDegree,
      totalWords: formatting.totalWords,
      totalLines: formatting.totalLines,
      bulletPoints: formatting.bulletPoints,
      actionVerbCount: experience.actionVerbCount,
      quantifiedAchievements: experience.quantifiedAchievements,
      certificationCount: education.certificationCount,
      hasEmail: contact.hasEmail,
      hasPhone: contact.hasPhone,
      hasLinkedIn: contact.hasLinkedIn,
      hasGitHub: contact.hasGitHub,
      hasPortfolio: contact.hasPortfolio,
      industryKeywordsFound: keywords.industryKeywordsFound,
      stuffingPenalty: keywords.stuffingPenalty,
      leadershipIndicators: achievements.leadershipIndicators,
    },
    skills,
    categorized,
  };
}

/**
 * Backward-compatible score wrapper
 */
function calculateScore(parsedText, skills) {
  const result = calculateATSScore(parsedText);
  return result.score;
}

/**
 * Match resume skills against job requirements
 */
function matchResumeToJob(resumeSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const matched = jobSkills.filter((s) => resumeSet.has(s.toLowerCase()));
  return Math.round((matched.length / jobSkills.length) * 100);
}

module.exports = { parsePDF, extractSkills, calculateScore, calculateATSScore, matchResumeToJob };
