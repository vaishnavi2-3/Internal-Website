const express = require("express");
const router = express.Router();
const { getTotalEmployees } = require("../controllers/hrDashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

router.get("/hr-dashboard", verifyToken, roleCheck("HR", "Admin", "Manager"), getTotalEmployees);

module.exports = router;
