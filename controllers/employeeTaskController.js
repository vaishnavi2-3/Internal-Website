// // controllers/employeeTaskController.js
// const TrainingTask = require("../models/TrainingTask");

// console.log("🔥 Controller Loaded: getEmployeeAssignedTasks");

// exports.getEmployeeAssignedTasks = async (req, res) => {
//   const logs = [];

//   try {
//     logs.push("===== EMPLOYEE TASK FETCH START =====");

//     if (!req.officialEmail) {
//       logs.push("❌ officialEmail is missing in request object");
//       return res.status(401).json({
//         message: "Unauthorized: official email missing",
//         tasks: [],
//         logs,
//       });
//     }

//     logs.push("Extracted Official Email from Middleware: " + req.officialEmail);
//     logs.push("Employee ID from Middleware: " + req.employeeId);

//     logs.push("🔍 Querying tasks for officialEmail = " + req.officialEmail);

//     const tasks = await TrainingTask.find({
//       officialEmail: req.officialEmail
//     });

//     logs.push("📌 Tasks Found Count: " + tasks.length);
//     logs.push("📌 Tasks List: " + JSON.stringify(tasks, null, 2));

//     logs.push("===== END TASK FETCH =====");

//     return res.status(200).json({
//       message: "Tasks fetched successfully",
//       tasks,
//       logs,
//     });

//   } catch (error) {
//     logs.push("❌ ERROR OCCURRED: " + error.message);
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//       logs,
//     });
//   }
// };
// const jwt = require("jsonwebtoken");
// const Employee = require("../models/Employee");
// const ProfessionalDetails = require("../models/professionalDetails");

const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const ProfessionalDetails = require("../models/professionalDetails");

// controllers/employeeTaskController.js
const TrainingTask = require("../models/TrainingTask");

exports.getEmployeeAssignedTasks = async (req, res) => {
  try {
    const loggedInEmployee = req.user;  // 🔥 comes from middleware

    const email = loggedInEmployee.officialEmail || loggedInEmployee.email;
    const empId = loggedInEmployee.employeeId || loggedInEmployee._id;

    console.log("Logged-in Email:", email);
    console.log("Logged-in EmployeeId:", empId);

    if (!email && !empId) {
      return res.status(400).json({ msg: "Employee identity missing" });
    }

    // 🔥 Fetch tasks for ONLY this employee
    const tasks = await TrainingTask.find({
      $or: [
        { officialEmail: email },
        { employeeId: empId.toString() }
      ]
    });

    res.status(200).json({
      message: "Tasks fetched successfully",
      count: tasks.length,
      tasks,
      logs: [
        `Logged Email: ${email}`,
        `EmployeeId: ${empId}`,
        `Tasks Found: ${tasks.length}`
      ]
    });

  } catch (err) {
    console.error("TASK FETCH ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
// module.exports = employeeTaskAuth;
