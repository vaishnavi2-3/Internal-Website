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

    // Safe employeeName extraction
    let employeeName = "Unknown";
    if (prof.officialEmail) {
      employeeName = prof.officialEmail.split("@")[0];
    } else if (prof.employeeName) {
      employeeName = prof.employeeName;
    }

    // Safe managerName
    let managerName = "";
    if (prof.managerName) {
      managerName = prof.managerName;
    } else if (prof.experiences?.length > 0) {
      managerName = prof.experiences[0].managerName || "";
    }

    return res.status(200).json({
      employeeName,
      department: prof.department || "",
      managerName
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ===============================================
// Create Training Task (camelCase)
// ===============================================
exports.createTrainingTask = async (req, res) => {
  try {
    const {
      employeeId,
      trainingTitle,
      level,
      fromDate,
      toDate,
      mode,
      duration
    } = req.body;

    // Fetch employee profile
    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // SAFE employeeName
    let employeeName = "Unknown";
    if (prof.officialEmail) {
      employeeName = prof.officialEmail.split("@")[0];
    } else if (prof.employeeName) {
      employeeName = prof.employeeName;
    }

    // SAFE managerName
    let managerName = "";
    if (prof.managerName) {
      managerName = prof.managerName;
    } else if (prof.experiences?.length > 0) {
      managerName = prof.experiences[0].managerName || "";
    }

    const department = prof.department || "";

    const newTask = new TrainingTask({
      employeeId,
      employeeName,
      department,
      managerName,
      trainingTitle,
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
    return res.status(500).json({ message: "Server Error", error: err.message });
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
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ===============================================
// Update Training Task (PATCH / PUT)
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
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
