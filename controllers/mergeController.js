const Personal = require("../models/personalDetails");
const Education = require("../models/educationDetails");
const Professional = require("../models/professionalDetails");
const Merged = require("../models/mergedDetails");

// 🔁 1️⃣ Merge all collections
exports.mergeCollections = async (req, res) => {
  try {
    const personalData = await Personal.find({});
    const educationData = await Education.find({});
    const professionalData = await Professional.find({});

    const mergedMap = new Map();

    for (const p of personalData)
      mergedMap.set(p.employeeId, { employeeId: p.employeeId, personalDetails: p.toObject() });

    for (const e of educationData) {
      const existing = mergedMap.get(e.employeeId) || { employeeId: e.employeeId };
      existing.educationDetails = e.toObject();
      mergedMap.set(e.employeeId, existing);
    }

    for (const pr of professionalData) {
      const existing = mergedMap.get(pr.employeeId) || { employeeId: pr.employeeId };
      existing.professionalDetails = pr.toObject();
      mergedMap.set(pr.employeeId, existing);
    }

    const mergedArray = Array.from(mergedMap.values());
    await Merged.deleteMany({});
    await Merged.insertMany(mergedArray);

    res.status(200).json({
      success: true,
      message: `Merged ${mergedArray.length} employees successfully.`,
      count: mergedArray.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 👤 2️⃣ Get full details of one employee
exports.getFullDetailsByEmployeeId = async (req, res) => {
  try {
    const { empId } = req.params;
    const emp = await Merged.findOne({ employeeId: empId });
    if (!emp)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.status(200).json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 👥 3️⃣ Get all merged employees
exports.getAllMergedEmployees = async (req, res) => {
  try {
    const employees = await Merged.find({});
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
