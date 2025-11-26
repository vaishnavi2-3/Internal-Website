const Leave = require("../models/leave");
const HrLeave = require("../models/Hrleaves");


exports.createLeaveForEmployee = async ({
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
officialEmail
}) => {
// 1️⃣ Create Employee Leave
const leave = await Leave.create({
employeeId,
employeeName,
employeeDepartment,
employeeDesignation,
officialEmail,
fromDate: start,
toDate: end,
daysApplied,
leaveType,
reason,
file,
status: "Pending",
});


// 2️⃣ Create HR Leave
const hrLeave = await HrLeave.create({
employeeId,
employeeName,
employeeDepartment,
employeeDesignation,
fromDate: start,
toDate: end,
leaveType,
reason,
file,
managerStatus: "Pending",
managerReason: "",
status: "Pending",
hrReason: "",
verified: 0,
});


// 3️⃣ Link HR leave to Employee leave
leave.hrLeaveId = hrLeave._id;
await leave.save();


return { leave, hrLeave };
};


