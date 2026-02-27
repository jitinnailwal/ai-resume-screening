const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { avatarsDir } = require("../config/paths");

// @desc    Update user name (allowed only twice)
// @route   PUT /api/user/name
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findById(req.user._id);

    if (user.nameChangesLeft <= 0) {
      return res.status(400).json({
        message: "You have already used your 2 name changes. No more changes allowed.",
      });
    }

    user.name = name.trim();
    user.nameChangesLeft -= 1;
    await user.save();

    res.json({
      name: user.name,
      nameChangesLeft: user.nameChangesLeft,
      message: `Name updated. You have ${user.nameChangesLeft} change(s) remaining.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Change password (requires old password)
// @route   PUT /api/user/password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Upload/update avatar
// @route   PUT /api/user/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar if it's not the default
    if (user.avatar && user.avatar !== "default-avatar.png") {
      const oldPath = path.join(avatarsDir, user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.avatar = req.file.filename;
    await user.save();

    res.json({ avatar: user.avatar, message: "Avatar updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle theme (light/dark)
// @route   PUT /api/user/theme
exports.toggleTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme || !["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Theme must be 'light' or 'dark'" });
    }

    const user = await User.findById(req.user._id);
    user.theme = theme;
    await user.save();

    res.json({ theme: user.theme, message: `Theme set to ${user.theme}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update profile (bio, skills)
// @route   PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, skills } = req.body;
    const updateData = {};

    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      nameChangesLeft: user.nameChangesLeft,
      skills: user.skills,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
