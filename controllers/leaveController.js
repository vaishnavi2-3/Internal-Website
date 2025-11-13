// const Leave = require("../models/leave");
// const ProfessionalDetails = require("../models/professionalDetails");
// const { blobServiceClient, containerName } = require("../config/azureBlob");

// // ✅ Helper: Upload file buffer directly to Azure Blob
// async function uploadToAzure(fileBuffer, originalname) {
//   if (!fileBuffer) return null;
//   const containerClient = blobServiceClient.getContainerClient(containerName);
//   await containerClient.createIfNotExists({ access: "container" });
//   const blobName = Date.now() + "-" + originalname;
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//   await blockBlobClient.uploadData(fileBuffer);
//   return blockBlobClient.url;
// }

// // 🟢 CREATE LEAVE — auto-calculate daysApplied safely
// exports.createLeave = async (req, res) => {
//   try {
//     const {
//       employeeName,
//       employeeId,
//       fromDate,
//       toDate,
//       leaveType,
//       customTypes,
//       reason,
//     } = req.body;

//     if (!employeeId || !fromDate || !toDate || !leaveType) {
//       return res.status(400).json({ msg: "Missing required fields." });
//     }

//     // ✅ Calculate leave duration
//     const start = new Date(fromDate);
//     const end = new Date(toDate);
//     const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

//     // ✅ Get current available casual leaves
//     const leaveBalance = await calculateAvailableCasualLeaves(employeeId);
//     const { earnedLeaves, usedLeaves, remainingLeaves } = leaveBalance;

//     if (leaveType === "Casual" && remainingLeaves < diffDays) {
//       return res.status(400).json({
//         msg: `❌ Not enough casual leaves. Available: ${remainingLeaves}, Requested: ${diffDays}`,
//       });
//     }

//     // ✅ Upload file if provided
//     let file = null;
//     if (req.file) {
//       const containerClient = blobServiceClient.getContainerClient(containerName);
//       await containerClient.createIfNotExists({ access: "container" });
//       const blobName = Date.now() + "-" + req.file.originalname;
//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//       await blockBlobClient.uploadData(req.file.buffer);
//       file = {
//         filename: req.file.originalname,
//         path: blockBlobClient.url,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//       };
//     }

//     // ✅ Create Leave Record
//     const leave = new Leave({
//       employeeName,
//       employeeId,
//       fromDate: start,
//       toDate: end,
//       daysApplied: diffDays,
//       leaveType,
//       customTypes,
//       reason,
//       file,
//       status: "Sent",
//     });

//     await leave.save();

//     res.status(201).json({
//       msg: "✅ Leave applied successfully (Pending HR approval)",
//       leave,
//       leaveBalance,
//     });
//   } catch (error) {
//     console.error("❌ Error saving leave:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };
// // 🟢 HR APPROVE OR REJECT LEAVE
// exports.updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveId } = req.params;
//     const { status } = req.body;

//     const leave = await Leave.findById(leaveId);
//     if (!leave) return res.status(404).json({ msg: "Leave not found" });

//     leave.status = status;
//     await leave.save();

//     // After approval, recalculate updated balance
//     const leaveBalance = await calculateAvailableCasualLeaves(leave.employeeId);

//     res.status(200).json({
//       msg: `✅ Leave ${status} successfully`,
//       leave,
//       leaveBalance,
//     });
//   } catch (error) {
//     console.error("❌ Error updating leave:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };
// // 🟢 Get Leave Summary from Joining Date
// exports.getLeaveSummary = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     const professional = await ProfessionalDetails.findOne({ employeeId });
//     if (!professional)
//       return res.status(404).json({ msg: "Professional details not found for this employee." });

//     const joiningDate = new Date(professional.dateOfJoining);
//     const today = new Date();
//     const yearsWorked = Math.floor((today - joiningDate) / (1000 * 60 * 60 * 24 * 365));
//     const allowedLeaves = (yearsWorked + 1) * 10;

//     const approvedLeaves = await Leave.find({
//       employeeId,
//       status: "Approved",
//       fromDate: { $gte: joiningDate },
//     });

//     const usedLeaves = approvedLeaves.reduce((sum, l) => sum + (l.daysApplied || 0), 0);

//     res.status(200).json({
//       msg: "✅ Leave summary fetched successfully",
//       joiningDate,
//       allowedLeaves,
//       usedLeaves,
//       remainingLeaves: allowedLeaves - usedLeaves,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching leave summary:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };
const Leave = require("../models/leave");
const ProfessionalDetails = require("../models/professionalDetails");
const calculateLeaves = require("../utils/leaveCalculator");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// Upload to Azure
async function uploadToAzure(file) {
  if (!file) return null;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: "container" });

  const blobName = Date.now() + "-" + file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer);

  return {
    filename: file.originalname,
    path: blockBlobClient.url,
    mimetype: file.mimetype,
    size: file.size
  };
}

// ---------------------------------------------------------------
// APPLY LEAVE
// ---------------------------------------------------------------
exports.createLeave = async (req, res) => {
  try {
    const {
      employeeId,    // EMP001, EMP1009 ... (YOU WILL USE THIS)
      employeeName,
      fromDate,
      toDate,
      leaveType,
      reason
    } = req.body;

    if (!employeeId || !fromDate || !toDate || !leaveType) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    // 🔍 Get joining date from professional details
    const prof = await ProfessionalDetails.findOne({ employeeId });
    if (!prof) {
      return res.status(404).json({ msg: "No professional details found for this employee." });
    }

    const joiningDate = new Date(prof.dateOfJoining);

    // 🔢 Calculate number of days
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 🔍 Find approved leaves
    const usedLeavesDB = await Leave.find({ employeeId, status: "Approved" });

    const used = { CL: {}, SL: {} };

    usedLeavesDB.forEach((l) => {
      const monthKey = l.fromDate.toISOString().substring(0, 7);
      const typeKey = l.leaveType === "Casual" ? "CL" : "SL";
      used[typeKey][monthKey] =
        (used[typeKey][monthKey] || 0) + l.daysApplied;
    });

    // ✔ Calculate updated leave summary
    const summary = calculateLeaves(joiningDate, used);
    const latest = summary.summary.at(-1);

    if (leaveType === "Casual" && latest.balanceCL < diffDays) {
      return res.status(400).json({
        msg: `Not enough casual leaves. Available: ${latest.balanceCL}, Required: ${diffDays}`,
      });
    }

    if (leaveType === "Sick" && latest.balanceSL < diffDays) {
      return res.status(400).json({
        msg: `Not enough sick leaves. Available: ${latest.balanceSL}, Required: ${diffDays}`,
      });
    }

    // 📁 Upload file if provided
    let file = null;
    if (req.file) {
      file = {
        filename: req.file.originalname,
        path: await uploadToAzure(req.file.buffer, req.file.originalname),
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    // 🟢 Save leave
    const leave = new Leave({
      employeeId,
      employeeName,
      fromDate: start,
      toDate: end,
      daysApplied: diffDays,
      leaveType,
      reason,
      file,
      status: "Sent",
    });

    await leave.save();

    res.status(201).json({
      msg: "Leave applied successfully",
      summary,
      leave,
    });

  } catch (error) {
    console.error("❌ Error applying leave:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ---------------------------------------------------------------
// HR APPROVE / REJECT
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// LEAVE SUMMARY (JOINING DATE FROM PROFESSIONAL)
// ---------------------------------------------------------------
exports.getLeaveSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 🔍 Get joining date
    const prof = await ProfessionalDetails.findOne({ employeeId });
    if (!prof) {
      return res.status(404).json({ msg: "Professional details not found" });
    }

    const joiningDate = new Date(prof.dateOfJoining);

    // 🔍 Get all leaves for that employee
    const usedLeavesDB = await Leave.find({ employeeId, status: "Approved" });

    const used = { CL: {}, SL: {} };

    usedLeavesDB.forEach((l) => {
      const monthKey = l.fromDate.toISOString().substring(0, 7);
      const typeKey = l.leaveType === "Casual" ? "CL" : "SL";
      used[typeKey][monthKey] =
        (used[typeKey][monthKey] || 0) + l.daysApplied;
    });

    const summary = calculateLeaves(joiningDate, used);

    res.status(200).json({
      msg: "Leave summary fetched successfully",
      employeeId,
      summary,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
exports.updateLeaveByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leave = await Leave.findOne({ employeeId });
    if (!leave) {
      return res.status(404).json({ msg: "Leave record not found" });
    }

    // Update fields dynamically
    Object.keys(req.body).forEach((key) => {
      leave[key] = req.body[key];
    });

    // File update (optional)
    if (req.file) {
      leave.file = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: await uploadToAzure(req.file.buffer, req.file.originalname),
      };
    }

    await leave.save();

    res.status(200).json({
      msg: "Leave updated successfully",
      leave,
    });
  } catch (error) {
    console.error("❌ Error updating leave:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// ---------------------------------------------------------------
// GET ALL LEAVE RECORDS (Admin / HR)
// ---------------------------------------------------------------
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });

    res.status(200).json({
      msg: "All employee leaves fetched successfully",
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("❌ Error fetching all leaves:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

