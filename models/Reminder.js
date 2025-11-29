const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  title: { type: String, required: true },
  reminderDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reminder", reminderSchema);
