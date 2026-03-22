const multer = require("multer");
const path = require("path");
const fs = require("fs");

const isVercel = !!process.env.VERCEL;

// === AVATAR UPLOAD ===

const avatarStorage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        const dir = path.join(__dirname, "../uploads/avatars");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        const uniqueName = `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

const avatarFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: avatarFilter,
});

// === RESUME UPLOAD ===

const resumeStorage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        const dir = path.join(__dirname, "../uploads/resumes");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        const uniqueName = `resume-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

const resumeFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOC files are allowed"));
  }
};

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: resumeFilter,
});

module.exports = { uploadAvatar, uploadResume };
