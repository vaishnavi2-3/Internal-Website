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
      duration,
     exams: req.body.exams,
     marks: req.body.marks

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
exports.addExam = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { exams, marks } = req.body;

    const task = await TrainingTask.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Directly overwrite values (no push!)
    task.exams = exams;
    task.marks = marks;

    await task.save();

    return res.json({
      message: "Exam added successfully",
      task
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { exams, marks } = req.body;

    const task = await TrainingTask.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (exams !== undefined) task.exams = exams;
    if (marks !== undefined) task.marks = marks;

    await task.save();

    return res.json({ message: "Exam updated", task });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
exports.deleteExam = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TrainingTask.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.exams = null;
    task.marks = null;

    await task.save();

    return res.json({ message: "Exam deleted", task });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
// ===============================================
// Get All Employees Who Have Assigned Tasks
// ===============================================
exports.getAllAssignedEmployees = async (req, res) => {
  try {
    // Fetch unique employeeIds that have tasks
    const employeesWithTasks = await TrainingTask.distinct("employeeId");

    if (!employeesWithTasks || employeesWithTasks.length === 0) {
      return res.status(404).json({ message: "No employees have assigned tasks" });
    }

    // Fetch employee professional details for those IDs
    const employeeDetails = await ProfessionalDetails.find({
      employeeId: { $in: employeesWithTasks }
    }).select("employeeId department officialEmail managerName employeeName experiences role");

    // Format safe employeeName
    const result = employeeDetails.map(emp => {
      let name = "Unknown";

      if (emp.officialEmail) {
        name = emp.officialEmail.split("@")[0];
      } else if (emp.employeeName) {
        name = emp.employeeName;
      }

      let managerName = emp.managerName || "";
      if (!managerName && emp.experiences?.length > 0) {
        managerName = emp.experiences[0].managerName || "";
      }

      return {
        employeeId: emp.employeeId,
        employeeName: name,
        department: emp.department || "",
        managerName,
        role: emp.role || ""
      };
    });

    return res.status(200).json({
      message: "Employees with assigned tasks fetched successfully",
      employees: result
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
