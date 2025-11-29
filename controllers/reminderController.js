const Reminder = require("../models/Reminder");

exports.addReminder = async (req, res) => {
  try {
    const { title, reminderDate } = req.body;

    if (!title || !reminderDate) {
      return res.status(400).json({ msg: "Title and date are required" });
    }

    const reminder = await Reminder.create({
      title,
      reminderDate: new Date(reminderDate)
    });

    return res.status(201).json({
      msg: "Reminder added successfully",
      reminder
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getWeeklyReminders = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start of week (Monday)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + 1);
    firstDay.setHours(0, 0, 0, 0);

    // End of week (Sunday)
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);

    // Fetch reminders for this week
    const reminders = await Reminder.find({
      reminderDate: {
        $gte: firstDay,
        $lte: lastDay
      }
    }).sort({ reminderDate: 1 });

    return res.json({
      weekStart: firstDay,
      weekEnd: lastDay,
      reminders
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
