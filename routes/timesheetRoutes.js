const express = require("express");
const router = express.Router();
const {
  createTimeEntry,
  getMyTimeEntries,
  updateTimeEntryByEmail,
  patchTimeEntryByEmail,
  getMonthlySummary ,
  getFilledEmployeesByMonth,
  getMonthYearFromTimeEntry,
  getSummaryByEmail,
  getAllEmployeeMonthlySummaries,
  getMonthYearList

  


} = require("../controllers/timesheetController");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Employee fills timesheet (requires login)
router.post("/create", verifyToken, createTimeEntry);

// ✅ Get logged-in employee’s timesheet entries
router.put("/update", verifyToken, updateTimeEntryByEmail);
router.get("/",verifyToken, getMyTimeEntries);
router.put("/update", verifyToken, updateTimeEntryByEmail);

// 🔧 Update PARTIAL entry (PATCH)
router.patch("/update", verifyToken, patchTimeEntryByEmail);
// router.put("/approve/:leaveId", approveLeaveAndCreateTimesheet);

router.get("/summary",verifyToken, getMonthlySummary);
router.get("/filled-employees", verifyToken, getFilledEmployeesByMonth);

// ✅ 2. Get month/year grouping from TimeEntry
router.get("/month-year", verifyToken, getMonthYearFromTimeEntry);
router.get("/summary", verifyToken, getSummaryByEmail);                 // admin email search
router.get("/all-summaries", verifyToken, getAllEmployeeMonthlySummaries);
router.get("/month-year", verifyToken, getMonthYearList);




module.exports = router;
