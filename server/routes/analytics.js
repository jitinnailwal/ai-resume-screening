const express = require("express");
const { protect } = require("../middleware/auth");
const { getDashboard, getStats } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/stats", getStats); // Public
router.get("/dashboard", protect, getDashboard); // Protected

module.exports = router;
