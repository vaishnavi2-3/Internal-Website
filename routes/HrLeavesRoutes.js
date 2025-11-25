const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  applyLeave,
  getAllHrLeaves,
  managerAction,
  addHRReason,
  verifyLeave,
  updateHrStatus,
  getWeeklyAnalytics,
  cleanInvalidFiles,
  rejectLeave 
} = require("../controllers/HrLeavesController");


// =====================
// EMPLOYEE APPLY LEAVE
// =====================
router.post("/apply", upload.single("file"), applyLeave);

// =====================
// HR FETCH ALL LEAVES
// =====================
router.get("/hr", getAllHrLeaves);

// =====================
// MANAGER APPROVE/REJECT (Employee ID)
// =====================
router.put("/manager/employee/:employeeId", managerAction);

// =====================
// HR ADD REASON (Employee ID)
// =====================
router.put("/hr/reason/employee/:employeeId", addHRReason);

// =====================
// HR UPDATE STATUS (Employee ID)
// =====================
router.put("/hr/status/employee/:employeeId", updateHrStatus);

//=====================
// HR VERIFY LEAVE (Employee ID)
// =====================
router.put("/hr/verify/employee/:employeeId", verifyLeave);

// =====================
// WEEKLY ANALYTICS
// =====================
router.get("/analytics/weekly", getWeeklyAnalytics);

// =====================
// CLEAN INVALID PATHS
// =====================
router.get("/admin/cleanup-invalid-files", cleanInvalidFiles);
router.put("/reject/:employeeId", rejectLeave);


module.exports = router;
