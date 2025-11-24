
// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/upload"); // multer memory storage

// const {
//   applyLeave,
//   getAllHrLeaves,
//   managerAction,
//   addHRReason,
//   verifyLeave,
//   updateHrStatus,
//   getWeeklyAnalytics,
//   cleanInvalidFiles
// } = require("../controllers/HrLeavesController");

// // ==================================================
// // EMPLOYEE APPLY LEAVE (uploads file to Azure)
// // ==================================================
// router.post("/apply", upload.single("file"), applyLeave);

// // ==================================================
// // HR – FETCH ALL LEAVE REQUESTS
// // ==================================================
// router.get("/hr", getAllHrLeaves);

// // ==================================================
// // MANAGER – APPROVE / REJECT
// // ==================================================
// router.put("/manager/:id", managerAction);

// // ==================================================
// // HR – ADD REASON
// // ==================================================
// router.put("/hr/reason/:id", addHRReason);

// // ==================================================
// // HR – VERIFY LEAVE (FINAL APPROVAL)
// // ==================================================
// router.put("/hr/verify/:id", verifyLeave);

// // ==================================================
// // HR – UPDATE STATUS (Approved / Rejected)
// // ==================================================
// router.put("/hr/status/:id", updateHrStatus);

// // ==================================================
// // WEEKLY ANALYTICS FOR GRAPH
// // ==================================================
// router.get("/analytics/weekly", getWeeklyAnalytics);

// router.get("/admin/cleanup-invalid-files", cleanInvalidFiles);


// module.exports = router;
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
// HR VERIFY LEAVE (Employee ID)
// =====================
router.put("/hr/verify/employee/:employeeId", verifyLeave);

// =====================
// HR UPDATE STATUS (Employee ID)
// =====================
router.put("/hr/status/employee/:employeeId", updateHrStatus);

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
