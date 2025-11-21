const TimeEntry = require("../models/TimeEntry");
const TimeSummary = require("../models/TimeSummary");
const { getWeekNumberInMonth } = require("../utils/dateUtils");

exports.updateTimeSummary = async (employeeEmail, date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  // Get all entries for this employee in this month
  const entries = await TimeEntry.find({
    employeeEmail,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  // Prepare maps
  const dayMap = {};
  const weekTotals = [0, 0, 0, 0, 0, 0];
  const workingDaysSet = new Set();

  entries.forEach((entry) => {
    const dateStr = entry.date.toISOString().split("T")[0];
    const week = getWeekNumberInMonth(entry.date) - 1;

    if (!dayMap[dateStr]) dayMap[dateStr] = 0;
    dayMap[dateStr] += entry.hours;

    weekTotals[week] += entry.hours;
    workingDaysSet.add(dateStr);
  });

  // Convert dayMap to array
  const dailyTotals = Object.entries(dayMap).map(([date, totalHours]) => ({
    date,
    totalHours,
  }));

  const monthlyTotal = dailyTotals.reduce((sum, d) => sum + d.totalHours, 0);
  const workingDays = workingDaysSet.size;

  // Save everything in ONE collection
  await TimeSummary.findOneAndUpdate(
    { employeeEmail, month, year },
    {
      employeeEmail,
      month,
      year,
      dailyTotals,
      weeklyTotals: weekTotals,
      monthlyTotal,
      workingDays,
    },
    { upsert: true, new: true }
  );
};
