const express = require("express");
const router = express.Router();

const {
  addReminder,
  getWeeklyReminders,
  getAllReminders
} = require("../controllers/reminderController");

// ➕ Add a new reminder
router.post("/add", addReminder);

// 📅 Get all reminders for the current week for ONE employee
router.get("/week", getWeeklyReminders);
router.get("/all", getAllReminders);


module.exports = router;
