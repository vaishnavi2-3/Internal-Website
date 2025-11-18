// const ProfessionalDetails = require("../models/professionalDetails");
// const { blobServiceClient, containerName } = require("../config/azureBlob");
// //console.log("🔥 Controller LOADED");


// // Upload buffer to Azure
// async function uploadToAzure(file) {
//   if (!file || !file.buffer) return null;

//   const containerClient = blobServiceClient.getContainerClient(containerName);
//   await containerClient.createIfNotExists({ access: "container" });

//   const blobName = Date.now() + "-" + file.originalname;
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//   await blockBlobClient.uploadData(file.buffer, {
//     blobHTTPHeaders: { blobContentType: file.mimetype }
//   });

//   return {
//     filename: file.originalname,
//     path: blockBlobClient.url,
//     mimetype: file.mimetype,
//     size: file.size
//   };
// }

// // Save or update professional details
// exports.saveProfessionalDetails = async (req, res) => {
//   try {
//     const { employeeId, dateOfJoining, role, department, salary, hasExperience } = req.body;

//     if (!employeeId) {
//       return res.status(400).json({ msg: "❌ Employee ID is required." });
//     }

//     // Parse experiences safely
//     let experiences = [];
//     if (req.body.experiences) {
//       experiences = typeof req.body.experiences === "string"
//         ? JSON.parse(req.body.experiences)
//         : req.body.experiences;
//     }

//     // Handle files for experiences
//     for (let i = 0; i < experiences.length; i++) {
//       const exp = experiences[i];

//       // Reliving letter
//       const relivingFile = req.files?.find(f => f.fieldname === `experiences[${i}][relivingLetter]`);
//       exp.relivingLetter = relivingFile ? await uploadToAzure(relivingFile) : null;

//       // Salary slips (can be multiple)
//       const slipFiles = req.files?.filter(f => f.fieldname === `experiences[${i}][salarySlips]`) || [];
//       exp.salarySlips = [];
//       for (const file of slipFiles) {
//         const uploaded = await uploadToAzure(file);
//         if (uploaded) exp.salarySlips.push(uploaded);
//       }
//     }

//     // Save or update in DB using employeeId
//     const updated = await ProfessionalDetails.findOneAndUpdate(
//       { employeeId }, // match by employeeId
//       { employeeId, dateOfJoining, role, department, salary, hasExperience, experiences },
//       { new: true, upsert: true } // create if not exists
//     );

//     res.status(200).json({
//       msg: "✅ Professional details saved successfully",
//       data: updated
//     });

//   } catch (err) {
//     console.error("❌ Error saving professional details:", err);

//     // Handle duplicate employeeId gracefully
//     if (err.code === 11000 && err.keyPattern?.employeeId) {
//       return res.status(400).json({ msg: "❌ Employee ID already exists." });
//     }

//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

// // Get all professional details
// exports.getAllProfessionalDetails = async (req, res) => {
//   try {
//     const details = await ProfessionalDetails.find();
//     console.log(details)
//     res.status(200).json(details);
//   } catch (err) {
//     console.error("❌ Error fetching professional details:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

// // Get professional details by employeeId
// exports.getProfessionalDetailsByEmpId = async (req, res) => {
//   try {
//     console.log("🔥 Function getProfessionalDetailsByEmpId executed");

//     console.log("🟦 req.params =", req.params);

//     const { employeeId } = req.params;
//     console.log("🟩 Searching employeeId =", employeeId);

//     // Check DB
// // const record = await ProfessionalDetails.findOne({
// //   employeeId: { $regex: `^${employeeId.trim()}$`, $options: "i" }
// // });

// const record = await ProfessionalDetails.findOne({employeeId})



// console.log(record)

//     // if (!record) {
//     //   return res.status(404).json({ msg: "Professional details not found." });
//     // }

//     res.status(200).json({
//       msg: "✅ Professional details fetched successfully",
//       data: record,
//     });
//   } 
//   catch (error) {
//     console.error("❌ Error fetching professional details:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };
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
