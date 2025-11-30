const express = require("express");
const router = express.Router();

const {
  getMonthlyAttendance,
  getAllEmployeesMonthlyAttendance,
  getTodayAttendanceSummary
} = require("../controllers/attendanceController");


// SINGLE EMPLOYEE MONTHLY
router.get("/attendance/monthly/:employeeId", getMonthlyAttendance);

// ALL EMPLOYEES MONTHLY
router.get("/attendance/monthly", getAllEmployeesMonthlyAttendance);
router.get("/attendance/today-summary", getTodayAttendanceSummary);
router.get("/monthly-all", getAllEmployeesMonthlyAttendance);

module.exports = router;
