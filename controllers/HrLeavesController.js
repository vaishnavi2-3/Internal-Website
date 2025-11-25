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
// exports.verifyLeave = async (req, res) => {
//   try {
//     const employeeId = req.params.employeeId;

// const latestLeave = await HrLeave.findOne({
//   employeeId,
//   status: { $in: ["Pending"] }
// }).sort({ createdAt: -1 });

//     if (!latestLeave) {
//       return res.status(404).json({ message: "No leave found for employee" });
//     }

//     // Update HR Leave
//     latestLeave.status = "Approved";
//     latestLeave.verified = 1;
//     await latestLeave.save();

//     // Update Employee Leave
//     const updatedEmployeeLeave = await Leave.findOneAndUpdate(
//       { employeeId },
//       { $set: { status: "Approved" } },
//       { new: true, sort: { createdAt: -1 } }
//     );

//     return res.json({
//       message: "Leave approved successfully",
//       hrLeave: latestLeave,
//       employeeLeave: updatedEmployeeLeave,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };
exports.verifyLeave = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    const latestLeave = await HrLeave.findOne({
      employeeId,
      status: "Pending"
    }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No pending leave found" });
    }

    latestLeave.status = "Approved";
    latestLeave.verified = 1;
    await latestLeave.save();

    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { employeeId },
      { $set: { status: "Approved" } },
      { new: true, sort: { createdAt: -1 } }
    );

    // ⭐ Auto create timesheet leave entries
    await applyLeaveToTimesheet(
      updatedEmployeeLeave.officialEmail,
      updatedEmployeeLeave.fromDate,
      updatedEmployeeLeave.toDate
    );

    return res.json({
      message: "Leave approved and applied to timesheet successfully!",
      hrLeave: latestLeave,
      employeeLeave: updatedEmployeeLeave
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

    const latestLeave = await HrLeave.findOne({
      employeeId,
      status: "Pending"
    }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ message: "No pending leave found" });
    }

    latestLeave.status = "Rejected";
    latestLeave.hrReason = hrReason || "";
    await latestLeave.save();

    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { hrLeaveId: latestLeave._id },
      { $set: { status: "Rejected" } },
      { new: true }
    );

    res.json({
      message: "Leave rejected",
      hrLeave: latestLeave,
      employeeLeave: updatedEmployeeLeave
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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



