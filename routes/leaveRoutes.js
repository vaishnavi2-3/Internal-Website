const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// Memory storage for Azure uploads
const upload = multer({ storage: multer.memoryStorage() });

const {
  createLeave,
  getLeaveSummary,
  updateLeaveByEmployeeId,
  getAllLeaves,
   getLatestLeaveStatusByEmployeeId,
  getLeavesByStatus,
  approveLeaveByEmployeeIdAndDate,
  getLeavesByEmployeeId,
  previewLeaveFile

} = require("../controllers/leaveController");

// --------------------------------------------------------
// APPLY LEAVE  (POST)
// --------------------------------------------------------
router.post(
  "/apply",verifyToken,
  upload.single("file"),   // optional file upload
  createLeave
);

// --------------------------------------------------------
// LEAVE SUMMARY  (GET)
// :employeeId = EMP101, EMP009, etc.
// --------------------------------------------------------
router.get(
  "/summary/:employeeId",
  getLeaveSummary
);

// --------------------------------------------------------
// UPDATE LEAVE BY EMPLOYEE ID (PUT)
// :employeeId = EMP101
//---------------------------------------------------------
router.put(
  "/update/:employeeId",
  upload.single("file"),    // update file optionally
  updateLeaveByEmployeeId
);
router.get("/all", getAllLeaves);
router.get("/employee/:employeeId/latest", getLatestLeaveStatusByEmployeeId);
router.get("/employee/:employeeId/filter", getLeavesByStatus);
router.put("/approve/:employeeId/:date", approveLeaveByEmployeeIdAndDate);
router.get("/:employeeId", getLeavesByEmployeeId);
router.get("/file/:leaveId", previewLeaveFile);




module.exports = router;
