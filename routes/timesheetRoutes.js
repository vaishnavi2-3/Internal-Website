const express = require("express");
const router = express.Router();

const {
  createTimeEntry,
  getMyTimeEntries,
  updateTimeEntryByEmail,
  patchTimeEntryByEmail,
  getMonthlySummary,
  getFilledEmployeesByMonth,
  getMonthYearFromTimeEntry,
  getSummaryByEmail,
  getAllEmployeeMonthlySummaries,
  getMonthYearList
} = require("../controllers/timesheetController");

const { verifyToken } = require("../middleware/authMiddleware");


// =========================================================
// TIMESHEET CRUD (EMPLOYEE)
// =========================================================

// Create timesheet
router.post("/create", verifyToken, createTimeEntry);

// Get all entries of logged-in employee
router.get("/", verifyToken, getMyTimeEntries);

// Update full timesheet entry
router.put("/update", verifyToken, updateTimeEntryByEmail);

// Partial update of timesheet entry
router.patch("/update", verifyToken, patchTimeEntryByEmail);


// =========================================================
// EMPLOYEE SUMMARY ROUTES
// =========================================================

// Get logged-in employee’s monthly summary
router.get("/summary", verifyToken, getMonthlySummary);

// Get list of available months/years for user
router.get("/month-year-list", verifyToken, getMonthYearList);

// Calculate summary directly from TimeEntry (backup)
router.get("/calculate-summary", verifyToken, getMonthYearFromTimeEntry);


// =========================================================
// ADMIN ROUTES
// =========================================================

// Get summary of specific employee (admin)
router.get("/admin/summary-by-email", verifyToken, getSummaryByEmail);

// Get all employees who filled timesheets for given month/year
router.get("/admin/filled-employees", verifyToken, getFilledEmployeesByMonth);

// Get all employees’ summaries for given month/year
router.get("/admin/all-summaries", verifyToken, getAllEmployeeMonthlySummaries);


// =========================================================
module.exports = router;
