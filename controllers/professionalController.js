const ProfessionalDetails = require("../models/professionalDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");
//console.log("🔥 Controller LOADED");


// Upload buffer to Azure
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

// Save or update professional details
exports.saveProfessionalDetails = async (req, res) => {
  try {
    const { employeeId, dateOfJoining, role, department, salary, hasExperience } = req.body;

    if (!employeeId) {
      return res.status(400).json({ msg: "❌ Employee ID is required." });
    }

    // Parse experiences safely
    let experiences = [];
    if (req.body.experiences) {
      experiences = typeof req.body.experiences === "string"
        ? JSON.parse(req.body.experiences)
        : req.body.experiences;
    }

    // Handle files for experiences
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];

      // Reliving letter
      const relivingFile = req.files?.find(f => f.fieldname === `experiences[${i}][relivingLetter]`);
      exp.relivingLetter = relivingFile ? await uploadToAzure(relivingFile) : null;

      // Salary slips (can be multiple)
      const slipFiles = req.files?.filter(f => f.fieldname === `experiences[${i}][salarySlips]`) || [];
      exp.salarySlips = [];
      for (const file of slipFiles) {
        const uploaded = await uploadToAzure(file);
        if (uploaded) exp.salarySlips.push(uploaded);
      }
    }

    // Save or update in DB using employeeId
    const updated = await ProfessionalDetails.findOneAndUpdate(
      { employeeId }, // match by employeeId
      { employeeId, dateOfJoining, role, department, salary, hasExperience, experiences },
      { new: true, upsert: true } // create if not exists
    );

    res.status(200).json({
      msg: "✅ Professional details saved successfully",
      data: updated
    });

  } catch (err) {
    console.error("❌ Error saving professional details:", err);

    // Handle duplicate employeeId gracefully
    if (err.code === 11000 && err.keyPattern?.employeeId) {
      return res.status(400).json({ msg: "❌ Employee ID already exists." });
    }

    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Get all professional details
exports.getAllProfessionalDetails = async (req, res) => {
  try {
    const details = await ProfessionalDetails.find();
    console.log(details)
    res.status(200).json(details);
  } catch (err) {
    console.error("❌ Error fetching professional details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Get professional details by employeeId
exports.getProfessionalDetailsByEmpId = async (req, res) => {
  try {
    console.log("🔥 Function getProfessionalDetailsByEmpId executed");

    console.log("🟦 req.params =", req.params);

    const { employeeId } = req.params;
    console.log("🟩 Searching employeeId =", employeeId);

    // Check DB
// const record = await ProfessionalDetails.findOne({
//   employeeId: { $regex: `^${employeeId.trim()}$`, $options: "i" }
// });

const record = await ProfessionalDetails.findOne({employeeId})



console.log(record)

    // if (!record) {
    //   return res.status(404).json({ msg: "Professional details not found." });
    // }

    res.status(200).json({
      msg: "✅ Professional details fetched successfully",
      data: record,
    });
  } 
  catch (error) {
    console.error("❌ Error fetching professional details:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// console.log("🔥 Controller LOADED");
