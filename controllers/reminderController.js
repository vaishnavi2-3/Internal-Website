const Reminder = require("../models/Reminder");

exports.addReminder = async (req, res) => {
  try {
    const { employeeId, title, reminderDate } = req.body;

    if (!employeeId || !title || !reminderDate) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const reminder = await Reminder.create({
      employeeId,
      title,
      reminderDate: new Date(reminderDate)
    });

    return res.status(201).json({ msg: "Reminder added", reminder });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getWeeklyReminders = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start of week (Monday)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + 1);

    // End of week (Sunday)
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    const reminders = await Reminder.find({
      employeeId,
      reminderDate: {
        $gte: firstDay,
        $lte: lastDay
      }
    }).sort({ reminderDate: 1 });

    return res.json({ weekStart: firstDay, weekEnd: lastDay, reminders });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
