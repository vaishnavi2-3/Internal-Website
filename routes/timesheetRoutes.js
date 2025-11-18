// const express = require("express");
// const router = express.Router();
// const {
//   createOrUpdateEntry,
//   getAllEntries,
//   getEntryByDate,
//   deleteEntry,
// } = require("../controllers/timesheetController");

// router.post("/save", createOrUpdateEntry);
// router.get("/", getAllEntries);
// router.get("/:date", getEntryByDate);
// router.delete("/:date", deleteEntry);

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  createTimeEntry,
  getMyTimeEntries,
  updateTimeEntryByEmail,
  patchTimeEntryByEmail,
  


} = require("../controllers/timesheetController");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Employee fills timesheet (requires login)
router.post("/create", verifyToken, createTimeEntry);

// ✅ Get logged-in employee’s timesheet entries
router.get("/", getMyTimeEntries);
router.put("/update", verifyToken, updateTimeEntryByEmail);

// 🔧 Update PARTIAL entry (PATCH)
router.patch("/update", verifyToken, patchTimeEntryByEmail);
// router.put("/approve/:leaveId", approveLeaveAndCreateTimesheet);


module.exports = router;
