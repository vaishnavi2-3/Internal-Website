const express = require("express");
const router = express.Router();
const {
  getMyMonthlySummary,
  getMyDailySummary,
  getMyWeeklySummary
} = require("../controllers/summaryController");

const authMiddleware = require("../middleware/auth");

// GET monthly summary → /api/summary/my?month=1&year=2025
router.get("/my", authMiddleware, getMyMonthlySummary);

// GET daily summary → /api/summary/daily?date=2025-01-03
router.get("/daily", authMiddleware, getMyDailySummary);

// GET weekly summary → /api/summary/weekly?week=2&month=1&year=2025
router.get("/weekly", authMiddleware, getMyWeeklySummary);

module.exports = router;
