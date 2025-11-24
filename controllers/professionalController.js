const ProfessionalDetails = require("../models/professionalDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// Upload to Azure
async function uploadToAzure(file) {
  if (!file || !file.buffer) return null;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: "container" });

  const blobName = Date.now() + "-" + file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype }
  });

  return {
    filename: file.originalname,
    path: blockBlobClient.url,
    mimetype: file.mimetype,
    size: file.size
  };
}

// -----------------------------------------------------
// SAVE / UPDATE Professional Details
// -----------------------------------------------------
exports.saveProfessionalDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const body = req.body;

    body.officialEmail = officialEmail;

    // Convert experiences (array)
    let experiences = [];
    if (body.experiences) {
      experiences = typeof body.experiences === "string"
        ? JSON.parse(body.experiences)
        : body.experiences;
    }

    // Upload files for each experience
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];

      // Relieving letter
      const relFile = req.files?.find(
        (f) => f.fieldname === `experiences[${i}][relivingLetter]`
      );
      exp.relivingLetter = relFile ? await uploadToAzure(relFile) : null;

      // Salary slips
      const slipFiles =
        req.files?.filter(
          (f) => f.fieldname === `experiences[${i}][salarySlips]`
        ) || [];

      exp.salarySlips = [];
      for (const slip of slipFiles) {
        const uploaded = await uploadToAzure(slip);
        if (uploaded) exp.salarySlips.push(uploaded);
      }
    }

    // Save / Update
    const updated = await ProfessionalDetails.findOneAndUpdate(
      { officialEmail },
      {
        officialEmail,
        employeeId: body.employeeId,
        dateOfJoining: body.dateOfJoining,
        role: body.role,
        department: body.department,
        salary: body.salary,
        hasExperience: body.hasExperience,
        experiences,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "Professional details saved successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// -----------------------------------------------------
// GET logged-in employee professional details
// -----------------------------------------------------
exports.getMyProfessionalDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    const record = await ProfessionalDetails.findOne({ officialEmail });

    if (!record) {
      return res.status(404).json({ msg: "Professional details not found" });
    }

    res.status(200).json({
      msg: "Professional details fetched.",
      data: record,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// -----------------------------------------------------
// GET professional details BY EMAIL (for admin or HR)
// -----------------------------------------------------
exports.getProfessionalDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const record = await ProfessionalDetails.findOne({ officialEmail: email });

    if (!record) {
      return res.status(404).json({ msg: "No professional details found" });
    }

    res.status(200).json({
      msg: "Professional details fetched successfully",
      data: record,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// -----------------------------------------------------
// GET ALL Professional Details (ADMIN)
// -----------------------------------------------------
exports.getAllProfessionalDetails = async (req, res) => {
  try {
    const records = await ProfessionalDetails.find();

    res.status(200).json({
      msg: "All professional details fetched",
      count: records.length,
      data: records,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
exports.getProfessionalDetailsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const record = await ProfessionalDetails.findOne({ employeeId });

    if (!record) {
      return res.status(404).json({ msg: "No professional details found for this employeeId" });
    }

    res.status(200).json({
      msg: "Professional details fetched successfully",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// -----------------------------------------------------
// FULL UPDATE Professional Details (PUT)
// -----------------------------------------------------
exports.updateProfessionalDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const body = req.body;

    // Convert experience array
    let experiences = [];
    if (body.experiences) {
      experiences = typeof body.experiences === "string"
        ? JSON.parse(body.experiences)
        : body.experiences;
    }

    // Upload files for each experience (relievingLetter + salarySlips)
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];

      // Relieving letter
      const relFile = req.files?.find(
        (f) => f.fieldname === `experiences[${i}][relivingLetter]`
      );
      exp.relivingLetter = relFile ? await uploadToAzure(relFile) : null;

      // Salary slips
      const slipFiles =
        req.files?.filter(
          (f) => f.fieldname === `experiences[${i}][salarySlips]`
        ) || [];

      exp.salarySlips = [];
      for (const slip of slipFiles) {
        const uploaded = await uploadToAzure(slip);
        if (uploaded) exp.salarySlips.push(uploaded);
      }
    }

    const updateData = {
      employeeId: body.employeeId,
      dateOfJoining: body.dateOfJoining,
      role: body.role,
      department: body.department,
      salary: body.salary,
      hasExperience: body.hasExperience,
      experiences,
    };

    const updated = await ProfessionalDetails.findOneAndUpdate(
      { officialEmail },
      updateData,
      { new: true }
    );

    res.status(200).json({
      msg: "Professional details updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// -----------------------------------------------------
// PARTIAL UPDATE Professional Details (PATCH)
// -----------------------------------------------------
exports.partialUpdateProfessionalDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    let updateData = { ...req.body };

    // If experiences is included, parse it
    if (updateData.experiences) {
      updateData.experiences =
        typeof updateData.experiences === "string"
          ? JSON.parse(updateData.experiences)
          : updateData.experiences;
    }

    // Upload only provided files
    if (updateData.experiences) {
      for (let i = 0; i < updateData.experiences.length; i++) {
        const exp = updateData.experiences[i];

        // Relieving letter
        const relFile = req.files?.find(
          (f) => f.fieldname === `experiences[${i}][relivingLetter]`
        );
        if (relFile) exp.relivingLetter = await uploadToAzure(relFile);

        // Salary slips
        const slipFiles =
          req.files?.filter(
            (f) => f.fieldname === `experiences[${i}][salarySlips]`
          ) || [];

        if (slipFiles.length > 0) {
          exp.salarySlips = [];
          for (const slip of slipFiles) {
            const uploaded = await uploadToAzure(slip);
            if (uploaded) exp.salarySlips.push(uploaded);
          }
        }
      }
    }

    const updated = await ProfessionalDetails.findOneAndUpdate(
      { officialEmail },
      updateData,
      { new: true }
    );

    res.status(200).json({
      msg: "Professional details partially updated",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// -----------------------------------------------------
// DELETE Professional Details
// -----------------------------------------------------
exports.deleteProfessionalDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    await ProfessionalDetails.findOneAndDelete({ officialEmail });

    res.status(200).json({
      msg: "Professional details deleted successfully",
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
