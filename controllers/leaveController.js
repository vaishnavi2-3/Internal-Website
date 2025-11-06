const Leave = require("../models/leave");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// ✅ Helper: Upload file buffer directly to Azure Blob
async function uploadToAzure(fileBuffer, originalname) {
  try {
    if (!fileBuffer) {
      console.error("❌ No file buffer found");
      return null;
    }

    // Ensure container exists
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    // Create blob name and upload
    const blobName = Date.now() + "-" + originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer);
    console.log("✅ Uploaded to Azure:", blockBlobClient.url);

    return blockBlobClient.url;
  } catch (err) {
    console.error("❌ Azure upload failed:", err.message);
    return null;
  }
}

// 🟢 Create a new leave
exports.createLeave = async (req, res) => {
  try {
    console.log("📩 Incoming leave data:", req.body);
    console.log("📎 Uploaded file:", req.file ? req.file.originalname : "No file");

    const {
      employeeName,
      employeeId,
      fromDate,
      toDate,
      daysApplied,
      leaveType,
      customTypes,
      reason,
    } = req.body;

    // ✅ Upload file to Azure if provided
    let file = null;
    if (req.file) {
      const azureUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
      file = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: azureUrl, // Azure URL
      };
    }

    // ✅ Create new Leave document
    const leave = new Leave({
      employeeName,
      employeeId,
      fromDate,
      toDate,
      daysApplied,
      leaveType,
      customTypes,
      reason,
      file,
    });

    await leave.save();

    res.status(201).json({
      msg: "✅ Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.error("❌ Error saving leave:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
      stack: error.stack, // temporary for debugging
    });
  }
};

// 🟢 Get all leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    res.status(500).json({ msg: "Error fetching leaves" });
  }
};
