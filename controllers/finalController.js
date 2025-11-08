const Employee = require("../models/Employee");
const PersonalDetails = require("../models/personalDetails");
const EducationDetails = require("../models/educationDetails");
const ProfessionalDetails = require("../models/professionalDetails");

// 🧩 Get single full employee details
exports.getFullEmployeeDetailsByEmpId = async (req, res) => {
  try {
    const { empId } = req.params;
    console.log("🔍 Fetching full details for:", empId);

    const employee = await Employee.findOne({
      $or: [
        { empId },
        { employeeId: empId },
        { employeeID: empId },
        { EmployeeId: empId },
      ],
    }).select("-password");

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const { email, name, phone } = employee;

    const [personalDetails, educationDetails, professionalDetails] =
      await Promise.all([
        PersonalDetails.findOne({
          $or: [{ email }, { empName: name }, { phoneNumber: phone }].filter(Boolean),
        }),
        EducationDetails.findOne({
          $or: [{ email }, { empName: name }].filter(Boolean),
        }),
        ProfessionalDetails.findOne({
          $or: [{ email }, { empName: name }].filter(Boolean),
        }),
      ]);

    res.status(200).json({
      msg: "Full employee details fetched successfully",
      data: {
        employee,
        personalDetails: personalDetails || "No personal details found",
        educationDetails: educationDetails || "No education details found",
        professionalDetails: professionalDetails || "No professional details found",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching full employee details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🧩 Get all employees with combined details
exports.getAllFullEmployeeDetails = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    if (!employees.length) {
      return res.status(404).json({ msg: "No employees found" });
    }

    // Combine each employee with their other details
    const fullData = await Promise.all(
      employees.map(async (emp) => {
        const { empId, email, name, phone } = emp;
        const [personal, education, professional] = await Promise.all([
          PersonalDetails.findOne({
            $or: [{ email }, { empName: name }, { phoneNumber: phone }].filter(Boolean),
          }),
          EducationDetails.findOne({
            $or: [{ email }, { empName: name }].filter(Boolean),
          }),
          ProfessionalDetails.findOne({
            $or: [{ email }, { empName: name }].filter(Boolean),
          }),
        ]);
        return {
          employee: emp,
          personalDetails: personal || null,
          educationDetails: education || null,
          professionalDetails: professional || null,
        };
      })
    );

    res.status(200).json({
      msg: "All employee full details fetched successfully",
      count: fullData.length,
      data: fullData,
    });
  } catch (err) {
    console.error("❌ Error fetching all full employee details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
