const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");


const {
  applyLeave,
  getAllHrLeaves,
  managerAction,
  addHRReason,
  verifyLeave,
  updateHrStatus,
  getWeeklyAnalytics,
  cleanInvalidFiles,
  approveLeaveByEmployeeId,
  approveLeaveByLeaveId,
  // getAbsentEmployeesToday,
  // getPresentEmployeesToday,
  getTodayAttendanceSummary,
  rejectLeave 
} = require("../controllers/HrLeavesController");


// =====================
// EMPLOYEE APPLY LEAVE
// =====================
router.post("/apply",verifyToken, upload.single("file"), applyLeave);

// =====================
// HR FETCH ALL LEAVES
// =====================
router.get("/hr", getAllHrLeaves);

// =====================
// MANAGER APPROVE/REJECT (Employee ID)
// =====================
router.put("/manager/employee/:leaveId",verifyToken, managerAction);

// =====================
// HR ADD REASON (Employee ID)
// =====================
router.put("/hr/reason/employee/:leaveId",verifyToken, addHRReason);

// =====================
// HR UPDATE STATUS (Employee ID)
// =====================
router.put("/hr/status/employee/:employeeId",verifyToken, updateHrStatus);

//=====================
// HR VERIFY LEAVE (Employee ID)
// =====================
router.put("/hr/status/employee/:employeeId",verifyToken, updateHrStatus);
router.put("/hr/verify/employee/:leaveId", verifyToken,verifyLeave);

// =====================
// WEEKLY ANALYTICS
// =====================
router.get("/analytics/weekly", getWeeklyAnalytics);
router.put("/leave/approve/:employeeId",verifyToken, approveLeaveByEmployeeId);
router.put("/leave/approve/:leaveId",verifyToken, approveLeaveByLeaveId);
// router.get("/attendance/absent/today", getAbsentEmployeesToday);
// router.get("/attendance/present/today", getPresentEmployeesToday);
// router.get("/attendance/today-summary", getTodayAttendanceSummary);



// =====================
// CLEAN INVALID PATHS
// =====================
router.get("/admin/cleanup-invalid-files", cleanInvalidFiles);
router.put("/reject/:leaveId",verifyToken, rejectLeave);


module.exports = router;
