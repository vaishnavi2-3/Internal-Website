const TimeEntry = require("../models/TimeEntry");
const TimeSummary = require("../models/TimeSummary");

exports.updateTimeSummary = async (officialEmail, date) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Fetch all entries for the month
  const entries = await TimeEntry.find({
    officialEmail,
    $expr: {
      $and: [
        { $eq: [{ $month: "$date" }, month] },
        { $eq: [{ $year: "$date" }, year] }
      ]
    }
  });

  if (entries.length === 0) {
    // No entries → delete summary
    await TimeSummary.deleteOne({ officialEmail, month, year });
    return;
  }

  let monthlyTotal = 0;
  let dailyTotals = [];
  let weeklyMap = {}; // week → hours

  entries.forEach((e) => {
    const dateStr = e.date.toISOString().split("T")[0];
    const week = Math.ceil(e.date.getDate() / 7);

    monthlyTotal += e.hours;

    dailyTotals.push({
      date: dateStr,
      hours: e.hours
    });

    weeklyMap[week] = (weeklyMap[week] || 0) + e.hours;
  });

  // Convert weeklyMap → array for 6 weeks
  const weeklyTotals = Array.from({ length: 6 }, (_, i) => ({
    week: i + 1,
    hours: weeklyMap[i + 1] || 0
  }));

  // Save summary (upsert)
  await TimeSummary.findOneAndUpdate(
    { officialEmail, month, year },
    {
      officialEmail,
      month,
      year,
      monthlyTotal,
      workingDays: entries.length,
      dailyTotals,
      weeklyTotals
    },
    { upsert: true, new: true }
  );

  return true;
};
