const TimeEntry = require("../models/TimeEntry");
const Leave = require("../models/leave");
const { updateTimeSummary } = require("../services/updateTimeSummary");


// --------------------------------------------------------
// CREATE Timesheet Entry
// --------------------------------------------------------
exports.createTimeEntry = async (req, res) => {
  try {
    const employeeEmail = req.user.email;
    const { date, category, projectName, projectCode, projectType, hours } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });

    // 1️⃣ Block entry if leave exists for this date
    const leaveExists = await Leave.findOne({
      officialEmail: employeeEmail,
      status: "Approved",
      fromDate: { $lte: date },
      toDate: { $gte: date }
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Cannot create timesheet for ${date}. Approved leave exists.`
      });
    }

    // 2️⃣ Block duplicate entry
    const existingEntry = await TimeEntry.findOne({ employeeEmail, date });
    if (existingEntry) {
      return res.status(400).json({ msg: "Timesheet already filled for this date." });
    }

    // 3️⃣ Insert timesheet
    const timeEntry = await TimeEntry.create({
      employeeEmail,
      date,
      category,
      projectName,
      projectCode,
      projectType,
      hours,
    });

    // ⭐⭐⭐ UPDATE SUMMARY AFTER INSERT ⭐⭐⭐
    await updateTimeSummary(employeeEmail, date);

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
    const employeeEmail = req.user.email;

    const entries = await TimeEntry.find({ employeeEmail }).sort({ date: -1 });

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
    const employeeEmail = req.user.email;
    const { date } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });

    const leaveExists = await Leave.findOne({
      officialEmail: employeeEmail,
      status: "Approved",
      fromDate: { $lte: date },
      toDate: { $gte: date }
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Timesheet cannot be updated. Leave approved for ${date}.`
      });
    }

    const updatedEntry = await TimeEntry.findOneAndUpdate(
      { employeeEmail, date },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ msg: "No timesheet found for this date." });
    }

    // ⭐⭐⭐ SUMMARY UPDATE ⭐⭐⭐
    await updateTimeSummary(employeeEmail, date);

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
    const employeeEmail = req.user.email;
    const { date } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });

    // 1️⃣ Block if approved leave
    const leaveExists = await Leave.findOne({
      officialEmail: employeeEmail,
      status: "Approved",
      fromDate: { $lte: date },
      toDate: { $gte: date }
    });

    if (leaveExists) {
      return res.status(400).json({
        msg: `❌ Cannot update timesheet. Leave approved for ${date}.`
      });
    }

    const updatedEntry = await TimeEntry.findOneAndUpdate(
      { employeeEmail, date },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ msg: "Timesheet entry not found." });
    }
    await updateTimeSummary(employeeEmail, date);


    res.status(200).json({ msg: "Timesheet partially updated", updatedEntry });
  } catch (error) {
    res.status(500).json({ msg: "Error patching timesheet", error: error.message });
  }
};
