const mongoose = require("mongoose");

const hrLeaveSchema = new mongoose.Schema(
  {
    employeeId: String,
    employeeName: String,
    employeeDepartment: String,
    employeeDesignation: String,
    // officialEmail: { type: String, required: true },   // ⭐ ADD THIS

    fromDate: Date,
    toDate: Date,
    leaveType: String,
    reason: String,

    file: {
      path: String,
      originalName: String
    },

    managerStatus: { type: String, default: "Pending" },
    managerReason: { type: String, default: "" },

    status: { type: String, default: "Sent" },
    hrReason: { type: String, default: "" },

    verified: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HrLeave", hrLeaveSchema);
