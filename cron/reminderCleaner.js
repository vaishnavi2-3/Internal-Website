const cron = require("node-cron");
const Reminder = require("../models/Reminder");

// ⏳ Runs every night at 12:00 AM India Time
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Reminder.deleteMany({
      reminderDate: { $lt: today }
    });

    console.log("🧹 Old reminders cleaned");
  } catch (err) {
    console.error("Cron Error:", err);
  }
});
