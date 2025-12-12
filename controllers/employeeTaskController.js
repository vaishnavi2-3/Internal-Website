
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const ProfessionalDetails = require("../models/professionalDetails");

// controllers/employeeTaskController.js
const TrainingTask = require("../models/TrainingTask");

exports.getEmployeeAssignedTasks = async (req, res) => {
  try {
    const loggedInEmployee = req.user;

    const email = loggedInEmployee.officialEmail || loggedInEmployee.email;
    const empId = loggedInEmployee.employeeId || loggedInEmployee._id;

    if (!email && !empId) {
      return res.status(400).json({ msg: "Employee identity missing" });
    }

    const tasks = await TrainingTask.find({
      $or: [
        { officialEmail: email },
        { employeeId: empId.toString() }
      ]
    });

    // ⭐⭐ CALCULATE AVERAGE MARKS FOR EACH TASK ⭐⭐
    const updatedTasks = tasks.map(task => {
      if (task.exams && task.exams.length > 0) {
        
        const total = task.exams.reduce((sum, exam) => {
          // handle "70%", "80.5%", "90", "85" safely
          const numeric = parseFloat(exam.marks.toString().replace("%", ""));
          return sum + (isNaN(numeric) ? 0 : numeric);
        }, 0);

        const avg = (total / task.exams.length).toFixed(2) + "%";

        return {
          ...task._doc,
          averageMarks: avg
        };
      }

      return {
        ...task._doc,
        averageMarks: "No Exams"
      };
    });

    res.status(200).json({
      message: "Tasks fetched successfully",
      count: updatedTasks.length,
      tasks: updatedTasks
    });

  } catch (err) {
    console.error("TASK FETCH ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
// module.exports = employeeTaskAuth;
