const TimeEntry = require("../models/TimeEntry");
const TimeSummary = require("../models/TimeSummary");
const { getWeekNumberInMonth } = require("../utils/dateUtils");

exports.updateTimeSummary = async (officialEmail, date) => {

  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const entries = await TimeEntry.find({
    officialEmail,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  let dayMap = {};
  let weeklyTotals = [0, 0, 0, 0, 0, 0];
  let workingDaysSet = new Set();

  entries.forEach((entry) => {
    const dateStr = entry.date.toISOString().split("T")[0];
    const weekIndex = getWeekNumberInMonth(entry.date) - 1;

    if (!dayMap[dateStr]) dayMap[dateStr] = 0;
    dayMap[dateStr] += entry.hours;

    weeklyTotals[weekIndex] += entry.hours;
    workingDaysSet.add(dateStr);
  });

  const dailyTotals = Object.entries(dayMap).map(([date, totalHours]) => ({
    date,
    totalHours,
  }));

  const monthlyTotal = dailyTotals.reduce((sum, d) => sum + d.totalHours, 0);

  await TimeSummary.findOneAndUpdate(
    { officialEmail, month, year },
    {
      officialEmail,
      month,
      year,
      dailyTotals,
      weeklyTotals,
      monthlyTotal,
      workingDays: workingDaysSet.size,
    },
    { upsert: true, new: true }
  );
};
