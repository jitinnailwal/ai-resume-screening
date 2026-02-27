const mongoose = require("mongoose");
require("dotenv").config();
const Job = require("./models/Job");
const User = require("./models/User");

const sampleJobs = [
  {
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Bangalore, India",
    type: "full-time",
    mode: "remote",
    description: "Build modern web applications using React and TypeScript.",
    requirements: ["2+ years experience", "Strong JavaScript skills", "React proficiency"],
    skills: ["javascript", "react", "typescript", "html", "css", "tailwind"],
    salary: { min: 500000, max: 900000, currency: "INR" },
  },
  {
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "Bangalore, India",
    type: "full-time",
    mode: "remote",
    description: "Design and build scalable APIs and microservices.",
    requirements: ["3+ years backend experience", "Node.js or Python", "Database design"],
    skills: ["node.js", "express", "mongodb", "postgresql", "docker", "rest api"],
    salary: { min: 700000, max: 1200000, currency: "INR" },
  },
  {
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Hyderabad, India",
    type: "full-time",
    mode: "remote",
    description: "Work across the entire stack building features for our SaaS platform.",
    requirements: ["React + Node.js", "MongoDB experience", "Git workflow"],
    skills: ["javascript", "react", "node.js", "mongodb", "git", "css", "html"],
    salary: { min: 800000, max: 1500000, currency: "INR" },
  },
  {
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "Chennai, India",
    type: "full-time",
    mode: "remote",
    description: "Analyze large datasets and build dashboards for business insights.",
    requirements: ["SQL proficiency", "Python or R", "Data visualization"],
    skills: ["python", "sql", "data analysis", "tableau", "excel", "power bi"],
    salary: { min: 400000, max: 800000, currency: "INR" },
  },
  {
    title: "Machine Learning Engineer",
    company: "AI Solutions",
    location: "Pune, India",
    type: "full-time",
    mode: "remote",
    description: "Develop and deploy machine learning models at scale.",
    requirements: ["ML/DL experience", "Python", "TensorFlow or PyTorch"],
    skills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "docker"],
    salary: { min: 1000000, max: 1800000, currency: "INR" },
  },
  {
    title: "DevOps Engineer",
    company: "CloudFirst",
    location: "Noida, India",
    type: "contract",
    mode: "remote",
    description: "Manage cloud infrastructure and CI/CD pipelines.",
    requirements: ["AWS or GCP", "Docker & Kubernetes", "CI/CD experience"],
    skills: ["aws", "docker", "kubernetes", "terraform", "linux", "ci/cd", "jenkins", "git"],
    salary: { min: 800000, max: 1400000, currency: "INR" },
  },
  {
    title: "Mobile Developer Intern",
    company: "AppWorks",
    location: "Mumbai, India",
    type: "internship",
    mode: "remote",
    description: "Build mobile applications using React Native or Swift.",
    requirements: ["CS student", "Basic mobile development knowledge"],
    skills: ["javascript", "react", "swift", "kotlin", "git"],
    salary: { min: 150000, max: 300000, currency: "INR" },
  },
  {
    title: "UI/UX Designer",
    company: "DesignHub",
    location: "Gurugram, India",
    type: "part-time",
    mode: "remote",
    description: "Design user interfaces and experiences for web and mobile apps.",
    requirements: ["Figma proficiency", "Portfolio required", "User research skills"],
    skills: ["figma", "ui/ux", "wireframing", "photoshop", "illustrator", "html", "css"],
    salary: { min: 350000, max: 700000, currency: "INR" },
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureNet",
    location: "Delhi, India",
    type: "full-time",
    mode: "remote",
    description: "Monitor and protect company infrastructure from security threats.",
    requirements: ["Security certifications", "Network security", "Incident response"],
    skills: ["cybersecurity", "networking", "linux", "python", "bash"],
    salary: { min: 600000, max: 1200000, currency: "INR" },
  },
  {
    title: "Python Developer",
    company: "WebScale",
    location: "Kolkata, India",
    type: "full-time",
    mode: "remote",
    description: "Build backend services and APIs using Django/Flask.",
    requirements: ["3+ years Python", "REST API design", "Database experience"],
    skills: ["python", "django", "flask", "postgresql", "rest api", "docker", "git"],
    salary: { min: 600000, max: 1100000, currency: "INR" },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create a system user for seeded jobs
    let systemUser = await User.findOne({ email: "system@airesumeapp.com" });
    if (!systemUser) {
      systemUser = await User.create({
        name: "System",
        email: "system@airesumeapp.com",
        password: "system123456",
      });
      console.log("System user created");
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log("Cleared existing jobs");

    // Insert sample jobs with system user
    const jobs = sampleJobs.map((job) => ({ ...job, postedBy: systemUser._id }));
    await Job.insertMany(jobs);
    console.log(`Seeded ${jobs.length} sample jobs`);

    await mongoose.connection.close();
    console.log("Done! Database seeded successfully.");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seed();
