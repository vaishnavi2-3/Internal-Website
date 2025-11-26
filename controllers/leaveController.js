const ProfessionalDetails = require("../models/professionalDetails");
const calculateLeaves = require("../utils/leaveCalculator");
const { blobServiceClient, containerName } = require("../config/azureBlob");
const { createLeaveForEmployee } = require("../services/leaveService");
const Leave = require("../models/leave");



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
size: file.size,
};
}


exports.createLeave = async (req, res) => {
try {
const officialEmail = req.user.email;


const {
employeeId,
employeeName,
fromDate,
toDate,
leaveType,
reason,
} = req.body;


const prof = await ProfessionalDetails.findOne({ employeeId });
if (!prof) {
return res.status(404).json({ msg: "Professional details not found" });
}



    const employeeDepartment = prof.department;
    const employeeDesignation = prof.role;  // or prof.designation based on your DB

    // 📄 Upload file if exists
    const file = req.file ? await uploadToAzure(req.file) : null;

    // 📅 Calculate leave days
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daysApplied =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;


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
file,
officialEmail,
});


res.status(201).json(result);
} catch (error) {
res.status(500).json({ msg: "Server Error", error: error.message });
}
};


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
// ---------------------------------------------------------------
// GET LATEST LEAVE STATUS USING EMPLOYEE ID
// ---------------------------------------------------------------
exports.getLatestLeaveStatusByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const latestLeave = await Leave.findOne({ employeeId })
                                  .sort({ createdAt: -1 });

    if (!latestLeave) {
      return res.status(404).json({
        msg: "No leave found for this employee"
      });
    }

    res.status(200).json({
      msg: "Latest leave status fetched successfully",
      employeeId,
      status: latestLeave.status,
      leaveDetails: latestLeave
    });

  } catch (error) {
    res.status(500).json({
      msg: "Server Error",
      error: error.message
    });
  }
};
exports.getLeavesByStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query; // ?status=Approved

    const leaves = await Leave.find({ employeeId, status })
                              .sort({ createdAt: -1 });

    res.status(200).json({
      msg: "Leaves fetched successfully",
      count: leaves.length,
      data: leaves
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
exports.approveLeaveByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.params;

    const leave = await Leave.findOne({
      employeeId,
      fromDate: new Date(date)
    });

    if (!leave) {
      return res.status(404).json({ msg: "Leave not found" });
    }

    leave.status = "Approved";
    await leave.save();

    res.status(200).json({
      msg: "Leave approved successfully",
      leave
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

exports.getLeavesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leaves = await Leave.find({ employeeId });

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({ msg: "No leaves found for this employee." });
    }

    return res.status(200).json({
      msg: "Leaves fetched successfully.",
      total: leaves.length,
      data: leaves
    });

  } catch (error) {
    console.error("Error fetching leaves:", error);
    return res.status(500).json({ msg: "Server error", error });
  }
};
exports.previewLeaveFile = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId);
    if (!leave || !leave.file) {
      return res.status(404).json({ msg: "File not found" });
    }

    const fileUrl = leave.file.path;

    // fetch file from Azure Blob
    const response = await fetch(fileUrl);
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    // 🔥 IMPORTANT — show in browser (NOT download)
    res.setHeader("Content-Type", leave.file.mimetype);
    res.setHeader("Content-Disposition", "inline");

    return res.send(fileBuffer);

  } catch (error) {
    console.error("Error loading file:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

