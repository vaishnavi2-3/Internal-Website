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
router.get("/timesheet/employee/:employeeId",timesheetController.getTimesheetByEmployeeId);

// Delete entry
router.delete("/timesheet/:id", verifyToken, timesheetController.deleteTimeEntry);

// Monthly summary (my summary)
router.get("/summary/monthly", verifyToken, timesheetController.getMonthlySummary);

// List of all months I filled
router.get("/timesheet/month-year/list", verifyToken, timesheetController.getMonthYearList);

// Monthly breakdown directly from TimeEntry
router.get("/timesheet/from-entry", verifyToken, timesheetController.getMonthYearFromTimeEntry);
router.get("/all/employees",timesheetController.getAllEmployeesTimesheet);

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
