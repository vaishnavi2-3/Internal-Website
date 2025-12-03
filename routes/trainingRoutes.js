const express = require("express");
const router = express.Router();

const {
  getEmployeeDetails,
  createTrainingTask,
  getEmployeeTasks,
  updateTrainingTask,
  addExam,
  updateExam,
  deleteExam,
  // getAllAssignedEmployees,
  assignTasksToDepartment,
  getAllDepartments,
  getEmployeesByDepartment,
  getEmployeeByDepartmentAndId,
  getAllAssignedEmployees,
  getCompletedTasks,
  getInProgressTasks


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
router.post("/assign/department", assignTasksToDepartment);


// HR deletes exam
router.delete("/:taskId/delete-exam/:examId", deleteExam);
// router.get("/assigned/employees", getAllAssignedEmployees);
router.get("/departments", getAllDepartments);
router.get("/departments/:departmentName", getEmployeesByDepartment);
// GET single employee from department
router.get("/departments/:departmentName/:employeeId",getEmployeeByDepartmentAndId);

router.get("/assigned", getAllAssignedEmployees);
router.get("/tasks/completed", getCompletedTasks);
router.get("/tasks/in-progress", getInProgressTasks);


module.exports = router;
