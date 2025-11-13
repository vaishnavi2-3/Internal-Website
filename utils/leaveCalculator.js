// const Leave = require("../models/leave");
// const ProfessionalDetails = require("../models/professionalDetails");

// /**
//  * Calculate available casual leaves for the current year
//  * Each employee earns 1 casual leave per month, max 12 per year.
//  * Unused leaves roll over automatically each month.
//  */
// exports.calculateAvailableCasualLeaves = async (employeeId) => {
//   const professional = await ProfessionalDetails.findOne({ employeeId });
//   if (!professional) throw new Error("Professional details not found");

//   const joiningDate = new Date(professional.dateOfJoining);
//   const today = new Date();

//   // Start of current year
//   const startOfYear = new Date(today.getFullYear(), 0, 1);

//   // If employee joined this year, start from joining date
//   const startDate = joiningDate > startOfYear ? joiningDate : startOfYear;

//   // Calculate how many months completed since startDate till today
//   const monthsCompleted =
//     (today.getFullYear() - startDate.getFullYear()) * 12 +
//     (today.getMonth() - startDate.getMonth()) + 1;

//   // Earned leaves (1 per month)
//   const earnedLeaves = Math.min(monthsCompleted, 12);

//   // Find all approved leaves for this year
//   const approvedLeaves = await Leave.find({
//     employeeId,
//     status: "Approved",
//     fromDate: { $gte: startOfYear },
//   });

//   const usedLeaves = approvedLeaves.reduce(
//     (sum, l) => sum + (l.daysApplied || 0),
//     0
//   );

//   const remainingLeaves = Math.max(earnedLeaves - usedLeaves, 0);

//   return {
//     earnedLeaves,
//     usedLeaves,
//     remainingLeaves,
//     joiningDate,
//   };
// };
const moment = require("moment");

function calculateLeaves(joiningDate, usedLeaves = { CL: {}, SL: {} }) {
  const join = moment(joiningDate);
  const now = moment();

  let fyStart, fyEnd;

  // Determine financial year (April -> March)
  if (now.month() + 1 < 4) {
    fyStart = moment(`${now.year() - 1}-04-01`);
    fyEnd = moment(`${now.year()}-03-31`);
  } else {
    fyStart = moment(`${now.year()}-04-01`);
    fyEnd = moment(`${now.year() + 1}-03-31`);
  }

  // Leave starts from joining month or FY start
  const startDate = join.isAfter(fyStart)
    ? join.clone().startOf("month")
    : fyStart.clone();

  let date = startDate.clone();
  let CL_balance = 0;
  let SL_balance = 0;

  let summary = [];

  while (date.isSameOrBefore(fyEnd)) {
    const monthKey = date.format("YYYY-MM");

    const usedCL = usedLeaves.CL?.[monthKey] || 0;
    const usedSL = usedLeaves.SL?.[monthKey] || 0;

    // Earn monthly leaves
    CL_balance = CL_balance + 1 - usedCL;
    SL_balance = SL_balance + 1 - usedSL;

    if (CL_balance < 0) CL_balance = 0;
    if (SL_balance < 0) SL_balance = 0;

    summary.push({
      month: monthKey,
      earnedCL: 1,
      usedCL,
      balanceCL: CL_balance,

      earnedSL: 1,
      usedSL,
      balanceSL: SL_balance
    });

    date.add(1, "month");
  }

  // END OF FY RULES
  const finalCL = 0; // ❌ Casual leaves reset every April 1
  const finalSL = SL_balance; // ✔ Sick leaves carry forward

  return {
    financialYearStart: fyStart.format("YYYY-MM-DD"),
    financialYearEnd: fyEnd.format("YYYY-MM-DD"),
    summary,
    closingBalance: {
      CL: finalCL,
      SL: finalSL
    }
  };
}

module.exports = calculateLeaves;
