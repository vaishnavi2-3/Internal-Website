const Employee = require("../models/Employee");

exports.getTotalEmployees = async (req, res) => {
  try {
    const count = await Employee.countDocuments({ role: "Employee" });

    res.status(200).json({
      totalEmployees: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
