const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  notes: { type: String },
});

module.exports = mongoose.model("PublicHoliday", holidaySchema);
