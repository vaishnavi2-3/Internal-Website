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
/**
 * Leave Calculator for Financial Year (APRIL → MARCH)
 * 
 * Rules:
 * ---------------------------------------------------
 * • 1 CL per month (NO carry forward to next FY)
 * • 1 SL per month (carry forward allowed)
 * • Leaves start from employee joining month
 * • unused CL/SL carry forward to next month
 */

module.exports = function calculateLeaves(joiningDate, used) {
  const result = {
    summary: [],
  };

  const today = new Date();

  // 🔥 Start of financial year = April 1 of current year
  const fyStart =
    today.getMonth() + 1 >= 4
      ? new Date(today.getFullYear(), 3, 1)
      : new Date(today.getFullYear() - 1, 3, 1);

  // If employee joined AFTER FY Start → start from joining date
  let start = joiningDate > fyStart ? new Date(joiningDate) : new Date(fyStart);

  // Normalize date to 1st of month
  start = new Date(start.getFullYear(), start.getMonth(), 1);

  const end = new Date(today.getFullYear(), today.getMonth(), 1);

  let balanceCL = 0;
  let balanceSL = 0;

  // 🔥 Loop through all months from start → end
  while (start <= end) {
    const monthKey = start.toISOString().substring(0, 7); // yyyy-mm

    // Each month earns:
// Earn leaves
balanceCL += 1;  // Casual always earns 1 per month

// Sick leave carry-forward logic
if (start.getMonth() === 3) {
  // New financial year → SL carry forward only
  balanceSL = balanceSL;  
} else {
  // Earn 1 SL per month normally
  balanceSL += 1; 
}

    // Deduct used leaves
    const usedCL = used.CL[monthKey] || 0;
    const usedSL = used.SL[monthKey] || 0;

    balanceCL -= usedCL;
    balanceSL -= usedSL;

    // No negative balances
    if (balanceCL < 0) balanceCL = 0;
    if (balanceSL < 0) balanceSL = 0;

    // Push to monthly summary
    result.summary.push({
      month: monthKey,
      earnedCL: 1,
      earnedSL: 1,
      usedCL,
      usedSL,
      balanceCL,
      balanceSL,
    });

    // Move to next month
    start.setMonth(start.getMonth() + 1);

    // If month = April → RESET CL ONLY (NEW FINANCIAL YEAR)
    if (start.getMonth() === 3 && start.getDate() === 1) {
      balanceCL = 0; // Reset casual
      // SL NOT reset (carry forward)
    }
  }

  return result;
};
