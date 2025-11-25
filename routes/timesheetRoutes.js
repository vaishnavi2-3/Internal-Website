// const express = require("express");
// const router = express.Router();

// const {
//   createTimeEntry,
//   getMyTimeEntries,
//   updateTimeEntryByEmail,
//   patchTimeEntryByEmail,
//   getMonthlySummary,
//   getFilledEmployeesByMonth,
//   getMonthYearFromTimeEntry,
//   getSummaryByEmail,
//   getAllEmployeeMonthlySummaries,
//   getMonthYearList,
  
    


// } = require("../controllers/timesheetController");

// const { verifyToken } = require("../middleware/authMiddleware");


// // =========================================================
// // TIMESHEET CRUD (EMPLOYEE)
// // =========================================================

// // Create timesheet
// router.post("/create", verifyToken, createTimeEntry);

// // Get all entries of logged-in employee
// router.get("/", verifyToken, getMyTimeEntries);

// // Update full timesheet entry
// router.put("/update", verifyToken, updateTimeEntryByEmail);

// // Partial update of timesheet entry
// router.patch("/update", verifyToken, patchTimeEntryByEmail);


// // =========================================================
// // EMPLOYEE SUMMARY ROUTES
// // =========================================================

// // Get logged-in employee’s monthly summary
// router.get("/summary", verifyToken, getMonthlySummary);

// // Get list of available months/years for user
// router.get("/month-year-list", verifyToken, getMonthYearList);

// // Calculate summary directly from TimeEntry (backup)
// router.get("/calculate-summary", verifyToken, getMonthYearFromTimeEntry);


// // =========================================================
// // ADMIN ROUTES
// // =========================================================

// // Get summary of specific employee (admin)
// router.get("/admin/summary-by-email", verifyToken, getSummaryByEmail);

// // Get all employees who filled timesheets for given month/year
// router.get("/admin/filled-employees", getFilledEmployeesByMonth);

// // Get all employees’ summaries for given month/year
// router.get("/admin/all-summaries", verifyToken, getAllEmployeeMonthlySummaries);
// // router.get("/timesheet/filled", authMiddleware, getFilledEmployeesByMonth);



// // =========================================================
// module.exports = router;
const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheetController");
const { verifyToken } = require("../middleware/authMiddleware");

// ---------------------- USER ROUTES ----------------------

// Create timesheet entry
router.post("/timesheet", verifyToken, timesheetController.createTimeEntry);

// Get all my entries
router.get("/timesheet", verifyToken, timesheetController.getMyTimeEntries);

// Update entry (PUT)
router.put("/timesheet/:id", verifyToken, timesheetController.updateTimeEntryByEmail);

// Patch entry (PATCH)
router.patch("/timesheet/:id", verifyToken, timesheetController.patchTimeEntryByEmail);

// Delete entry
router.delete("/timesheet/:id", verifyToken, timesheetController.deleteTimeEntry);

// Monthly summary (my summary)
router.get("/summary/monthly", verifyToken, timesheetController.getMonthlySummary);

// List of all months I filled
router.get("/timesheet/month-year/list", verifyToken, timesheetController.getMonthYearList);

// Monthly breakdown directly from TimeEntry
router.get("/timesheet/from-entry", verifyToken, timesheetController.getMonthYearFromTimeEntry);

// ---------------------- ADMIN ROUTES ----------------------

// Get filled employees for a month
router.get(
  "/admin/timesheet/filled-employees",
  verifyToken,
  timesheetController.getFilledEmployeesByMonth
);

// Get summary of specific employee
router.get(
  "/admin/timesheet/summary",
  verifyToken,
  timesheetController.getSummaryByEmail
);

// Get all employee summaries for month
router.get(
  "/admin/timesheet/summaries",
  verifyToken,
  timesheetController.getAllEmployeeMonthlySummaries
);

module.exports = router;
