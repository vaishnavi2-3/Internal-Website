const express = require("express");
const router = express.Router();
const {
  getMyMonthlySummary,
  getMyDailySummary,
  getMyWeeklySummary
} = require("../controllers/summaryController");

const { verifyToken } = require("../middleware/authMiddleware");

// GET monthly summary → /api/summary/my?month=1&year=2025
router.get("/my",verifyToken , getMyMonthlySummary);

// GET daily summary → /api/summary/daily?date=2025-01-03
router.get("/daily", verifyToken, getMyDailySummary);

// GET weekly summary → /api/summary/weekly?week=2&month=1&year=2025
router.get("/weekly", verifyToken, getMyWeeklySummary);

module.exports = router;
