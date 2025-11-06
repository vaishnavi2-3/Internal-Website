const PersonalDetails = require("../models/personalDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// 🔹 Upload file buffer to Azure
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

exports.savePersonalDetails = async (req, res) => {
  try {
    console.log("📥 Incoming body:", req.body);
    const body = req.body;

    const getFileObj = async (field) => {
      if (!req.files?.[field]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    const photoFile = await getFileObj("photo");
    const aadharFile = await getFileObj("aadharUpload");
    const panFile = await getFileObj("panUpload");
    const marriageFile = await getFileObj("marriageCertificate");

    const data = {
      ...body,
      ...(photoFile && { photo: photoFile.path }), // photo stored as String
      ...(aadharFile && { aadharUpload: aadharFile }),
      ...(panFile && { panUpload: panFile }),
      ...(marriageFile && { marriageCertificate: marriageFile }),
    };

    const updated = await PersonalDetails.findOneAndUpdate(
      { email: body.email },
      data,
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "✅ Personal details saved successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error saving personal details:", err);
    res.status(500).json({
      msg: "Server Error",
      error: err.message,
    });
  }
};

// 🟢 Fetch all records
exports.getAllPersonalDetails = async (req, res) => {
  try {
    const allDetails = await PersonalDetails.find();
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

// 🟢 Fetch single record by email
exports.getPersonalDetails = async (req, res) => {
  try {
    const { email } = req.params;
    const record = await PersonalDetails.findOne({ email });

    if (!record) {
      return res.status(404).json({ msg: "❌ Personal details not found" });
    }

    res.status(200).json({
      msg: "✅ Personal details fetched successfully",
      data: record,
    });
  } catch (err) {
    console.error("❌ Error fetching personal details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
