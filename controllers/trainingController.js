const ProfessionalDetails = require("../models/professionalDetails");
const TrainingTask = require("../models/TrainingTask");

// ============================================
// Fetch employee details for auto-fill
// ============================================
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get manager name from experience or fallback
    const managerName =
      prof.experiences?.length > 0 ? prof.experiences[0].managerName : "";

    return res.status(200).json({
      employeeName: prof.officialEmail.split("@")[0],
      department: prof.department,
      managerName: managerName
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err });
  }
};

// ===============================================
// Create HR Assigned Training Task
// ===============================================
exports.createTrainingTask = async (req, res) => {
  try {
    const {
      employeeId,
      level,
      fromDate,
      toDate,
      mode,
      duration
    } = req.body;

    // Fetch employee info from ProfessionalDetails
    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ==============================
    // AUTO-FILL MANAGER NAME
    // Ignore whatever frontend sends
    // ==============================
    let managerName = "";

    if (prof.managerName) {
      managerName = prof.managerName;
    } else if (prof.experiences && prof.experiences.length > 0) {
      managerName = prof.experiences[0].managerName;
    }

    const employeeName = prof.officialEmail.split("@")[0];
    const department = prof.department;

    // Create new training task
    const newTask = new TrainingTask({
      employeeId,
      employeeName,
      department,
      managerName,
      level,
      fromDate,
      toDate,
      mode,
      duration
    });

    await newTask.save();

    return res.status(201).json({
      message: "Training Task Created Successfully",
      task: newTask
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

// ===============================================
// Fetch All Tasks for Employee Dashboard
// ===============================================
exports.getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const tasks = await TrainingTask.find({ employeeId });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err });
  }
};

// ===============================================
// HR Updates an Existing Training Task
// ===============================================
exports.updateTrainingTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const updatedTask = await TrainingTask.findByIdAndUpdate(
      taskId,
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      updatedTask
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err });
  }
};
