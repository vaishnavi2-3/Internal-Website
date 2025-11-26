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
// APPLY LEAVE (AUTO FETCH DEPT & DESIGNATION)
// =========================
const ProfessionalDetails = require("../models/professionalDetails");

// =========================
// APPLY LEAVE (AUTO FETCH + FIX AUTO DOWNLOAD)
// =========================
exports.applyLeave = async (req, res) => {
  try {
    // 👍 1. Auto fetch logged-in employee details
    const employeeId = req.user.employeeId;  
    const employeeName = req.user.name;
    const officialEmail = req.user.email;

    const { fromDate, toDate, leaveType, reason } = req.body;

    // 2. Fetch professional details
    const prof = await ProfessionalDetails.findOne({ employeeId });

    if (!prof) {
      return res.status(404).json({
        msg: "Professional details not found for this employee",
      });
    }

    const employeeDepartment = prof.department;
    const employeeDesignation = prof.role;

    // 3. File upload
    let fileData = null;

    if (req.file) {
      const localFilePath = path.join(__dirname, "..", req.file.path);
      const fileBuffer = fs.readFileSync(localFilePath);

      const blobName =
        Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: req.file.mimetype,
          blobContentDisposition: "inline"
        },
      });

      fileData = {
        path: blockBlobClient.url,
        originalName: req.file.originalname,
      };

      fs.unlinkSync(localFilePath);
    }

    // 4. Calculate days
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daysApplied =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 5. Create leave record
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
      officialEmail,
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
    const { leaveId } = req.params;
    const { managerStatus, managerReason } = req.body;

    const leave = await HrLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.managerStatus = managerStatus;
    leave.managerReason = managerReason;
    await leave.save();

    return res.json({
      message: "Manager updated leave",
      data: leave,
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
    const { leaveId } = req.params;  
    const { hrReason } = req.body;

    const leave = await HrLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.hrReason = hrReason;
    await leave.save();

    return res.json({
      message: "HR reason updated successfully",
      data: leave,
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
    const { leaveId } = req.params;

    const leave = await HrLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    // Approve HR leave
    leave.status = "Approved";
    leave.verified = 1;
    await leave.save();

    // Update employee leave
    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { hrLeaveId: leaveId },
      { $set: { status: "Approved" } },
      { new: true }
    );

    return res.json({
      message: "Leave approved successfully",
      hrLeave: leave,
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
    const { leaveId } = req.params;
    const { hrReason } = req.body;

    const leave = await HrLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Leave is already processed" });
    }

    // Update HR leave
    leave.status = "Rejected";
    leave.hrReason = hrReason || "";
    await leave.save();

    // Update employee leave
    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { hrLeaveId: leaveId },
      { $set: { status: "Rejected" } },
      { new: true }
    );

    res.json({
      message: "Leave rejected",
      hrLeave: leave,
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
// ================================
// APPROVE LEAVE BY EMPLOYEE ID
// ================================
exports.approveLeaveByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get the latest pending leave for this employee
    const latestLeave = await HrLeave.findOne({
      employeeId,
      status: "Pending"
    }).sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({ msg: "No pending leave found for this employee" });
    }

    // Approve HR Leave
    latestLeave.status = "Approved";
    latestLeave.verified = 1;
    await latestLeave.save();

    // Approve in Employee Leave collection
    const updatedEmployeeLeave = await Leave.findOneAndUpdate(
      { employeeId },
      { $set: { status: "Approved" } },
      { new: true, sort: { createdAt: -1 } }
    );

    return res.json({
      msg: "Leave approved successfully for employee",
      employeeId,
      hrLeave: latestLeave,
      employeeLeave: updatedEmployeeLeave
    });

  } catch (error) {
    console.error("Approve Leave Error:", error);
    return res.status(500).json({ msg: error.message });
  }
};
// ================================
// APPROVE LEAVE BY LEAVE ID
// ================================
exports.approveLeaveByLeaveId = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await HrLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ msg: "Leave not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ msg: "Leave is already processed" });
    }

    // Approve HR Leave
    leave.status = "Approved";
    leave.verified = 1;
    await leave.save();

    // Update employee leave record
    await Leave.findOneAndUpdate(
      { hrLeaveId: leaveId },
      { $set: { status: "Approved" } },
      { new: true }
    );

    res.json({
      msg: "Leave approved by Leave ID",
      leave,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



