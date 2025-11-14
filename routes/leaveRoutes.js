// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const { createLeave, getLeaves } = require("../controllers/leaveController");

// // ✅ Multer config (temporary local save before uploading to Azure)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/leaves/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // ✅ Routes
// router.post("/create", upload.single("file"), createLeave);
// router.get("/", getLeaves);

// module.exports = router;
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
  getLeavesByEmployeeId

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



module.exports = router;
