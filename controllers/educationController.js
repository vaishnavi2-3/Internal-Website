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

// -------------------------
// ➕ SAVE / UPSERT EDUCATION (Linked by Token Email)
// -------------------------
const saveEducationDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email; 
    const body = req.body;

    // Attach official email
    body.officialEmail = officialEmail;

    // Convert hasMTech to boolean
    body.hasMTech =
      body.hasMTech === "true" || body.hasMTech === true ? true : false;

    // Upload helper
    const getFileObj = async (field) => {
      if (!req.files?.[field]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    // Required certificates
    const certificate10 = await getFileObj("certificate10");
    const certificate12 = await getFileObj("certificate12");
    const certificateUG = await getFileObj("certificateUG");

    // -------------------------
    // 🌟 MTECH VALIDATION LOGIC
    // -------------------------
    let certificateMTech = null;

    if (body.hasMTech === true) {
      // user marked checkbox
      if (!req.files?.certificateMTech) {
        return res.status(400).json({
          msg: "MTech certificate is required because hasMTech = true",
        });
      }
      certificateMTech = await getFileObj("certificateMTech");
    } else {
      // user does not have MTech → remove fields
      delete body.collegeNameMTech;
      delete body.yearMTech;
      delete body.cgpaMTech;
    }

    const educationData = {
      ...body,
      ...(certificate10 && { certificate10 }),
      ...(certificate12 && { certificate12 }),
      ...(certificateUG && { certificateUG }),
      ...(certificateMTech && { certificateMTech }),
    };

    // Upsert
    const updated = await Education.findOneAndUpdate(
      { officialEmail },
      educationData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "Education details saved successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// -------------------------
// 📌 GET LOGGED-IN USER EDUCATION
// -------------------------
const getMyEducationDetails = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    const record = await Education.findOne({ officialEmail });

    if (!record) {
      return res.status(404).json({ msg: "No education details found" });
    }

    res.status(200).json({
      msg: "Education details fetched",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// -------------------------
// 📌 GET ALL (Admin)
// -------------------------
const getEducationByOfficialEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const record = await Education.findOne({ officialEmail: email });

    if (!record) {
      return res.status(404).json({ msg: "Education details not found" });
    }

    res.status(200).json({
      msg: "Education details fetched by official email",
      data: record,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  saveEducationDetails,
  getEducationByOfficialEmail,
  getMyEducationDetails,
};
