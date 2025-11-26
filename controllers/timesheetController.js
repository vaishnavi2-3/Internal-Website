
const mongoose = require('mongoose');
const TimeEntry = require('../models/TimeEntry');
const TimeSummary = require('../models/TimeSummary');
const Leave = require('../models/leave');
const { updateTimeSummary } = require("../services/updateTimeSummary"); // <-- ✔ REQUIRED

const MAX_HOURS_PER_DAY = 9;

// Validate and normalize incoming date to midnight (local)
const normalizeDate = (input) => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  d.setHours(0, 0, 0, 0);
  return d;
};

// Sum hours for a given officialEmail and date. Optionally exclude an entryId (when updating)
const getDailyTotal = async (officialEmail, date, excludeEntryId = null) => {
  const start = normalizeDate(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const match = {
    officialEmail,
    date: { $gte: start, $lt: end }
  };

  if (excludeEntryId) {
    if (mongoose.Types.ObjectId.isValid(excludeEntryId)) {
      match._id = { $ne: mongoose.Types.ObjectId(excludeEntryId) };
    } else {
      // If invalid id provided, treat it as no exclusion (safer than throwing here)
    }
  }

  const res = await TimeEntry.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$hours' } } }
  ]);

  return (res[0] && res[0].total) ? res[0].total : 0;
};

// Check approved leave for the date
const isDateOnApprovedLeave = async (officialEmail, date) => {
  const d = normalizeDate(date);

  const leave = await Leave.findOne({
    officialEmail,
    status: 'Approved',
    fromDate: { $lte: d },
    toDate: { $gte: d }
  });

  return !!leave;
};

// updateTimeSummary: recalculates the whole month for the given date
exports.updateTimeSummary = async (officialEmail, date) => {
  const d = normalizeDate(date);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  // fetch all entries for the month
  const entries = await TimeEntry.find({
    officialEmail,
    $expr: {
      $and: [
        { $eq: [{ $month: '$date' }, month] },
        { $eq: [{ $year: '$date' }, year] }
      ]
    }
  }).lean();

  if (!entries.length) {
    await TimeSummary.deleteOne({ officialEmail, month, year });
    return null;
  }

  // Build raw daily totals first (sum of raw hours per date)
  const rawDailyMap = {}; // dateStr -> total raw hours (before capping)
  for (const e of entries) {
    const dateStr = new Date(e.date).toISOString().split('T')[0];
    rawDailyMap[dateStr] = (rawDailyMap[dateStr] || 0) + (Number(e.hours) || 0);
  }

  // Cap daily totals to MAX and compute weekly & monthly from capped values
  const finalDailyTotals = [];
  const cappedWeeklyMap = {}; // week -> total capped hours
  let finalMonthlyTotal = 0;

  const sortedDates = Object.keys(rawDailyMap).sort();
  for (const dateStr of sortedDates) {
    const raw = rawDailyMap[dateStr];
    const cappedDayTotal = Math.min(raw, MAX_HOURS_PER_DAY);
    finalDailyTotals.push({ date: dateStr, hours: cappedDayTotal });
    finalMonthlyTotal += cappedDayTotal;

    const day = parseInt(dateStr.split('-')[2], 10);
    const week = Math.ceil(day / 7);
    cappedWeeklyMap[week] = (cappedWeeklyMap[week] || 0) + cappedDayTotal;
  }

  const weeklyTotals = Array.from({ length: 6 }, (_, i) => ({
    week: i + 1,
    hours: cappedWeeklyMap[i + 1] || 0
  }));

  const workingDays = finalDailyTotals.length;

  const updated = await TimeSummary.findOneAndUpdate(
    { officialEmail, month, year },
    {
      officialEmail,
      month,
      year,
      monthlyTotal: finalMonthlyTotal,
      workingDays,
      dailyTotals: finalDailyTotals,
      weeklyTotals
    },
    { upsert: true, new: true }
  );

  return updated;
};

// ---------------------- Controller Handlers ----------------------

exports.createTimeEntry = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { date, category, projectName, projectCode, projectType, hours } = req.body;

    if (!date) return res.status(400).json({ msg: 'Date is required' });
    if (!category || !projectName || !projectCode || !projectType) {
      return res.status(400).json({ msg: 'category, projectName, projectCode and projectType are required' });
    }
    if (typeof hours !== 'number' || hours <= 0) {
      return res.status(400).json({ msg: 'hours must be a positive number' });
    }

    const normalized = normalizeDate(date);

    // block if approved leave exists
    if (await isDateOnApprovedLeave(officialEmail, normalized)) {
      return res.status(400).json({ msg: `Cannot create timesheet for ${normalized.toISOString().split('T')[0]}. Approved leave exists.` });
    }

    // check daily total and enforce cap
    const existingTotal = await getDailyTotal(officialEmail, normalized);
    const remaining = MAX_HOURS_PER_DAY - existingTotal;

    if (remaining <= 0) {
      return res.status(400).json({ msg: `Daily cap reached (${MAX_HOURS_PER_DAY} hrs). Cannot add more hours for this date.` });
    }

    if (hours > remaining) {
      return res.status(400).json({ msg: `Adding ${hours} hrs will exceed daily cap. You can add up to ${remaining} hrs for this date.` });
    }

    const timeEntry = await TimeEntry.create({
      officialEmail,
      date: normalized,
      category,
      projectName,
      projectCode,
      projectType,
      hours
    });

    // update summary for month
    await exports.updateTimeSummary(officialEmail, normalized);

    res.status(201).json({ msg: 'Timesheet created successfully', timeEntry });
  } catch (err) {
    console.error(err);
    const message = err.message || 'Error creating timesheet';
    res.status(500).json({ msg: message });
  }
};

exports.getMyTimeEntries = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const entries = await TimeEntry.find({ officialEmail }).sort({ date: -1 });
    if (!entries.length) return res.status(404).json({ msg: 'No timesheet entries found.' });
    res.json({ count: entries.length, entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching entries', error: err.message });
  }
};

exports.updateTimeEntryByEmail = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { date, hours, category, projectName, projectCode, projectType } = req.body;
    const { id } = req.params; // expecting /timesheet/:id
    if (!id) return res.status(400).json({ msg: 'Entry id is required in params' });

    if (!date) return res.status(400).json({ msg: "Date is required" });
        const formattedDate = new Date(date);

    
    // 1️⃣ Check existing entry first
    const existingEntry = await TimeEntry.findOne({ officialEmail, date: formattedDate });

    // 🔥 BLOCK if timesheet entry is locked (leave day)
    if (existingEntry?.isLocked) {
      return res.status(403).json({
        msg: "⛔ Timesheet cannot be modified on approved leave days"
      });
    }

    const leaveExists = await Leave.findOne({
      officialEmail: officialEmail,
      status: "Approved",
      fromDate: { $lte: formattedDate },   // 🔥 UPDATE
      toDate: { $gte: formattedDate }      // 🔥 UPDATE
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Timesheet cannot be updated. Leave approved for ${date}.`
      });
    }

    //update timesheet
    const updatedEntry = await TimeEntry.findOneAndUpdate(
    { officialEmail, date: formattedDate },
    { ...req.body, date: formattedDate },
    { new: true, runValidators: true}
    );

   if (!updatedEntry) {
    return res.status(404).json({ msg: "No timesheet found for this date."});
   }

   //update summary
   await updateTimeSummary(officialEmail, formattedDate);
    const normalized = normalizeDate(payload.date);

    // block if leave exists
    if (await isDateOnApprovedLeave(officialEmail, normalized)) {
      return res.status(400).json({ msg: `Timesheet cannot be updated. Leave approved for ${normalized.toISOString().split('T')[0]}.` });
    }

    // ensure entry exists and belongs to user
    const existing = await TimeEntry.findOne({ _id: id, officialEmail });
    if (!existing) return res.status(404).json({ msg: 'Timesheet entry not found.' });

    // check daily total excluding this entry
    const existingTotalExcluding = await getDailyTotal(officialEmail, normalized, id);
    const newHours = payload.hours !== undefined ? payload.hours : existing.hours;

    const remaining = MAX_HOURS_PER_DAY - existingTotalExcluding;
    if (remaining <= 0) return res.status(400).json({ msg: `Daily cap reached (${MAX_HOURS_PER_DAY} hrs) for this date.` });
    if (newHours > remaining) return res.status(400).json({ msg: `Updating to ${newHours} hrs will exceed daily cap. You can set up to ${remaining} hrs for this date.` });

    // perform update
    const updated = await TimeEntry.findOneAndUpdate(
      { _id: id, officialEmail },
      { ...payload, date: normalized },
      { new: true, runValidators: true }
    );

    // update summary for month(s) - if date changed, update both old and new month
    await exports.updateTimeSummary(officialEmail, normalized);
    const oldDate = normalizeDate(existing.date);
    if (oldDate.getMonth() !== normalized.getMonth() || oldDate.getFullYear() !== normalized.getFullYear()) {
      await exports.updateTimeSummary(officialEmail, oldDate);
    }

    res.json({ msg: 'Timesheet updated', updatedEntry: updated });
  } catch (err) {
    console.error(err);
    const message = err.message || 'Error updating timesheet';
    res.status(500).json({ msg: message });
  }
};

exports.patchTimeEntryByEmail = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { id } = req.params; // expecting /timesheet/:id/patch
    if (!id) return res.status(400).json({ msg: 'Entry id is required in params' });

    const payload = { ...req.body };

    const existingEntry = await TimeEntry.findOne({ officialEmail, date: formattedDate });

// 🔥 ADD HERE
if (existingEntry?.isLocked) {
  return res.status(403).json({
    msg: "⛔ Timesheet cannot be modified on approved leave days"
  });
}


    const newDate = payload.date ? normalizeDate(payload.date) : normalizeDate(existing.date);
    const newHours = payload.hours !== undefined ? payload.hours : existing.hours;

    if (await isDateOnApprovedLeave(officialEmail, newDate)) {
      return res.status(400).json({ msg: `Cannot update timesheet. Leave approved for ${newDate.toISOString().split('T')[0]}.` });
    }

    const existingTotalExcluding = await getDailyTotal(officialEmail, newDate, id);
    const remaining = MAX_HOURS_PER_DAY - existingTotalExcluding;
    if (remaining <= 0) return res.status(400).json({ msg: `Daily cap reached (${MAX_HOURS_PER_DAY} hrs) for this date.` });
    if (newHours > remaining) return res.status(400).json({ msg: `Updating to ${newHours} hrs will exceed daily cap. You can set up to ${remaining} hrs for this date.` });

    const updated = await TimeEntry.findOneAndUpdate(
      { _id: id, officialEmail },
      { $set: { ...payload, date: newDate } },
      { new: true, runValidators: true }
    );

    // update summaries for affected months
    await exports.updateTimeSummary(officialEmail, newDate);
    const oldDate = normalizeDate(existing.date);
    if (oldDate.getMonth() !== newDate.getMonth() || oldDate.getFullYear() !== newDate.getFullYear()) {
      await exports.updateTimeSummary(officialEmail, oldDate);
    }

    res.json({ msg: 'Timesheet partially updated', updatedEntry: updated });
  } catch (err) {
    console.error(err);
    const message = err.message || 'Error patching timesheet';
    res.status(500).json({ msg: message });
  }
};

exports.deleteTimeEntry = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: 'Entry id is required in params' });

    const existing = await TimeEntry.findOneAndDelete({ _id: id, officialEmail });
    if (!existing) return res.status(404).json({ msg: 'Timesheet entry not found.' });

    // update month summary
    const oldDate = normalizeDate(existing.date);
    await exports.updateTimeSummary(officialEmail, oldDate);

    res.json({ msg: 'Timesheet deleted', deletedEntry: existing });
  } catch (err) {
    console.error(err);
    const message = err.message || 'Error deleting timesheet';
    res.status(500).json({ msg: message });
  }
};

// ----- Summary and admin endpoints -----

exports.getMonthlySummary = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!month || !year) return res.status(400).json({ msg: 'month and year are required' });

    const summary = await TimeSummary.findOne({ officialEmail, month, year });
    if (!summary) return res.status(404).json({ msg: 'No time summary found for this month.' });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getFilledEmployeesByMonth = async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!month || !year) return res.status(400).json({ msg: 'month and year are required' });

    const employees = await TimeSummary.find({ month, year, dailyTotals: { $exists: true, $ne: [] } })
      .select('officialEmail monthlyTotal weeklyTotals workingDays dailyTotals');

    res.json({ count: employees.length, employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getSummaryByEmail = async (req, res) => {
  try {
    const { email, month, year } = req.query;
    if (!email || !month || !year) return res.status(400).json({ msg: 'email, month and year are required' });

    const summary = await TimeSummary.findOne({ officialEmail: email, month: parseInt(month, 10), year: parseInt(year, 10) });
    if (!summary) return res.status(404).json({ msg: 'No summary found' });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllEmployeeMonthlySummaries = async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!month || !year) return res.status(400).json({ msg: 'month and year are required' });

    const list = await TimeSummary.find({ month, year, dailyTotals: { $exists: true, $ne: [] } })
      .select('officialEmail monthlyTotal weeklyTotals workingDays dailyTotals');

    res.json({ count: list.length, summaries: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getMonthYearList = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const list = await TimeSummary.find({ officialEmail })
      .select('month year monthlyTotal workingDays')
      .sort({ year: -1, month: -1 });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getMonthYearFromTimeEntry = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!month || !year) return res.status(400).json({ msg: 'month and year are required' });

    const summary = await TimeEntry.aggregate([
      {
        $match: {
          officialEmail,
          $expr: {
            $and: [
              { $eq: [{ $month: "$date" }, month] },
              { $eq: [{ $year: "$date" }, year] }
            ]
          }
        }
      },
      {
        $project: {
          date: 1,
          hours: 1,
          dayString: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          week: { $ceil: { $divide: [{ $dayOfMonth: '$date' }, 7] } }
        }
      },
      {
        $group: {
          _id: null,
          totalMonthlyHours: { $sum: '$hours' },
          workingDays: { $addToSet: '$dayString' },
          weeklyHours: { $push: { week: '$week', hours: '$hours' } },
          dailyTotals: { $push: { date: '$dayString', hours: '$hours' } }
        }
      },
      {
        $project: {
          _id: 0,
          monthlyTotal: '$totalMonthlyHours',
          workingDays: { $size: '$workingDays' },
          dailyTotals: 1,
          weeklyTotals: {
            $map: {
              input: [1, 2, 3, 4, 5, 6],
              as: 'w',
              in: {
                week: '$$w',
                hours: {
                  $sum: {
                    $map: {
                      input: '$weeklyHours',
                      as: 'wh',
                      in: {
                        $cond: [
                          { $eq: ['$$wh.week', '$$w'] },
                          '$$wh.hours',
                          0
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.json(summary[0] || { msg: 'No data available' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
function getDateRangeArray(start, end) {
  const arr = [];
  let dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}

exports.applyLeaveToTimesheet = async (employeeEmail, start, end) => {
  const dates = getDateRangeArray(start, end);

  for (const date of dates) {
    await TimeEntry.findOneAndUpdate(
      { officialEmail: employeeEmail, date },
      {
        isLeave: true,
        isLocked: true,
        category: "Leave",
        projectName: "Leave",
        projectCode: "-",
        projectType: "N/A",
        hours: 0,
      },
      { upsert: true } // Create entry if not exists
    );

    await updateTimeSummary(employeeEmail, date);
  }
};

module.exports = exports;