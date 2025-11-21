// const fs = require("fs");
// const path = require("path");
// const HrLeave = require("../models/Hrleaves");
// const { BlobServiceClient } = require("@azure/storage-blob");

// const blobService = BlobServiceClient.fromConnectionString(
//   process.env.AZURE_STORAGE_CONNECTION_STRING
// );

// const containerClient = blobService.getContainerClient(
//   process.env.AZURE_CONTAINER_NAME
// );

// // =========================
// // EMPLOYEE APPLY LEAVE (file stored locally but uploaded to Azure)
// // =========================
// exports.applyLeave = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       employeeName,
//       employeeDepartment,
//       employeeDesignation,
//       fromDate,
//       toDate,
//       leaveType,
//       reason,
//     } = req.body;

//     let fileData = null;

//     // If employee uploaded a file
//     if (req.file) {
//       // Local path where multer saved your file
//       const localFilePath = path.join(__dirname, "..", req.file.path);

//       // Read file from disk
//       const fileBuffer = fs.readFileSync(localFilePath);

//       // Blob name for Azure
//       const blobName =
//         Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//       // Upload buffer to Azure
//       await blockBlobClient.upload(fileBuffer, fileBuffer.length);

//       console.log("File uploaded to Azure:", blockBlobClient.url);

//       // Azure file URL
//       fileData = {
//         path: blockBlobClient.url,
//         originalName: req.file.originalname,
//       };

//       // OPTIONAL: Delete local file to save space
//       fs.unlinkSync(localFilePath);
//     }

//     // Save in DB
//     const leave = new HrLeave({
//       employeeId,
//       employeeName,
//       employeeDepartment,
//       employeeDesignation,
//       fromDate,
//       toDate,
//       leaveType,
//       reason,
//       file: fileData,
//     });

//     await leave.save();
//     res.status(201).json(leave);

//   } catch (error) {
//     console.error("Azure Upload Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


// // ================================
// // HR - GET ALL LEAVES
// // ================================
// exports.getAllHrLeaves = async (req, res) => {
//   try {
//     const leaves = await HrLeave.find().sort({ createdAt: -1 });
//     return res.json(leaves);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // MANAGER - APPROVE / REJECT LEAVE
// // ================================
// exports.managerAction = async (req, res) => {
//   try {
//     const { managerStatus, managerReason } = req.body;

//     const updated = await HrLeave.findByIdAndUpdate(
//       req.params.id,
//       { managerStatus, managerReason },
//       { new: true }
//     );

//     return res.json(updated);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - ADD HR REASON
// // ================================
// exports.addHRReason = async (req, res) => {
//   try {
//     const updated = await HrLeave.findByIdAndUpdate(
//       req.params.id,
//       { hrReason: req.body.hrReason },
//       { new: true }
//     );

//     return res.json(updated);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - VERIFY LEAVE (FINAL APPROVAL)
// // ================================
// exports.verifyLeave = async (req, res) => {
//   try {
//     const updated = await HrLeave.findByIdAndUpdate(
//       req.params.id,
//       { verified: 1, status: "Approved" },
//       { new: true }
//     );

//     return res.json(updated);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - CHANGE LEAVE STATUS
// // ================================
// exports.updateHrStatus = async (req, res) => {
//   try {
//     const updated = await HrLeave.findByIdAndUpdate(
//       req.params.id,
//       { status: req.body.status },
//       { new: true }
//     );

//     return res.json(updated);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // WEEKLY ANALYTICS FOR GRAPH
// // ================================
// exports.getWeeklyAnalytics = async (req, res) => {
//   try {
//     const today = new Date();
//     const last7 = new Date(today.setDate(today.getDate() - 7));

//     const data = await HrLeave.aggregate([
//       { $match: { createdAt: { $gte: last7 } } },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           leaves: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     return res.json(data);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };
// exports.cleanInvalidFiles = async (req, res) => {
//   try {
//     // find only those entries that contain old local upload paths
//     const invalidLeaves = await HrLeave.find({
//       "file.path": { $regex: "^/uploads/" }
//     });

//     console.log("INVALID:", invalidLeaves); // debug

//     if (!invalidLeaves || invalidLeaves.length === 0) {
//       return res.json({
//         cleaned: 0,
//         message: "No invalid file paths found."
//       });
//     }

//     for (let leave of invalidLeaves) {
//       leave.file = null;  // remove the invalid file reference
//       await leave.save();
//     }

//     res.json({
//       cleaned: invalidLeaves.length,
//       message: "Invalid file paths cleaned successfully!"
//     });

//   } catch (err) {
//     console.error("Cleanup Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
const fs = require("fs");
const path = require("path");
const HrLeave = require("../models/Hrleaves");
const { BlobServiceClient } = require("@azure/storage-blob");

const blobService = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobService.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

// =========================
// EMPLOYEE APPLY LEAVE (Local→Azure Upload)
// =========================
exports.applyLeave = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeDepartment,
      employeeDesignation,
      fromDate,
      toDate,
      leaveType,
      reason,
    } = req.body;

    let fileData = null;

    if (req.file) {
      const localFilePath = path.join(__dirname, "..", req.file.path);
      const fileBuffer = fs.readFileSync(localFilePath);

      const blobName =
        Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(fileBuffer, fileBuffer.length);

      fileData = {
        path: blockBlobClient.url,
        originalName: req.file.originalname,
      };

      fs.unlinkSync(localFilePath);
    }

    const leave = new HrLeave({
      employeeId,
      employeeName,
      employeeDepartment,
      employeeDesignation,
      fromDate,
      toDate,
      leaveType,
      reason,
      file: fileData,
    });

    await leave.save();
    return res.status(201).json(leave);

  } catch (error) {
    console.error("Azure Upload Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ================================
// HR - GET ALL LEAVES
// ================================
exports.getAllHrLeaves = async (req, res) => {
  try {
    const leaves = await HrLeave.find().sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// MANAGER - APPROVE / REJECT USING employeeId
// ================================
exports.managerAction = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { managerStatus, managerReason } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    latestLeave.managerStatus = managerStatus;
    latestLeave.managerReason = managerReason;
    await latestLeave.save();

    return res.json(latestLeave);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// HR - ADD HR REASON USING employeeId
// ================================
exports.addHRReason = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { hrReason } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    latestLeave.hrReason = hrReason;
    await latestLeave.save();

    return res.json({
      message: "HR reason updated",
      updated: latestLeave,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// HR - VERIFY LEAVE USING employeeId
// ================================
exports.verifyLeave = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    latestLeave.verified = 1;
    latestLeave.status = "Approved";
    await latestLeave.save();

    return res.json(latestLeave);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// HR - CHANGE STATUS USING employeeId
// ================================
exports.updateHrStatus = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { status } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    latestLeave.status = status;
    await latestLeave.save();

    return res.json(latestLeave);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// WEEKLY ANALYTICS FOR GRAPH
// ================================
exports.getWeeklyAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const last7 = new Date(today.setDate(today.getDate() - 7));

    const data = await HrLeave.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          leaves: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// CLEAN INVALID LOCAL PATHS
// ================================
exports.cleanInvalidFiles = async (req, res) => {
  try {
    const invalidLeaves = await HrLeave.find({
      "file.path": { $regex: "uploads", $options: "i" }
    });

    if (!invalidLeaves || invalidLeaves.length === 0) {
      return res.json({ cleaned: 0, message: "No invalid paths found." });
    }

    for (let leave of invalidLeaves) {
      leave.file = null;
      await leave.save();
    }

    res.json({
      cleaned: invalidLeaves.length,
      message: "Invalid file paths cleaned."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
