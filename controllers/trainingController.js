const ProfessionalDetails = require("../models/professionalDetails");
const TrainingTask = require("../models/TrainingTask");
const Employee = require("../models/Employee");
const PersonalDetails = require("../models/personalDetails");
const crypto = require("crypto");
const BatchCounter = require("../models/BatchCounter");
const TrainingSkill = require("../models/TrainingSkill");
// const { io } = require("../server");  // adjust path if needed

// exports.createTrainingSkill = async (req, res) => {
//   try {
//     const { title, skills } = req.body;

//     if (!title) {
//       return res.status(400).json({ message: "Title is required" });
//     }

//     const newSkill = await TrainingSkill.create({
//       title,
//       skills: Array.isArray(skills) ? skills : []
//     });
//     //     io.emit("trainingSkillCreated", {
//     //   message: "New training skill added",
//     //   skill: newSkill
//     // });



//     return res.status(201).json({
//       message: "Training Skill Created Successfully",
//       data: newSkill
//     });

//   } catch (err) {
//     return res.status(500).json({
//       message: "Server Error",
//       error: err.message
//     });
//   }
// };
exports.createTrainingSkill = async (req, res) => {
  try {
    const { title, skills, confirmed } = req.body;

    // 🛑 user did not click YES
    if (!confirmed) {
      return res.status(400).json({
        message: "Creation cancelled by user"
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const newSkill = await TrainingSkill.create({
      title,
      skills: Array.isArray(skills) ? skills : []
    });

    return res.status(201).json({
      message: "Training Skill Created Successfully",
      data: newSkill
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

exports.getTrainingSkills = async (req, res) => {
  try {
    const skills = await TrainingSkill.find().sort({ createdAt: -1 });

    if (!skills.length) {
      return res.status(404).json({ message: "No training skills found" });
    }

    return res.status(200).json({
      message: "Training Skills Fetched Successfully",
      count: skills.length,
      skills
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};



async function generateBatchId(department) {
  if (!department) return null;

  // Get first 2 letters of department (remove spaces)
  const deptCode = department.replace(/\s+/g, "").substring(0, 2).toUpperCase();

  // Find or create counter
  let counter = await BatchCounter.findOne({ deptCode });

  if (!counter) {
    counter = await BatchCounter.create({ deptCode, count: 1 });
  } else {
    counter.count += 1;
    await counter.save();
  }

  return `BA${deptCode}${counter.count}`;
}

// =====================================================
// Fetch employee details for auto-fill
// =====================================================
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const prof = await ProfessionalDetails.findOne({ employeeId });
    const personal = await PersonalDetails.findOne({ officialEmail: prof?.officialEmail });

    if (!prof || !personal) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Build full name from PersonalDetails
    const employeeName = [
      personal.firstName,
      personal.middleName,
      personal.lastName
    ]
      .filter(Boolean) // remove empty values
      .join(" ");

    // Safe managerName
    const managerName =
      prof.managerName ||
      (prof.experiences?.length ? prof.experiences[0].managerName : "") ||
      "";

    return res.status(200).json({
      employeeName,
      department: prof.department || "",
      managerName
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// Utility function

// Utility: Calculate months difference
function getMonthsDifference(startDate, endDate = new Date()) {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
}




// Prevent null or empty values
function isNullOrEmpty(val) {
  return val === undefined || val === null || val === "" || val === "null";
}

exports.createTrainingTask = async (req, res) => {
  try {
    let {
      employeeId,
      trainingTitle,
      level,
      fromDate,
      toDate,
      mode,
      duration,

      batch,
      trainingCategory,
      selectedCourses,
      trainingStartDate,
      trainingEndDate,
      durationDays,
      Mode,
      trainingName,
      trainer,

      progress,
      status
    } = req.body;

    // ---- VALIDATE REQUIRED FIELDS ----
    const requiredFields = { employeeId, trainingTitle, level, fromDate, toDate };
    for (const field in requiredFields) {
      if (isNullOrEmpty(requiredFields[field])) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // ---- Convert employeeId into an array ----
    const employeeIds = Array.isArray(employeeId) ? employeeId : [employeeId];
    const isBulkAssign = employeeIds.length > 1;

    const createdTasks = [];
    let finalBatchId = null;

    // ---- LOOP EACH EMPLOYEE ----
    for (const empId of employeeIds) {

      // 🔒 BLOCK IF EMPLOYEE ALREADY IN TRAINING
      const existingTask = await TrainingTask.findOne({
        employeeId: empId,
        status: { $in: ["assigned", "in-progress"] }
      });

      if (existingTask) {
        return res.status(400).json({
          message: `Employee ${empId} is already in training. Complete the current training before assigning a new one.`,
          existingTraining: {
            trainingTitle: existingTask.trainingTitle,
            status: existingTask.status,
            fromDate: existingTask.fromDate,
            toDate: existingTask.toDate
          }
        });
      }

      // ---- FETCH EMPLOYEE DETAILS ----
      const prof = await ProfessionalDetails.findOne({ employeeId: empId });
      if (!prof || !prof.officialEmail) {
        console.log("❌ Professional details missing for employee:", empId);
        continue;
      }

      const personal = await PersonalDetails.findOne({
        officialEmail: prof.officialEmail
      });

      const employeeName = [personal?.firstName, personal?.middleName, personal?.lastName]
        .filter(Boolean)
        .join(" ");

      const managerName =
        prof.managerName ||
        (prof.experiences?.length > 0 ? prof.experiences[0].managerName : "") ||
        personal?.managerName ||
        "Not Assigned";

      const department = prof.department || "";

      if (isBulkAssign && !finalBatchId) {
        finalBatchId = await generateBatchId(department);
      }

      // ---- JOINING DATE & FRESHER LOGIC ----
      const joiningDate = prof.dateOfJoining ? new Date(prof.dateOfJoining) : null;
      let isFresher = false;

      if (joiningDate) {
        const months = getMonthsDifference(joiningDate);
        isFresher = months <= 3;
      }

      // ---- BASE TASK DATA ----
      let taskData = {
        employeeId: empId,
        employeeName,
        department,
        managerName,
        trainingTitle,
        level,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        mode,
        duration,
        status: (status || "assigned").toLowerCase(),
        progress: progress || 0,
        batchId: finalBatchId,
        assignedType: isBulkAssign ? "Bulk" : "Single",
        officialEmail: prof.officialEmail,
        dateOfJoining: joiningDate
      };

      // ---- FRESHER ----
      if (isFresher) {
        taskData.type = "Fresher";
        taskData.extraDetails = {
          fresherId: empId,
          fresherName: employeeName,
          dateOfJoining: joiningDate,
          batch: finalBatchId || batch,
          trainingCategory,
          selectedCourses: Array.isArray(selectedCourses) ? selectedCourses : [],
          trainingStartDate: trainingStartDate ? new Date(trainingStartDate) : null,
          trainingEndDate: trainingEndDate ? new Date(trainingEndDate) : null,
          durationDays: durationDays || parseInt(duration) || 0,
          Mode,
          trainingName,
          trainer,
          assignedDate: new Date().toISOString(),
          isBulk: isBulkAssign
        };
      }

      // ---- PREVIOUS EMPLOYEE ----
      else {
        taskData.type = "Previous Employee";
        taskData.extraDetails = {
          dateOfJoining: joiningDate,
          assignedDate: new Date().toISOString(),
          durationDays: durationDays || parseInt(duration) || 0,
          batch: finalBatchId
        };
      }

      const newTask = await TrainingTask.create(taskData);
      createdTasks.push(newTask);
    }

    return res.status(201).json({
      message: isBulkAssign
        ? "Bulk Training Tasks Created Successfully"
        : "Training Task Created Successfully",
      batchId: finalBatchId,
      count: createdTasks.length,
      tasks: createdTasks
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
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
    const { exam, marks } = req.body;

    const task = await TrainingTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate fields
    if (!exam || !marks) {
      return res.status(400).json({
        message: "Both 'exam' and 'marks' are required",
        received: req.body
      });
    }

    // Ensure exams array exists
    if (!Array.isArray(task.exams)) {
      task.exams = [];
    }

    // 🔥 APPEND new exam object (not replace)
    task.exams.push({ exam, marks });

    await task.save();

    return res.json({
      message: "Exam added successfully (stored without replacing old ones)",
      task
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};
exports.getExamDetails = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TrainingTask.findById(taskId).select("exams marks trainingTitle employeeName");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({
      message: "Exam details fetched successfully",
      // exams: task.exams || [],
      // marks: task.marks || {},
      task
    });

  } catch (err) {
    console.error("Error in getExamDetails:", err);
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
exports.getAllAssignedEmployees = async (req, res) => {
  try {
    const { type } = req.query; // "bulk" | "single" | undefined

    let filter = {};

    if (type) {
      const typeLower = type.toLowerCase();

      if (typeLower === "bulk") {
        filter.assignedType = "Bulk";
      } else if (typeLower === "single") {
        filter.assignedType = "Single";
      } else {
        return res.status(400).json({
          message: "Invalid type. Allowed values: bulk, single"
        });
      }
    }

    const tasks = await TrainingTask.find(filter)
      .select(
        "employeeId employeeName department managerName trainingTitle level fromDate toDate mode duration assignedType batchId extraDetails createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    if (!tasks.length) {
      return res.status(404).json({ message: "No assigned tasks found" });
    }

    return res.status(200).json({
      message: "Assigned employee tasks fetched successfully",
      filterApplied: type || "none",
      count: tasks.length,
      tasks
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};
// =====================================================
// Get Completed Tasks
// =====================================================
exports.getCompletedTasks = async (req, res) => {
  try {
    const today = new Date();

    const tasks = await TrainingTask.find();

    // Completed = today's date is AFTER the toDate
    const completed = tasks.filter(task => {
      const end = new Date(task.toDate);
      return today > end;
    });

    if (!completed.length) {
      return res.status(404).json({ message: "No completed tasks found" });
    }

    return res.status(200).json({
      message: "Completed tasks fetched successfully",
      count:completed.length,
      tasks: completed
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =====================================================
// Get In-Progress Tasks
// =====================================================
exports.getInProgressTasks = async (req, res) => {
  try {
    const today = new Date();

    const tasks = await TrainingTask.find();

    const inProgress = tasks.filter(task => {
      const start = new Date(task.fromDate);
      const end = new Date(task.toDate);

      return today >= start && today <= end;
    });

    if (!inProgress.length) {
      return res.status(404).json({ message: "No in-progress tasks found" });
    }

    return res.status(200).json({
      message: "In-progress tasks fetched successfully",
      count: inProgress.length,   // ✅ FIXED
      tasks: inProgress
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
exports.getMonthlyAssignedEmployees = async (req, res) => {
  try {
    const { type, department } = req.query; // bulk | single | none AND department

    let match = {};

    // Filter by assignedType
    if (type) {
      const typeLower = type.toLowerCase();
      if (typeLower === "bulk") {
        match.assignedType = "Bulk";
      } else if (typeLower === "single") {
        match.assignedType = "Single";
      } else {
        return res.status(400).json({
          message: "Invalid type. Allowed values: bulk, single"
        });
      }
    }

    // ⭐ Filter by department (NEW)
    if (department) {
      match.department = department;
    }

    // ----------------------------
    // Monthly wise unique employee list + count
    // ----------------------------
// ----------------------------
// Monthly wise unique employees grouped by department
// ----------------------------
const monthlyData = await TrainingTask.aggregate([
  { $match: match },

  // 1️⃣ Add month field
  {
    $addFields: {
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
    }
  },

  // 2️⃣ Group by month + department
  {
    $group: {
      _id: { month: "$month", department: "$department" },
      employees: {
        $addToSet: {
          employeeId: "$employeeId",
          employeeName: "$employeeName"
        }
      }
    }
  },

  // 3️⃣ Prepare department group structure
  {
    $project: {
      month: "$_id.month",
      department: "$_id.department",
      employees: 1,
      uniqueEmployeeCount: { $size: "$employees" },
      _id: 0
    }
  },

  // 4️⃣ Group by month → push departments inside month
  {
    $group: {
      _id: "$month",
      departments: {
        $push: {
          department: "$department",
          employees: "$employees",
          uniqueEmployeeCount: "$uniqueEmployeeCount"
        }
      }
    }
  },

  // 5️⃣ Clean output
  {
    $project: {
      month: "$_id",
      departments: 1,
      _id: 0
    }
  },

  { $sort: { month: -1 } }
]);

    // ----------------------------
    // Total unique employees
    // ----------------------------
    const totalEmployeesData = await TrainingTask.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          employees: { $addToSet: "$employeeId" }
        }
      },
      {
        $project: {
          totalUniqueEmployees: { $size: "$employees" },
          _id: 0
        }
      }
    ]);

    const totalUniqueEmployees =
      totalEmployeesData.length > 0
        ? totalEmployeesData[0].totalUniqueEmployees
        : 0;

    return res.status(200).json({
      message: "Monthly employee assignment report fetched successfully",
      filterApplied: type || "none",
      departmentFilter: department || "none",
      totalUniqueEmployees,
      monthlyData
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};
