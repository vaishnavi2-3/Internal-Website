const TimeEntry = require("../models/TimeEntry");
const Leave = require("../models/leave");
const { updateTimeSummary } = require("../services/updateTimeSummary");
const TimeSummary = require("../models/TimeSummary");



// --------------------------------------------------------
// CREATE Timesheet Entry
// --------------------------------------------------------
exports.createTimeEntry = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { date, category, projectName, projectCode, projectType, hours } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });
    const formattedDate = new Date(date);


    // 1️⃣ Block entry if leave exists for this date
    const leaveExists = await Leave.findOne({
      officialEmail: officialEmail,
      status: "Approved",
      fromDate: { $lte: formattedDate },   // 🔥 UPDATE HERE
      toDate: { $gte: formattedDate }      // 🔥 UPDATE HERE
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Cannot create timesheet for ${date}. Approved leave exists.`
      });
    }

    // 2️⃣ Block duplicate entry
    const existingEntry = await TimeEntry.findOne({ officialEmail, date });
    if (existingEntry) {
      return res.status(400).json({ msg: "Timesheet already filled for this date." });
    }

    // 3️⃣ Insert timesheet
    const timeEntry = await TimeEntry.create({
      officialEmail,
      date: formattedDate,       // 🔥 FIXED

      category,
      projectName,
      projectCode,
      projectType,
      hours,
    });

    // ⭐⭐⭐ UPDATE SUMMARY AFTER INSERT ⭐⭐⭐
    await updateTimeSummary(officialEmail, formattedDate); // 🔥 UPDATE HERE

    res.status(201).json({
      msg: "Timesheet created successfully",
      timeEntry,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error creating timesheet", error: error.message });
  }
};

// --------------------------------------------------------
// GET Logged-in Employee Timesheets
// --------------------------------------------------------
exports.getMyTimeEntries = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    const entries = await TimeEntry.find({ officialEmail }).sort({ date: -1 });

    if (!entries.length) {
      return res.status(404).json({ msg: "No timesheet entries found." });
    }

    res.status(200).json({ count: entries.length, entries });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching entries", error: error.message });
  }
};

// --------------------------------------------------------
// UPDATE (PUT) Timesheet
// --------------------------------------------------------
exports.updateTimeEntryByEmail = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { date } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });
        const formattedDate = new Date(date);


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

    const updatedEntry = await TimeEntry.findOneAndUpdate(
      { officialEmail, date: formattedDate },  // 🔥 UPDATE HERE
      { ...req.body, date: formattedDate },    // 🔥 UPDATE HERE
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ msg: "No timesheet found for this date." });
    }

    // ⭐⭐⭐ SUMMARY UPDATE ⭐⭐⭐
    await updateTimeSummary(officialEmail, formattedDate); // 🔥 UPDATE HERE

    res.status(200).json({ msg: "Timesheet updated", updatedEntry });
  } catch (error) {
    res.status(500).json({ msg: "Error updating timesheet", error: error.message });
  }
};

// --------------------------------------------------------
// PARTIAL UPDATE (PATCH)
// --------------------------------------------------------
exports.patchTimeEntryByEmail = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const { date } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });
        const formattedDate = new Date(date);


    // 1️⃣ Block if approved leave
    const leaveExists = await Leave.findOne({
      officialEmail: officialEmail,
      status: "Approved",
      fromDate: { $lte: formattedDate },  // 🔥 UPDATE
      toDate: { $gte: formattedDate }     // 🔥 UPDATE
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Cannot update timesheet. Leave approved for ${date}.`
      });
    }

    const updatedEntry = await TimeEntry.findOneAndUpdate(
      { officialEmail, date: formattedDate }, // 🔥 UPDATE
      { $set: { ...req.body, date: formattedDate } }, // 🔥 UPDATE
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ msg: "Timesheet entry not found." });
    }
    await updateTimeSummary(officialEmail, formattedDate); // 🔥 UPDATE


    res.status(200).json({ msg: "Timesheet partially updated", updatedEntry });
  } catch (error) {
    res.status(500).json({ msg: "Error patching timesheet", error: error.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    console.log("Looking for summary =>", officialEmail, month, year);

    const summary = await TimeSummary.findOne({
      officialEmail,
      month,
      year
    });

    console.log("Found summary:", summary);

    if (!summary) {
      return res.status(404).json({ msg: "No time summary found for this month." });
    }

    res.status(200).json(summary);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
exports.getFilledEmployeesByMonth = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ msg: "month and year are required" });
    }

    const employees = await TimeSummary.find({
      month,
      year,
      dailyTotals: { $exists: true, $ne: [] }  // must have entries
    }).select("officialEmail monthlyTotal weeklyTotals workingDays dailyTotals");

    res.status(200).json({
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
exports.getMonthlySummary = async (req, res) => {
  const officialEmail = req.user.email;
  const month = req.query.month;
  const year = req.query.year;

  const summary = await TimeSummary.findOne({ officialEmail, month, year });
  res.json(summary);
};
exports.getMonthYearFromTimeEntry = async (req, res) => {
  try {
    const officialEmail = req.user.email;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

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
          dayString: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          week: {
            $ceil: { $divide: [{ $dayOfMonth: "$date" }, 7] }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMonthlyHours: { $sum: "$hours" },
          workingDays: { $addToSet: "$dayString" },
          weeklyHours: {
            $push: {
              week: "$week",
              hours: "$hours"
            }
          },
          dailyTotals: {
            $push: {
              date: "$dayString",
              hours: "$hours"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          monthlyTotal: "$totalMonthlyHours",
          workingDays: { $size: "$workingDays" },
          dailyTotals: 1,
          weeklyTotals: {
            $map: {
              input: [1, 2, 3, 4, 5, 6],
              as: "w",
              in: {
                week: "$$w",
                hours: {
                  $sum: {
                    $map: {
                      input: "$weeklyHours",
                      as: "wh",
                      in: {
                        $cond: [
                          { $eq: ["$$wh.week", "$$w"] },
                          "$$wh.hours",
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

    res.json(summary[0] || { msg: "No data available" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
exports.getSummaryByEmail = async (req, res) => {
  try {
    const { email, month, year } = req.query;

    const summary = await TimeSummary.findOne({
      officialEmail: email,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (!summary) {
      return res.status(404).json({ msg: "No summary found" });
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.getAllEmployeeMonthlySummaries = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const list = await TimeSummary.find({
      month,
      year,
      dailyTotals: { $exists: true, $ne: [] }
    }).select("officialEmail monthlyTotal weeklyTotals workingDays dailyTotals");

    res.json({ count: list.length, summaries: list });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.getMonthYearList = async (req, res) => {
  try {
    const officialEmail = req.user.email;

    const list = await TimeSummary.find({ officialEmail })
      .select("month year monthlyTotal workingDays")
      .sort({ year: -1, month: -1 });

    res.json(list);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
