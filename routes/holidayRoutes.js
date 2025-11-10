const express = require("express");
const router = express.Router();
const {
  addMultipleHolidays,
  addHoliday,
 getAllHolidays,
 getHolidaysByMonth

} = require("../controllers/holidayController");

// 🔹 GET all holidays
router.get("/", getAllHolidays);

// 🔹 POST to add single holiday
router.post("/add", addHoliday);

router.post("/bulk", addMultipleHolidays);
router.get("/:month/:year", getHolidaysByMonth);

module.exports = router;
