const path = require("path");

const isVercel = process.env.VERCEL === "1";
const uploadsBaseDir = isVercel
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");

const avatarsDir = path.join(uploadsBaseDir, "avatars");
const resumesDir = path.join(uploadsBaseDir, "resumes");

module.exports = {
  isVercel,
  uploadsBaseDir,
  avatarsDir,
  resumesDir,
};
