const express = require("express");
const router = express.Router();

const {
  getEmployeeDetails,
  createTrainingTask,
  getEmployeeTasks,
  updateTrainingTask,
    addExam,
  updateExam,
  deleteExam

} = require("../controllers/trainingController");

// Auto-fill manager, dept, employeeName
router.get("/employee/:employeeId/details", getEmployeeDetails);

// HR creates task
router.post("/create", createTrainingTask);

// Employee dashboard fetch
router.get("/employee/:employeeId", getEmployeeTasks);

// HR updates task
router.put("/update/:taskId", updateTrainingTask);
router.post("/:taskId/add-exam", addExam);

// HR updates exam (marks or title)
router.put("/:taskId/update-exam/:examId", updateExam);

// HR deletes exam
router.delete("/:taskId/delete-exam/:examId", deleteExam);


module.exports = router;
