// const fs = require("fs");
// const path = require("path");
// const HrLeave = require("../models/Hrleaves");
// const { BlobServiceClient } = require("@azure/storage-blob");
// const Leave = require("../models/leave");  // ✅ ADD THIS


// const blobService = BlobServiceClient.fromConnectionString(
//   process.env.AZURE_STORAGE_CONNECTION_STRING
// );

// const containerClient = blobService.getContainerClient(
//   process.env.AZURE_CONTAINER_NAME
// );

// // =========================
// // EMPLOYEE APPLY LEAVE (Local→Azure Upload)
// // =========================
// // =========================
// // EMPLOYEE APPLY LEAVE (Local→Azure Upload) - FIXED
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

//     if (req.file) {
//       const localFilePath = path.join(__dirname, "..", req.file.path);
//       const fileBuffer = fs.readFileSync(localFilePath);

//       const blobName =
//         Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//       await blockBlobClient.upload(fileBuffer, fileBuffer.length);

//       fileData = {
//         path: blockBlobClient.url,
//         originalName: req.file.originalname,
//       };

//       fs.unlinkSync(localFilePath);
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);
//     const daysApplied = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

//     // 1️⃣ Create HR Leave
//     const hrLeave = await HrLeave.create({
//       employeeId,
//       employeeName,
//       employeeDepartment,
//       employeeDesignation,
//       fromDate: start,
//       toDate: end,
//       leaveType,
//       reason,
//       file: fileData,
//       managerStatus: "Pending",
//       managerReason: "",
//       status: "Sent",
//       hrReason: "",
//       verified: 0
//     });

//     // 2️⃣ Create Employee Leave + link hrLeaveId
//     const empLeave = await Leave.create({
//       employeeId,
//       employeeName,
//       employeeDepartment,
//       employeeDesignation,
//       fromDate: start,
//       toDate: end,
//       daysApplied,
//       leaveType,
//       reason,
//       file: fileData,
//       status: "Sent",
//       hrLeaveId: hrLeave._id
//     });

//     console.log("➡️ NEW Leave Created With hrLeaveId:", empLeave.hrLeaveId);

//     return res.status(201).json({
//       msg: "Leave applied successfully",
//       hrLeave,
//       empLeave
//     });

//   } catch (error) {
//     console.error("Apply Leave Error:", error);
//     return res.status(500).json({ error: error.message });
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
// // MANAGER - APPROVE / REJECT USING employeeId
// // ================================
// exports.managerAction = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;
//     const { managerStatus, managerReason } = req.body;

//     const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found for employee" });
//     }

//     latestLeave.managerStatus = managerStatus;
//     latestLeave.managerReason = managerReason;
//     await latestLeave.save();

//     return res.json(latestLeave);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - ADD HR REASON USING employeeId
// // ================================
// exports.addHRReason = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;
//     const { hrReason } = req.body;

//     const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found for employee" });
//     }

//     latestLeave.hrReason = hrReason;
//     await latestLeave.save();

//     return res.json({
//       message: "HR reason updated",
//       updated: latestLeave,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - VERIFY LEAVE USING employeeId
// // ================================
// exports.verifyLeave = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;

//     // Find latest record in HR leave
//     const latestLeave = await HrLeave.findOne({ employeeId })
//                                      .sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found for employee" });
//     }

//     // Update HR leave
//     latestLeave.status = "Approved";
//     latestLeave.verified = 1;
//     await latestLeave.save();
// console.log("Latest HR Leave ID:", latestLeave._id);

//     // 🔥 AUTO UPDATE EMPLOYEE LEAVE COLLECTION
// const updatedEmployeeLeave = await Leave.findOneAndUpdate(
//   { hrLeaveId: latestLeave._id },
//   { $set: { status: "Approved" } },
//   { new: true }
// );
// console.log("Updated Emp Leave:", updatedEmployeeLeave);


//     return res.json({
//       message: "Leave approved successfully and employee leave updated",
//       hrLeave: latestLeave,
//       employeeLeave: updatedEmployeeLeave
//     });

//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ================================
// // HR - CHANGE STATUS USING employeeId
// // ================================
// exports.updateHrStatus = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;
//     const { status } = req.body;

//     const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found for employee" });
//     }

//     // Update HR leave
//     latestLeave.status = status;
//     await latestLeave.save();

//     // 🔥 Update Employee Leave too
//     await Leave.updateOne(
//       { employeeId, fromDate: latestLeave.fromDate },
//       { $set: { status } }
//     );

//     return res.json({
//       message: "HR status updated & synced",
//       updated: latestLeave,
//     });

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

// // ================================
// // CLEAN INVALID LOCAL PATHS
// // ================================
// exports.cleanInvalidFiles = async (req, res) => {
//   try {
//     const invalidLeaves = await HrLeave.find({
//       "file.path": { $regex: "uploads", $options: "i" }
//     });

//     if (!invalidLeaves || invalidLeaves.length === 0) {
//       return res.json({ cleaned: 0, message: "No invalid paths found." });
//     }

//     for (let leave of invalidLeaves) {
//       leave.file = null;
//       await leave.save();
//     }

//     res.json({
//       cleaned: invalidLeaves.length,
//       message: "Invalid file paths cleaned."
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };
// exports.rejectLeave = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;
//     const { hrReason } = req.body;

//     const latestLeave = await HrLeave.findOne({ employeeId })
//                                      .sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found" });
//     }

//     // Update HR collection
//     latestLeave.status = "Rejected";
//     latestLeave.hrReason = hrReason || "";
//     await latestLeave.save();

//     // 🔥 AUTO UPDATE employee leave collection
//     const updatedEmployeeLeave = await Leave.findOneAndUpdate(
//       {
//         employeeId,
//         fromDate: latestLeave.fromDate
//       },
//       {
//         $set: { status: "Rejected" }
//       },
//       { new: true }
//     );

//     return res.json({
//       message: "Leave rejected and employee leave updated",
//       employeeLeave: updatedEmployeeLeave,
//       hrLeave: latestLeave
//     });

//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };
const fs = require("fs");
const path = require("path");
const HrLeave = require("../models/Hrleaves");
const Leave = require("../models/leave");
const { BlobServiceClient } = require("@azure/storage-blob");
const { createLeaveForEmployee } = require("../services/leaveService");

const blobService = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobService.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

// =========================
// APPLY LEAVE
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

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daysApplied = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = await createLeaveForEmployee({
      employeeId,
      employeeName,
      employeeDepartment,
      employeeDesignation,
      start,
      end,
      daysApplied,
      leaveType,
      reason,
      file: fileData,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Apply Leave Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ================================
// GET ALL HR LEAVES
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
// MANAGER ACTION
// ================================
exports.managerAction = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { managerStatus, managerReason } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId })
      .sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    latestLeave.managerStatus = managerStatus;
    latestLeave.managerReason = managerReason;

    await latestLeave.save();

    return res.json({
      message: "Manager updated leave",
      data: latestLeave,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// HR ADD REASON
// ================================
exports.addHRReason = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { hrReason } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId })
      .sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found" });
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
// HR VERIFY (APPROVE) LEAVE
// ================================
exports.verifyLeave = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    const latestLeave = await HrLeave.findOne({ employeeId })
      .sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found for employee" });
    }

    // Update HR Leave
    latestLeave.status = "Approved";
    latestLeave.verified = 1;
    await latestLeave.save();

    // Update Employee Leave
    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { employeeId },
      { $set: { status: "Approved" } },
      { new: true, sort: { createdAt: -1 } }
    );

    return res.json({
      message: "Leave approved successfully",
      hrLeave: latestLeave,
      employeeLeave: updatedEmployeeLeave,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// HR REJECT LEAVE
// ================================
exports.rejectLeave = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { hrReason } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId })
      .sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found" });
    }

    latestLeave.status = "Rejected";
    latestLeave.hrReason = hrReason;
    await latestLeave.save();

    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { employeeId },
      { $set: { status: "Rejected" } },
      { new: true, sort: { createdAt: -1 } }
    );

    return res.json({
      message: "Leave rejected",
      employeeLeave: updatedEmployeeLeave,
      hrLeave: latestLeave,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// CLEAN INVALID PATHS
// ================================
exports.cleanInvalidFiles = async (req, res) => {
  try {
    const invalidLeaves = await HrLeave.find({
      "file.path": { $regex: "uploads", $options: "i" },
    });

    for (let leave of invalidLeaves) {
      leave.file = null;
      await leave.save();
    }

    res.json({
      cleaned: invalidLeaves.length,
      message: "Invalid file paths cleaned",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ================================
// WEEKLY ANALYTICS
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
// HR UPDATE STATUS
// ================================
exports.updateHrStatus = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { status } = req.body;

    const latestLeave = await HrLeave.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave found" });
    }

    latestLeave.status = status;
    await latestLeave.save();

    // Update employee leave too
    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { employeeId },
      { $set: { status } },
      { new: true, sort: { createdAt: -1 } }
    );

    return res.json({
      message: "Status updated successfully",
      hrLeave: latestLeave,
      employeeLeave: updatedEmployeeLeave
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



