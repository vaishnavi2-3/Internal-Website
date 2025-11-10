// const Education = require("../models/educationDetails");
// const { blobServiceClient, containerName } = require("../config/azureBlob");

// // ✅ Helper to upload buffer to Azure Blob
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

// // 🟢 Create / Update Education Details
// const saveEducationDetails = async (req, res) => {
//   try {
//     console.log("📩 Incoming Education Data:", req.body);

//     const {
//       employeeId,
//       schoolName10,
//       year10,
//       cgpa10,
//       interOrDiploma,
//       collegeName12,
//       year12,
//       cgpa12,
//       gapReason12,
//       collegeNameUG,
//       yearUG,
//       cgpaUG,
//       gapReasonUG,
//       hasMTech,
//       collegeNameMTech,
//       yearMTech,
//       cgpaMTech,
//     } = req.body;

//     // ✅ Convert uploaded files into structured objects
//     const getFileObj = async (field) => {
//       if (!req.files?.[field]) return null;
//       const f = req.files[field][0];
//       return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
//     };

//     const certificate10 = await getFileObj("certificate10");
//     const certificate12 = await getFileObj("certificate12");
//     const certificateUG = await getFileObj("certificateUG");
//     const certificateMTech = await getFileObj("certificateMTech");

//     // ✅ Construct final data object
//     const educationData = {
//       employeeId,
//       schoolName10,
//       year10,
//       cgpa10,
//       certificate10,
//       interOrDiploma,
//       collegeName12,
//       year12,
//       cgpa12,
//       certificate12,
//       gapReason12,
//       collegeNameUG,
//       yearUG,
//       cgpaUG,
//       certificateUG,
//       gapReasonUG,
//       hasMTech,
//       collegeNameMTech,
//       yearMTech,
//       cgpaMTech,
//       certificateMTech,
//     };

//     const updated = await Education.findOneAndUpdate(
//       { employeeId },
//       educationData,
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       msg: "✅ Education details saved successfully",
//       data: updated,
//     });
//   } catch (error) {
//     console.error("❌ Error saving education:", error);
//     res.status(500).json({
//       msg: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // ---------- Controller: Get All Education Records ----------


// // Get all education details
// const getAllEducationDetails = async (req, res) => {
//   try {
//     const educationRecords = await Education.find(); // ✅ Fixed variable name
//     res.status(200).json({
//       success: true,
//       count: educationRecords.length,
//       data: educationRecords,
//     });
//   } catch (error) {
//     console.error("Error fetching education records:", error);
//     res.status(500).json({
//       msg: "Error fetching education records",
//       error: error.message,
//     });
//   }
// };





// // ---------- Controller: Get Single Record by ID ----------
// const getEducationDetailsById = async (req, res) => {
//   try {
//     const record = await Education.findById(req.params.id);
//     if (!record) {
//       return res.status(404).json({ msg: "❌ Record not found" });
//     }
//     res.status(200).json({
//       msg: "✅ Education record fetched successfully!",
//       data: record,
//     });
//   } catch (error) {
//     console.error("Error fetching education record:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };

// module.exports = {
//   saveEducationDetails,
//   getAllEducationDetails,
//   getEducationDetailsById,
// };
const Education = require("../models/educationDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// Upload to Azure Blob
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

// Save new education record (no overwrite)
const saveEducationDetails = async (req, res) => {
  try {
    const getFileObj = async (field) => {
      if (!req.files?.[field]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    const certificate10 = await getFileObj("certificate10");
    const certificate12 = await getFileObj("certificate12");
    const certificateUG = await getFileObj("certificateUG");
    const certificateMTech = await getFileObj("certificateMTech");

    const educationData = {
      employeeId: req.body.employeeId,
      schoolName10: req.body.schoolName10,
      year10: req.body.year10,
      cgpa10: req.body.cgpa10,
      certificate10,
      interOrDiploma: req.body.interOrDiploma,
      collegeName12: req.body.collegeName12,
      year12: req.body.year12,
      cgpa12: req.body.cgpa12,
      certificate12,
      gapReason12: req.body.gapReason12,
      collegeNameUG: req.body.collegeNameUG,
      yearUG: req.body.yearUG,
      cgpaUG: req.body.cgpaUG,
      certificateUG,
      gapReasonUG: req.body.gapReasonUG,
      hasMTech: req.body.hasMTech,
      collegeNameMTech: req.body.collegeNameMTech,
      yearMTech: req.body.yearMTech,
      cgpaMTech: req.body.cgpaMTech,
      certificateMTech,
    };

    const newEducation = new Education(educationData); // ✅ create new record
    await newEducation.save();

    res.status(201).json({
      msg: "✅ Education details added successfully",
      data: newEducation,
    });
  } catch (error) {
    console.error("❌ Error saving education:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get all education records
const getAllEducationDetails = async (req, res) => {
  try {
    const educationRecords = await Education.find().populate("employeeId");
    res.status(200).json({
      success: true,
      count: educationRecords.length,
      data: educationRecords,
    });
  } catch (error) {
    console.error("Error fetching education records:", error);
    res.status(500).json({
      msg: "Error fetching education records",
      error: error.message,
    });
  }
};

// Get by ID
const getEducationDetailsById = async (req, res) => {
  try {
    const record = await Education.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ msg: "❌ Record not found" });
    }
    res.status(200).json({
      msg: "✅ Education record fetched successfully!",
      data: record,
    });
  } catch (error) {
    console.error("Error fetching education record:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  saveEducationDetails,
  getAllEducationDetails,
  getEducationDetailsById,
};
