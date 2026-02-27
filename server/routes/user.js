const express = require("express");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const {
  updateName,
  changePassword,
  uploadAvatar: uploadAvatarController,
  toggleTheme,
  updateProfile,
} = require("../controllers/userController");

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.put("/name", updateName);
router.put("/password", changePassword);
router.put("/avatar", uploadAvatar.single("avatar"), uploadAvatarController);
router.put("/theme", toggleTheme);
router.put("/profile", updateProfile);

module.exports = router;
