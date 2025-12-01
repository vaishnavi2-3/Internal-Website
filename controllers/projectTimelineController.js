const ProjectTimeline = require("../models/projectTimeline");

// ✅ Generate custom projectId
const generateProjectId = () => {
  return "PROJ" + Date.now(); // Example: PROJ1731410258715
};

// ✅ Create a new Project
exports.createProject = async (req, res) => {
  try {
    // Auto-add projectId if not present in request
    if (!req.body.projectId) {
      req.body.projectId = generateProjectId();
    }

    const project = await ProjectTimeline.create(req.body);
    res.status(201).json({
      msg: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error creating project",
      error: error.message,
    });
  }
};

// ✅ Get all Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectTimeline.find().sort({ createdAt: -1 });
    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching projects",
      error: error.message,
    });
  }
};

// ✅ Get Project by projectId
exports.getProjectByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectTimeline.findOne({ projectId });

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching project by projectId",
      error: error.message,
    });
  }
};

// ✅ Get all Projects assigned to a specific employee
exports.getProjectsByEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    const projects = await ProjectTimeline.find({
      assignedTo: empId,
    });

    if (!projects.length) {
      return res.status(404).json({
        msg: `No projects found for employee ID: ${empId}`,
      });
    }

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching employee project details",
      error: error.message,
    });
  }
};

// ✅ Get all Projects assigned by a specific manager
exports.getProjectsByManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const projects = await ProjectTimeline.find({
      assignedBy: managerId,
    });

    if (!projects.length) {
      return res.status(404).json({
        msg: `No projects found assigned by manager ID: ${managerId}`,
      });
    }

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching projects by manager",
      error: error.message,
    });
  }
};

// ✅ Update a Project by projectId
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updated = await ProjectTimeline.findOneAndUpdate(
      { projectId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // recalculate duration if dates changed
    if (req.body.startDate && req.body.endDate) {
      const diff =
        (new Date(req.body.endDate) - new Date(req.body.startDate)) /
        (1000 * 60 * 60 * 24);
      updated.duration = Math.ceil(diff);
      await updated.save();
    }

    res.status(200).json({
      msg: "Project updated successfully",
      updated,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error updating project",
      error: error.message,
    });
  }
};

// ✅ Delete a Project by projectId
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deleted = await ProjectTimeline.findOneAndDelete({ projectId });

    if (!deleted) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.status(200).json({ msg: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Error deleting project",
      error: error.message,
    });
  }
};
// ✅ Get project assignment summary for HR Dashboard
exports.getProjectAssignmentSummary = async (req, res) => {
  try {
    const projects = await ProjectTimeline.find();

    const summary = projects.map(project => {
      // Handle single employee string OR array
      let assigned = project.assignedTo;

      if (!Array.isArray(assigned)) {
        assigned = assigned ? [assigned] : [];
      }

      return {
        projectId: project.projectId,
        projectName: project.projectName || project.title || "Untitled",
        totalAssigned: assigned.length,
        assignedEmployees: assigned,
        startDate: project.startDate,
        endDate: project.endDate,
        manager: project.assignedBy
      };
    });

    res.status(200).json({
      count: summary.length,
      summary
    });

  } catch (error) {
    res.status(500).json({
      msg: "Error fetching project assignment summary",
      error: error.message,
    });
  }
};
