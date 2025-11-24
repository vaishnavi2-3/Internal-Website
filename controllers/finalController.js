const PersonalDetails = require("../models/personalDetails");
const Education = require("../models/educationDetails");
const ProfessionalDetails = require("../models/professionalDetails");

exports.getAllEmployeesFullDetails = async (req, res) => {
  try {
    const personals = await PersonalDetails.find();

    if (!personals.length) {
      return res.status(404).json({ msg: "No employees found" });
    }

    // Collect all emails
    const emails = personals.map(p => p.officialEmail);

    // Fetch all in one go (NOT inside loop)
    const educationList = await Education.find({ officialEmail: { $in: emails } });
    const professionalList = await ProfessionalDetails.find({ officialEmail: { $in: emails } });

    // Convert lists to map for O(1) lookup
    const educationMap = new Map(educationList.map(ed => [ed.officialEmail, ed]));
    const professionalMap = new Map(professionalList.map(pd => [pd.officialEmail, pd]));

    // Merge results
    const results = personals.map(person => ({
      officialEmail: person.officialEmail,
      personal: person,
      education: educationMap.get(person.officialEmail) || null,
      professional: professionalMap.get(person.officialEmail) || null,
    }));

    res.status(200).json({
      msg: "All employees full details fetched successfully",
      count: results.length,
      data: results,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
exports.getFullDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params; // official email from URL

    if (!email) {
      return res.status(400).json({ msg: "officialEmail is required" });
    }

    const personal = await PersonalDetails.findOne({ officialEmail: email });
    const education = await Education.findOne({ officialEmail: email });
    const professional = await ProfessionalDetails.findOne({ officialEmail: email });

    if (!personal && !education && !professional) {
      return res.status(404).json({ msg: "No details found for this employee" });
    }

    res.status(200).json({
      msg: "Employee full details fetched successfully",
      officialEmail: email,
      personal,
      education,
      professional,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
exports.updateFullDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { personal, education, professional } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "officialEmail is required" });
    }

    let updatedData = {};

    if (personal) {
      updatedData.personal = await PersonalDetails.findOneAndUpdate(
        { officialEmail: email },
        personal,
        { new: true, upsert: true }
      );
    }

    if (education) {
      updatedData.education = await Education.findOneAndUpdate(
        { officialEmail: email },
        education,
        { new: true, upsert: true }
      );
    }

    if (professional) {
      updatedData.professional = await ProfessionalDetails.findOneAndUpdate(
        { officialEmail: email },
        professional,
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      msg: "Employee details updated successfully",
      email,
      data: updatedData
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// -----------------------------------------------------------
// PARTIAL UPDATE (PATCH)
// -----------------------------------------------------------
exports.partialUpdateFullDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { personal, education, professional } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "officialEmail is required" });
    }

    let updatedData = {};

    if (personal) {
      updatedData.personal = await PersonalDetails.findOneAndUpdate(
        { officialEmail: email },
        { $set: personal },
        { new: true }
      );
    }

    if (education) {
      updatedData.education = await Education.findOneAndUpdate(
        { officialEmail: email },
        { $set: education },
        { new: true }
      );
    }

    if (professional) {
      updatedData.professional = await ProfessionalDetails.findOneAndUpdate(
        { officialEmail: email },
        { $set: professional },
        { new: true }
      );
    }

    res.status(200).json({
      msg: "Employee partial details updated successfully",
      email,
      data: updatedData
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// -----------------------------------------------------------
// DELETE ALL DETAILS by Email
// -----------------------------------------------------------
exports.deleteFullDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ msg: "officialEmail is required" });
    }

    await PersonalDetails.findOneAndDelete({ officialEmail: email });
    await Education.findOneAndDelete({ officialEmail: email });
    await ProfessionalDetails.findOneAndDelete({ officialEmail: email });

    res.status(200).json({
      msg: "Employee full details deleted successfully",
      email
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
