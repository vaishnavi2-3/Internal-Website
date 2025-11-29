// const ProfessionalDetails = require("../models/professionalDetails");
// const TrainingTask = require("../models/TrainingTask");
// const Employee = require("../models/Employee");

// // ============================================
// // Fetch employee details for auto-fill
// // ============================================
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     const prof = await ProfessionalDetails.findOne({ employeeId });

//     if (!prof) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Safe employeeName extraction
//     let employeeName = "Unknown";
//     if (prof.officialEmail) {
//       employeeName = prof.officialEmail.split("@")[0];
//     } else if (prof.employeeName) {
//       employeeName = prof.employeeName;
//     }

//     // Safe managerName
//     let managerName = "";
//     if (prof.managerName) {
//       managerName = prof.managerName;
//     } else if (prof.experiences?.length > 0) {
//       managerName = prof.experiences[0].managerName || "";
//     }

//     return res.status(200).json({
//       employeeName,
//       department: prof.department || "",
//       managerName
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

// // ===============================================
// // Create Training Task (camelCase)
// // ===============================================
// exports.createTrainingTask = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       trainingTitle,
//       level,
//       fromDate,
//       toDate,
//       mode,
//       duration
//     } = req.body;

//     // Fetch employee profile
//     const prof = await ProfessionalDetails.findOne({ employeeId });

//     if (!prof) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // SAFE employeeName
//     let employeeName = "Unknown";
//     if (prof.officialEmail) {
//       employeeName = prof.officialEmail.split("@")[0];
//     } else if (prof.employeeName) {
//       employeeName = prof.employeeName;
//     }

//     // SAFE managerName
//     let managerName = "";
//     if (prof.managerName) {
//       managerName = prof.managerName;
//     } else if (prof.experiences?.length > 0) {
//       managerName = prof.experiences[0].managerName || "";
//     }

//     const department = prof.department || "";

//     const newTask = new TrainingTask({
//       employeeId,
//       employeeName,
//       department,
//       managerName,
//       trainingTitle,
//       level,
//       fromDate,
//       toDate,
//       mode,
//       duration,
//      exams: req.body.exams,
//      marks: req.body.marks

//     });

//     await newTask.save();

//     return res.status(201).json({
//       message: "Training Task Created Successfully",
//       task: newTask
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };



// // ===============================================
// // Fetch All Tasks for Employee Dashboard
// // ===============================================
// exports.getEmployeeTasks = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     const tasks = await TrainingTask.find({ employeeId });

//     return res.status(200).json({
//       message: "Tasks fetched successfully",
//       tasks
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

// // ===============================================
// // Update Training Task (PATCH / PUT)
// // ===============================================
// exports.updateTrainingTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     const updatedTask = await TrainingTask.findByIdAndUpdate(
//       taskId,
//       req.body,
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     return res.status(200).json({
//       message: "Task updated successfully",
//       updatedTask
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
// exports.addExam = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { exams, marks } = req.body;

//     const task = await TrainingTask.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     // Directly overwrite values (no push!)
//     task.exams = exams;
//     task.marks = marks;

//     await task.save();

//     return res.json({
//       message: "Exam added successfully",
//       task
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

// exports.updateExam = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { exams, marks } = req.body;

//     const task = await TrainingTask.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     if (exams !== undefined) task.exams = exams;
//     if (marks !== undefined) task.marks = marks;

//     await task.save();

//     return res.json({ message: "Exam updated", task });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
// exports.deleteExam = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     const task = await TrainingTask.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     task.exams = null;
//     task.marks = null;

//     await task.save();

//     return res.json({ message: "Exam deleted", task });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
// // ===============================================
// // Get All Employees Who Have Assigned Tasks
// // ===============================================
// exports.getAllAssignedEmployees = async (req, res) => {
//   try {
//     // Fetch ALL training tasks (each one belongs to an employee)
//     const tasks = await TrainingTask.find({})
//       .select(
//         "employeeId employeeName department managerName trainingTitle level fromDate toDate mode duration createdAt updatedAt"
//       )
//       .sort({ createdAt: -1 });

//     if (!tasks || tasks.length === 0) {
//       return res.status(404).json({ message: "No assigned tasks found" });
//     }

//     return res.status(200).json({
//       message: "Assigned employee tasks fetched successfully",
//       tasks
//     });

//   } catch (err) {
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
const ProfessionalDetails = require("../models/professionalDetails");
const TrainingTask = require("../models/TrainingTask");
const Employee = require("../models/Employee");

// =====================================================
// Fetch employee details for auto-fill
// =====================================================
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Safe employeeName
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

// =====================================================
// Create Training Task
// =====================================================
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

    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Safe employeeName
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

// =====================================================
// Fetch all tasks for employee dashboard
// =====================================================
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

// =====================================================
// Update Training Task (UUID-safe)
// =====================================================
exports.updateTrainingTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const updatedTask = await TrainingTask.findOneAndUpdate(
      { _id: taskId },      // UUID SAFE
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

// =====================================================
// Add Exam (UUID-safe)
// =====================================================
exports.addExam = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { exams, marks } = req.body;

    const task = await TrainingTask.findOne({ _id: taskId });  // FIXED

    if (!task) return res.status(404).json({ message: "Task not found" });

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

// =====================================================
// Update Exam (UUID-safe)
// =====================================================
exports.updateExam = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { exams, marks } = req.body;

    const task = await TrainingTask.findOne({ _id: taskId }); // FIXED

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (exams !== undefined) task.exams = exams;
    if (marks !== undefined) task.marks = marks;

    await task.save();

    return res.json({ message: "Exam updated", task });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =====================================================
// Delete Exam (UUID-safe)
// =====================================================
exports.deleteExam = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TrainingTask.findOne({ _id: taskId }); // FIXED

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.exams = null;
    task.marks = null;

    await task.save();

    return res.json({ message: "Exam deleted", task });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =====================================================
// Get All Assigned Employees (No change needed)
// =====================================================
exports.getAllAssignedEmployees = async (req, res) => {
  try {
    const tasks = await TrainingTask.find({})
      .select(
        "employeeId employeeName department managerName trainingTitle level fromDate toDate mode duration createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No assigned tasks found" });
    }

    return res.status(200).json({
      message: "Assigned employee tasks fetched successfully",
      tasks
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
exports.assignTasksToDepartment = async (req, res) => {
  try {
    const {
      department,
      trainingTitle,
      level,
      fromDate,
      toDate,
      mode,
      duration,
      exams,
      marks
    } = req.body;

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    // Get employees in the department
    const employees = await ProfessionalDetails.find({ department });

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found in this department" });
    }

    let assignedTasks = [];

    // Loop through each employee
    for (const emp of employees) {

      let employeeName = emp.employeeName || (emp.officialEmail?.split("@")[0]) || "Unknown";

      let managerName = emp.managerName || emp.experiences?.[0]?.managerName || "";

      const task = await TrainingTask.create({
        employeeId: emp.employeeId,
        employeeName,
        department: emp.department,
        managerName,
        trainingTitle,
        level,
        fromDate,
        toDate,
        mode,
        duration,
        exams,
        marks
      });

      assignedTasks.push(task);
    }

    return res.status(201).json({
      message: "Training Tasks Assigned to Department Employees Successfully",
      totalAssigned: assignedTasks.length,
      tasks: assignedTasks
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// ===============================================
// Get ALL Unique Departments
// ===============================================
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await ProfessionalDetails.distinct("department");

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: "No departments found" });
    }

    return res.status(200).json({
      message: "Departments fetched successfully",
      departments
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentName } = req.params;

    const employees = await ProfessionalDetails.find({ department: departmentName })
      .select("employeeId employeeName officialEmail department managerName experiences");

    if (!employees.length) {
      return res.status(404).json({
        message: `No employees found in ${departmentName}`
      });
    }

    const formatted = employees.map(emp => {
      let name = emp.employeeName ||
                 (emp.officialEmail ? emp.officialEmail.split("@")[0] : "Unknown");

      let managerName = emp.managerName ||
                        (emp.experiences?.length ? emp.experiences[0].managerName : "");

      return {
        employeeId: emp.employeeId,
        employeeName: name,
        department: emp.department,
        managerName
      };
    });

    return res.status(200).json({
      message: "Employees fetched successfully",
      employees: formatted
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
exports.getEmployeeByDepartmentAndId = async (req, res) => {
  try {
    const { departmentName, employeeId } = req.params;

    const emp = await ProfessionalDetails.findOne({
      department: departmentName,
      employeeId
    }).select("employeeId employeeName officialEmail department managerName experiences");

    if (!emp) {
      return res.status(404).json({
        message: `Employee ${employeeId} not found in department ${departmentName}`
      });
    }

    let employeeName = emp.employeeName ||
                       (emp.officialEmail ? emp.officialEmail.split("@")[0] : "Unknown");

    let managerName = emp.managerName ||
                      (emp.experiences?.length ? emp.experiences[0].managerName : "");

    return res.status(200).json({
      message: "Employee fetched successfully",
      employee: {
        employeeId: emp.employeeId,
        employeeName,
        department: emp.department,
        managerName
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
