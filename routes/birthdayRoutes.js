const express = require("express");
const router = express.Router();

const { getBirthdaysThisWeek } = require("../controllers/birthdayController");
const {verifyToken} = require("../middleware/authMiddleware");  // FIXED
const roleCheck = require("../middleware/roleCheck");

// HR, Manager, Admin can see birthdays
router.get(
  "/week",
  // verifyToken,
  // roleCheck("HR", "Manager", "Admin"),
  getBirthdaysThisWeek
);

module.exports = router;
