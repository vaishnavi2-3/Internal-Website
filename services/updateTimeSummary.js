const TimeEntry = require("../models/TimeEntry");
const TimeSummary = require("../models/TimeSummary");

exports.updateTimeSummary = async (officialEmail, date) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Fetch all entries for month
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
    await TimeSummary.deleteOne({ officialEmail, month, year });
    return;
  }

  let monthlyTotal = 0;
  let dailyMap = {};       // date → totalHours
  let weeklyMap = {};      // week → totalHours

  entries.forEach((e) => {
    const dateStr = e.date.toISOString().split("T")[0];
    const week = Math.ceil(e.date.getDate() / 7);

    // Cap hours to MAX 9
    const cappedHours = Math.min(e.hours, 9);

    // Daily total
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + cappedHours;

    // Weekly total
    weeklyMap[week] = (weeklyMap[week] || 0) + cappedHours;

    // Monthly total
    monthlyTotal += cappedHours;
  });

  // Convert daily map → array
  const dailyTotals = Object.keys(dailyMap).map((d) => ({
    date: d,
    hours: dailyMap[d],
  }));

  // Weekly totals (1 to 6)
  const weeklyTotals = Array.from({ length: 6 }, (_, i) => ({
    week: i + 1,
    hours: weeklyMap[i + 1] || 0,
  }));

  // Working days = unique dates
  const workingDays = Object.keys(dailyMap).length;

  await TimeSummary.findOneAndUpdate(
    { officialEmail, month, year },
    {
      officialEmail,
      month,
      year,
      monthlyTotal,
      workingDays,
      dailyTotals,
      weeklyTotals,
    },
    { upsert: true, new: true }
  );
};
