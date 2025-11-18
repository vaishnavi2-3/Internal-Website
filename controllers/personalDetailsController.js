// const PersonalDetails = require("../models/personalDetails");
// const { blobServiceClient, containerName } = require("../config/azureBlob");

// // Upload to Azure
// async function uploadToAzure(fileBuffer, originalname, mimetype) {
//   try {
//     if (!fileBuffer) return null;

//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     await containerClient.createIfNotExists({ access: "container" });

//     const blobName = Date.now() + "-" + originalname;
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     await blockBlobClient.uploadData(fileBuffer, {
//       blobHTTPHeaders: { blobContentType: mimetype },
//     });

//     return {
//       filename: originalname,
//       path: blockBlobClient.url,
//       mimetype,
//       size: fileBuffer.length,
//     };
//   } catch (err) {
//     console.error("❌ Azure upload failed:", err.message);
//     return null;
//   }
// }

// // 🌟 Save/Update personal details (email only)
// exports.savePersonalDetails = async (req, res) => {
//   try {
//     const emailFromToken = req.user.email; // 👈 ONLY email used
//     const body = req.body;

//     // Force email into body
// body.officialEmail = emailFromToken;  // login email
// // body.email remains personal email (coming from request body)

//     // Convert isMarried
//     body.isMarried = body.isMarried === "true" || body.isMarried === true;

//     // Marriage Certificate validation
//     if (!body.isMarried) {
//       delete body.marriageCertificate;
//     } else {
//       if (!req.files?.marriageCertificate) {
//         return res.status(400).json({
//           msg: "Marriage certificate required because employee is married",
//         });
//       }
//     }

//     const getFileObj = async (field) => {
//       if (!req.files?.[field]) return null;
//       const f = req.files[field][0];
//       return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
//     };

//     const photoFile = await getFileObj("photo");
//     const aadharFile = await getFileObj("aadharUpload");
//     const panFile = await getFileObj("panUpload");
//     const marriageFile = await getFileObj("marriageCertificate");

//     const data = {
//       ...body,
//       ...(photoFile && { photo: photoFile.path }),
//       ...(aadharFile && { aadharUpload: aadharFile }),
//       ...(panFile && { panUpload: panFile }),
//       ...(marriageFile && { marriageCertificate: marriageFile }),
//     };

//     const updated = await PersonalDetails.findOneAndUpdate(
//       { email: emailFromToken }, // 👈 Search only by email
//       data,
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       msg: "✅ Personal details saved successfully",
//       data: updated,
//     });

//   } catch (err) {
//     console.error("❌ Error saving personal details:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

// // 🌟 Get logged-in employee personal details
// exports.getMyPersonalDetails = async (req, res) => {
//   try {
//     const officialEmail = req.user.email;  // login token email

//     const record = await PersonalDetails.findOne({ email: emailFromToken });

//     if (!record) {
//       return res.status(404).json({ msg: "No personal details found" });
//     }

//     res.status(200).json({
//       msg: "Personal details fetched successfully",
//       data: record,
//     });

//   } catch (err) {
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };
// exports.getAllPersonalDetails = async (req, res) => {
//   try {
//     // OPTIONAL: only allow admins - adjust depending on your Employee model
//     if (!req.user?.isAdmin) {
//       return res.status(403).json({ msg: "Forbidden: admin access required" });
//     }

//     const allDetails = await PersonalDetails.find().sort({ createdAt: -1 });
//     res.status(200).json({
//       msg: "✅ All personal details fetched successfully",
//       count: allDetails.length,
//       data: allDetails,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching all personal details:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };
// exports.getPersonalDetailsByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const record = await PersonalDetails.findOne({ officialEmail: email });

//     if (!record) {
//       return res.status(404).json({ msg: "Personal details not found" });
//     }

//     res.status(200).json({
//       msg: "Personal details fetched successfully",
//       data: record,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };
const PersonalDetails = require("../models/personalDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// Upload to Azure
async function uploadToAzure(fileBuffer, originalname, mimetype) {
  try {
    if (!fileBuffer) return null;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    const blobName = Date.now() + "-" + originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    return {
      filename: originalname,
      path: blockBlobClient.url,
      mimetype,
      size: fileBuffer.length,
    };
  } catch (err) {
    console.error("❌ Azure upload failed:", err.message);
    return null;
  }
}

// 🌟 Save / Update Personal Details
exports.savePersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;
    const body = req.body;

    // Store official email
    body.officialEmail = emailFromToken;

    // Convert isMarried to boolean
    body.isMarried =
      body.isMarried === "true" || body.isMarried === true ? true : false;

    // Marriage certificate OPTIONAL
    let marriageFile = null;

    if (body.isMarried) {
      if (req.files?.marriageCertificate) {
        const f = req.files.marriageCertificate[0];
        marriageFile = await uploadToAzure(f.buffer, f.originalname, f.mimetype);
      }
    } else {
      delete body.marriageCertificate;
    }

    // Upload helper
    const getFileObj = async (field) => {
      if (!req.files?.[field]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    const photoFile = await getFileObj("photo");
    const aadharFile = await getFileObj("aadharUpload");
    const panFile = await getFileObj("panUpload");

    const data = {
      ...body,
      ...(photoFile && { photo: photoFile.path }),
      ...(aadharFile && { aadharUpload: aadharFile }),
      ...(panFile && { panUpload: panFile }),
      ...(marriageFile && { marriageCertificate: marriageFile }),
    };

    // ❗ Correct search field = officialEmail
    const updated = await PersonalDetails.findOneAndUpdate(
      { officialEmail: emailFromToken },
      data,
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "✅ Personal details saved successfully",
      data: updated,
    });

  } catch (err) {
    console.error("❌ Error saving personal details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Get logged-in employee personal details
exports.getMyPersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;

    const record = await PersonalDetails.findOne({
      officialEmail: emailFromToken,
    });

    if (!record) {
      return res.status(404).json({ msg: "No personal details found" });
    }

    res.status(200).json({
      msg: "Personal details fetched successfully",
      data: record,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Admin: Get All Personal Details
exports.getAllPersonalDetails = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ msg: "Forbidden: admin access required" });
    }

    const allDetails = await PersonalDetails.find().sort({ createdAt: -1 });

    res.status(200).json({
      msg: "✅ All personal details fetched successfully",
      count: allDetails.length,
      data: allDetails,
    });
  } catch (err) {
    console.error("❌ Error fetching all personal details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Fetch personal details by email
exports.getPersonalDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const record = await PersonalDetails.findOne({
      officialEmail: email,
    });

    if (!record) {
      return res.status(404).json({ msg: "Personal details not found" });
    }

    res.status(200).json({
      msg: "Personal details fetched successfully",
      data: record,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
