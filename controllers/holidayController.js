const PublicHoliday = require("../models/publicHoliday");

// ➕ Add multiple holidays at once
exports.addMultipleHolidays = async (req, res) => {
  try {
    const holidays = req.body; // expecting array of objects
    if (!Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({ msg: "Invalid or empty holiday data" });
    }

    // Add month and year automatically
    const enriched = holidays.map((h) => ({
      ...h,
      month: new Date(h.date).toLocaleString("default", { month: "long" }),
      year: new Date(h.date).getFullYear(),
    }));

    await PublicHoliday.insertMany(enriched, { ordered: false });

    res.status(201).json({
      msg: "✅ Holidays added successfully",
      count: holidays.length,
    });
  } catch (error) {
    console.error("❌ Error adding holidays:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Some holidays already exist (duplicate dates)" });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// 📅 Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await PublicHoliday.find().sort({ date: 1 });
    res.status(200).json({ count: holidays.length, holidays });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// 📆 Get by month & year (e.g. for timesheet)
exports.getHolidaysByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;

    // Convert month name or number into numeric month (1–12)
    const monthNumber = isNaN(month)
      ? new Date(`${month} 1, ${year}`).getMonth() + 1
      : parseInt(month);

    // Compute start and end of the month
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 0);

    // Filter by date range
    const holidays = await PublicHoliday.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.status(200).json({ count: holidays.length, holidays });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};


// 🔹 POST to add a new holiday
exports.addHoliday = async (req, res) => {
  try {
    const { date, name, type, notes } = req.body;
    const existing = await PublicHoliday.findOne({ date });
    if (existing)
      return res.status(400).json({ msg: "Holiday already exists for this date" });

    const holiday = new PublicHoliday({ date, name, type, notes });
    await holiday.save();

    res.status(201).json({
      msg: "✅ Holiday added successfully",
      holiday,
    });
  } catch (error) {
    console.error("❌ Error adding holiday:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
exports.getHRUpcomingHolidays = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const upcoming = await PublicHoliday.find({
      date: { $gte: today, $lte: nextWeek }
    }).sort({ date: 1 });

    res.status(200).json({
      msg: "Upcoming holidays for HR dashboard (next 7 days)",
      count: upcoming.length,
      holidays: upcoming,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
