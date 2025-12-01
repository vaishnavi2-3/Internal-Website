const express = require("express");
const router = express.Router();

const {
  getMonthlyAttendance,
  getAllEmployeesMonthlyAttendance,
  getTodayAttendanceSummary,
  getYearlyAverageAttendance
} = require("../controllers/attendanceController");


// SINGLE EMPLOYEE MONTHLY
router.get("/attendance/monthly/:employeeId", getMonthlyAttendance);

// ALL EMPLOYEES MONTHLY
router.get("/attendance/monthly", getAllEmployeesMonthlyAttendance);
router.get("/attendance/today-summary", getTodayAttendanceSummary);
router.get("/monthly-all", getAllEmployeesMonthlyAttendance);
router.get("/yearly-average", getYearlyAverageAttendance);

module.exports = router;
