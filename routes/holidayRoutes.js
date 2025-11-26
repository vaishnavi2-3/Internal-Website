const express = require("express");
const router = express.Router();
const {
  addMultipleHolidays,
  addHoliday,
 getAllHolidays,
 getHolidaysByMonth,
 getHRUpcomingHolidays

} = require("../controllers/holidayController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");


// 🔹 GET all holidays
router.get("/", getAllHolidays);

// 🔹 POST to add single holiday
router.post("/add", addHoliday);

router.post("/bulk", addMultipleHolidays);
router.get("/:month/:year", getHolidaysByMonth);
router.get(
  "/hr",
  // verifyToken,
  // roleCheck("HR", "Manager", "Admin"),
  getHRUpcomingHolidays
);


module.exports = router;
