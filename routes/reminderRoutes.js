const express = require("express");
const router = express.Router();

const {
  addReminder,
  getWeeklyReminders
} = require("../controllers/reminderController");

// ➕ Add a new reminder
router.post("/add", addReminder);

// 📅 Get all reminders for the current week for ONE employee
router.get("/week/:employeeId", getWeeklyReminders);

module.exports = router;
