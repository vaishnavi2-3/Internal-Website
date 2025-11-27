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

    let managerName = "";

    if (prof.managerName) {
      managerName = prof.managerName;
    } else if (prof.experiences?.length > 0) {
      managerName = prof.experiences[0].managerName || "";
    }

    return res.status(200).json({
      EmployeeName: prof.officialEmail.split("@")[0],
      Department: prof.department,
      ManagerName: managerName
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
      EmployeeId,
      TrainingTitle,
      Level,
      FromDate,
      ToDate,
      Mode,
      Duration
    } = req.body;

    // Fetch employee info
    const prof = await ProfessionalDetails.findOne({ employeeId: EmployeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Auto-fill ManagerName
    let ManagerName = "";

    if (prof.managerName) {
      ManagerName = prof.managerName;
    } else if (prof.experiences && prof.experiences.length > 0) {
      ManagerName = prof.experiences[0].managerName || "";
    }

    const EmployeeName = prof.officialEmail.split("@")[0];
    const Department = prof.department;

    const newTask = new TrainingTask({
      EmployeeId,
      EmployeeName,
      Department,
      ManagerName,

      TrainingTitle,
      Level,
      FromDate,
      ToDate,
      Mode,
      Duration
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

    const tasks = await TrainingTask.find({ EmployeeId: employeeId });

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
