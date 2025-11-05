// const EducationDetails = require("../models/educationDetails");
// const path = require("path");

// exports.saveEducationDetails = async (req, res) => {
//   try {
//     const { employee } = req.body;
//     if (!employee) {
//       return res.status(400).json({ msg: "Employee ID is required" });
//     }

//     // Debug logs to verify Multer input
//     console.log("📦 Uploaded files =>", req.files);
//     console.log("📩 Body fields =>", req.body);

//     // Safely get file path helper
//     const getFilePath = (fieldName) => {
//       return req.files && req.files[fieldName] && req.files[fieldName][0]
//         ? req.files[fieldName][0].path.replace(/\\/g, "/") // normalize for Windows
//         : null;
//     };

//     // Build full education data object
//     const educationData = {
//       employee,
//       tenth: {
//         schoolName: req.body.tenthSchoolName || "",
//         yearOfPassing: req.body.tenthYearOfPassing || "",
//         percentage: req.body.tenthPercentage || "",
//         certificate: getFilePath("tenthCertificate"),
//       },
//       intermediate: {
//         collegeName: req.body.intermediateCollegeName || "",
//         yearOfPassing: req.body.intermediateYearOfPassing || "",
//         percentage: req.body.intermediatePercentage || "",
//         certificate: getFilePath("intermediateCertificate"),
//       },
//       degree: {
//         collegeName: req.body.degreeCollegeName || "",
//         yearOfPassing: req.body.degreeYearOfPassing || "",
//         cgpa: req.body.degreeCgpa || "",
//         certificate: getFilePath("degreeCertificate"),
//       },
//       mtech: {
//         collegeName: req.body.mtechCollegeName || "",
//         yearOfPassing: req.body.mtechYearOfPassing || "",
//         cgpa: req.body.mtechCgpa || "",
//         certificate: getFilePath("mtechCertificate"),
//       },
//     };

//     // Save or update (upsert)
//     const updated = await EducationDetails.findOneAndUpdate(
//       { employee },
//       educationData,
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     return res.status(200).json({
//       msg: "✅ Education details saved successfully",
//       data: updated,
//     });
//   } catch (err) {
//     console.error("❌ Error saving education details:", err);
//     return res.status(500).json({ msg: "Server error", error: err.message });
//   }
// };

// require("dotenv").config();
// const { BlobServiceClient } = require("@azure/storage-blob");
// const Education = require("../models/educationDetails");

// // ---------- Azure Blob Setup ----------
// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
// const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

// if (!AZURE_STORAGE_CONNECTION_STRING) {
//   throw new Error("❌ Missing Azure Storage connection string in .env");
// }
// if (!CONTAINER_NAME) {
//   throw new Error("❌ Missing Azure container name in .env");
// }

// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
// const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// // ---------- Helper: Upload buffer to Azure ----------
// async function uploadToAzure(fileBuffer, fileName, mimeType) {
//   const blobName = `${Date.now()}-${fileName}`;
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//   await blockBlobClient.uploadData(fileBuffer, {
//     blobHTTPHeaders: { blobContentType: mimeType },
//   });
//   return blockBlobClient.url;
// }

// // ---------- Controller: Save Education Details ----------
// const saveEducationDetails = async (req, res) => {
//   try {
//     console.log(" Incoming body:", req.body);
//     console.log("Incoming files:", req.files);

//     const files = req.files || {};
//     const body = req.body;

//     // Validate required files
//     const requiredFiles = ["certificate10", "certificate12", "certificateUG"];
//     for (const field of requiredFiles) {
//       if (!files[field] || !files[field][0]) {
//         return res.status(400).json({ msg: `Missing required file: ${field}` });
//       }
//     }

//     // Upload files to Azure
//     const urls = {};
//     for (const field in files) {
//       const file = files[field][0];
//       urls[field] = await uploadToAzure(file.buffer, file.originalname, file.mimetype);
//     }

//     // Save to MongoDB
//     const newEducation = new Education({
//       schoolName10: body.schoolName10,
//       year10: body.year10,
//       cgpa10: body.cgpa10,
//       certificate10: urls.certificate10 || "",

//       interOrDiploma: body.interOrDiploma,
//       collegeName12: body.collegeName12,
//       year12: body.year12,
//       cgpa12: body.cgpa12,
//       certificate12: urls.certificate12 || "",
//       gapReason12: body.gapReason12 || "",

//       collegeNameUG: body.collegeNameUG,
//       yearUG: body.yearUG,
//       cgpaUG: body.cgpaUG,
//       certificateUG: urls.certificateUG || "",
//       gapReasonUG: body.gapReasonUG || "",

//       hasMTech: body.hasMTech === "true" || body.hasMTech === true,
//       collegeNameMTech: body.collegeNameMTech || "",
//       yearMTech: body.yearMTech || "",
//       cgpaMTech: body.cgpaMTech || "",
//       certificateMTech: urls.certificateMTech || "",
//     });

//     const savedEducation = await newEducation.save();

//     res.status(201).json({
//       msg: "✅ Education details saved successfully!",
//       data: savedEducation,
//     });
//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };

// // ---------- Controller: Get All Education Details ----------
// const getAllEducationDetails = async (req, res) => {
//   try {
//     const data = await Education.find();
//     res.status(200).json({ msg: "✅ All education details fetched successfully", data });
//   } catch (error) {
//     console.error("Error fetching all education details:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };

// // ---------- Controller: Get Education Details by ID ----------
// const getEducationDetailsById = async (req, res) => {
//   try {
//     const education = await Education.findById(req.params.id);
//     if (!education) {
//       return res.status(404).json({ msg: "❌ Education record not found" });
//     }
//     res.status(200).json({ msg: "✅ Education record fetched successfully", data: education });
//   } catch (error) {
//     console.error("Error fetching education details by ID:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };

// // ---------- Controller: Get Education Details by Employee ID ----------
// const getEducationDetailsByEmployeeId = async (req, res) => {
//   try {
//     const education = await Education.findOne({ employeeId: req.params.employeeId });
//     if (!education) {
//       return res.status(404).json({ msg: "❌ Education record not found for this employee" });
//     }
//     res.status(200).json({ msg: "✅ Education record fetched successfully", data: education });
//   } catch (error) {
//     console.error("Error fetching education details by employee ID:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };

// // ---------- Exports ----------
// module.exports = {
//   saveEducationDetails,
//   getAllEducationDetails,
//   getEducationDetailsById,
//   getEducationDetailsByEmployeeId,
// };
require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
const Education = require("../models/educationDetails");

// ---------- Azure Blob Setup ----------
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("❌ Missing Azure Storage connection string in .env");
}
if (!CONTAINER_NAME) {
  throw new Error("❌ Missing Azure container name in .env");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// ---------- Helper: Upload buffer to Azure ----------
async function uploadToAzure(fileBuffer, fileName, mimeType) {
  const blobName = `${Date.now()}-${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });
  return blockBlobClient.url;
}

// ---------- Controller: Save Education Details ----------
const saveEducationDetails = async (req, res) => {
  try {
    // 🧩 Debug log: check what was received
    console.log("📥 Incoming body:", req.body);

    if (req.files) {
      const fileSummary = Object.entries(req.files).map(([fieldName, files]) => {
        return {
          field: fieldName,
          files: files.map(f => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size + " bytes",
          })),
        };
      });
      console.log("📎 Uploaded files summary:", JSON.stringify(fileSummary, null, 2));
    } else {
      console.log("⚠️ No files received in request");
    }

    const files = req.files || {};
    const body = req.body;

    // Validate required files
    const requiredFiles = ["certificate10", "certificate12", "certificateUG"];
    for (const field of requiredFiles) {
      if (!files[field] || !files[field][0]) {
        return res.status(400).json({ msg: `❌ Missing required file: ${field}` });
      }
    }

    // Upload files to Azure (if provided)
    const urls = {};
    for (const field in files) {
      const file = files[field][0];
      urls[field] = await uploadToAzure(file.buffer, file.originalname, file.mimetype);
    }

    // Save to MongoDB
    const newEducation = new Education({
      employeeId: body.employeeId,
      schoolName10: body.schoolName10,
      year10: body.year10,
      cgpa10: body.cgpa10,
      certificate10: urls.certificate10 || "",

      interOrDiploma: body.interOrDiploma,
      collegeName12: body.collegeName12,
      year12: body.year12,
      cgpa12: body.cgpa12,
      certificate12: urls.certificate12 || "",
      gapReason12: body.gapReason12 || "",

      collegeNameUG: body.collegeNameUG,
      yearUG: body.yearUG,
      cgpaUG: body.cgpaUG,
      certificateUG: urls.certificateUG || "",
      gapReasonUG: body.gapReasonUG || "",

      hasMTech: body.hasMTech === "true" || body.hasMTech === true,
      collegeNameMTech: body.collegeNameMTech || "",
      yearMTech: body.yearMTech || "",
      cgpaMTech: body.cgpaMTech || "",
      certificateMTech: urls.certificateMTech || "",
    });

    const savedEducation = await newEducation.save();

    res.status(201).json({
      msg: "✅ Education details saved successfully!",
      data: savedEducation,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ---------- Controller: Get All Education Records ----------
const getAllEducationDetails = async (req, res) => {
  try {
    const data = await Education.find();
    res.status(200).json({
      msg: "✅ All education records fetched successfully!",
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching education records:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ---------- Controller: Get Single Record by ID ----------
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
