const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectByProjectId,
  getProjectsByEmployee,
  getProjectsByManager,
  updateProject,
  deleteProject,
  getProjectAssignmentSummary
} = require("../controllers/projectTimelineController");

// ✅ Create a new project
router.post("/save", createProject);

// ✅ Get all projects
router.get("/", getAllProjects);

// ✅ Get project by projectId
router.get("/:projectId", getProjectByProjectId);

// ✅ Get projects assigned to a specific employee
router.get("/employee/:empId", getProjectsByEmployee);

// ✅ Get projects assigned by a specific manager
router.get("/manager/:managerId", getProjectsByManager);

// ✅ Update project by projectId
router.put("/:projectId", updateProject);

// ✅ Delete project by projectId
router.delete("/:projectId", deleteProject);
router.get("/summary/hr", getProjectAssignmentSummary);


module.exports = router;
