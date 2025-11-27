const express = require("express");
const router = express.Router();

const {
  getEmployeeDetails,
  createTrainingTask,
  getEmployeeTasks,
  updateTrainingTask
} = require("../controllers/trainingController");

// Auto-fill manager, dept, employeeName
router.get("/employee/:employeeId/details", getEmployeeDetails);

// HR creates task
router.post("/create", createTrainingTask);

// Employee dashboard fetch
router.get("/employee/:employeeId", getEmployeeTasks);

// HR updates task
router.put("/update/:taskId", updateTrainingTask);

module.exports = router;
