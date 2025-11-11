const PersonalDetails = require("../models/personalDetails");
const EducationDetails = require("../models/educationDetails");
const ProfessionalDetails = require("../models/professionalDetails");

// ✅ Get all or single employee full details
exports.getEmployeeFullDetails = async (req, res) => {
  try {
    const { empId } = req.params;

    let query = {};
    if (empId) query.employeeId = empId;

    // 1️⃣ Get professional details
    const professionals = await ProfessionalDetails.find(query);

    if (professionals.length === 0) {
      return res.status(404).json({ msg: "No employees found" });
    }

    // 2️⃣ For each professional, find matching personal + education details
    const fullDetails = await Promise.all(
      professionals.map(async (prof) => {
        const personal = await PersonalDetails.findOne({ employeeId: prof.employeeId });
        const education = await EducationDetails.findOne({ employeeId: prof.employeeId });

        return {
          employeeId: prof.employeeId,
          professional: prof,
          personal: personal || {},
          education: education || {},
        };
      })
    );

    res.status(200).json({
      count: fullDetails.length,
      data: fullDetails,
    });
  } catch (error) {
    console.error("❌ Error fetching employee details:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
